<template>
    <div class="main">
		<organization-shrink @chosen="selectTree" ref="orgTree" :is-all-org="true"></organization-shrink>
		<organization-component ref="organize" :baseInfo="chosenBaseInfo" v-show="chosenBaseInfo.parentId" @update="handleTreeUpdate"></organization-component>
		<div v-show="!chosenBaseInfo.parentId" class="main-tip ivu-alert-warning">请先在左侧选择组织!</div>
    </div>
</template>

<script>
import organizationComponent from './organization-component'
import organizationShrink from '../common-components/organization-shrink'
export default {
    name: 'organization-page',
    components: {
        organizationComponent,
        organizationShrink
    },
    data () {
        return {
            menuList: [], // 树形结构主级别数据
            chosenBaseInfo: {} // 选中的组织信息
        }
    },
    methods: {
        selectTree (data) {
        	// console.log(data)
            if (!data.length) {
        		this.chosenBaseInfo = {}
                return false
            }
            this.chosenBaseInfo = data[0]
            this.$refs.organize.getTableData(data[0].organizationId)
        },
        handleTreeUpdate () {
        	this.$refs.orgTree.getMenuList()
        }
    }
}
</script>

<style lang="less" scoped>
	.main{
		height: 100%;
		&-tip{
			text-align: center;
			font-size: 16px;
		}
	}
</style>
