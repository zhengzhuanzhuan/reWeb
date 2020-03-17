<template>
	<div class="org-tree" :style="`width: ${selfWidth}`">
		<h3 slot="title" v-show="selfWidth !== '0px'">组织管理</h3>
		<Button icon="ios-arrow-back" type="text" @click="selfWidth='0px'" class="menu-left-shrink" v-show="selfWidth === '220px'"></Button>
		<Button icon="ios-arrow-forward" type="text" @click="selfWidth='220px'" class="menu-left-expand" v-show="selfWidth === '0px'"></Button>
		<Tree :data="menuList" @on-select-change="selectTree" v-show="selfWidth !== '0px'" :style="orgScroll?'height: 100%':'height: 60vh'"></Tree>
	</div>
</template>

<script>
import { formatToTreeData } from '@/libs/businessUtil'
export default {
    name: 'organization-shrnk',
    data () {
    	return {
    		selfWidth: '220px',
            menuList: []
        }
    },
    props: {
        isAllOrg: {
            type: Boolean,
            default: false
        },
        orgScroll:{
            type: Boolean,
            default: false
        }
    },
    methods: {
        selectTree (data) {
        	this.$emit('chosen', data)
        },
        /**
		 * @description: 左侧组织结构数据
		 * @return: {Promise<void>}
		 */
        async getMenuList () {
            let res = null
            if (this.isAllOrg) {
                res = await this.$API.organizeManage.list({ limit: 10000 })
            } else {
                res = await this.$API.organizeManage.orangeList({ userId: sessionStorage.getItem('rsysUserId') })
            }
            const resData = res.data || []
            this.menuList = formatToTreeData({
                shouldGetParentNameArr: true,
                baseArr: resData,
                parentIdName: 'parentId',
                idName: 'organizationId',
                sortName: 'sort',
                expand: true,
                childrenFn: function (item) {
                    return {
                        organizationId: item.organizationId,
                        title: item.name,
                        parentId: item.parentId,
                        sort: item.sort,
                        expand: true,
                        description: item.description,
                        children: []
                    }
                }
            })
            localStorage.setItem('orgId', this.menuList && this.menuList[0].organizationId)
        }
    },
    mounted () {
    	this.getMenuList()
    }
}
</script>

<style lang="less" scoped>
	.org-tree{
		float: left;
        height: 100%;
		background-color: #fafafa;
		padding: 22px;
        position: relative;
		h3{
			display: inline-block;
		}
		.ivu-btn{
			position: absolute;
			top: 13px;
			right: 0;
		}
		.ivu-tree{
		// 	height: 60vh;
			overflow: auto;
		}
	}
</style>
