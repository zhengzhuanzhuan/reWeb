<style lang="less" scoped>
.role {
	&-drawer {
		p {
			padding: 10px;
			label {
				color: #999;
			}
		}
		.blue {
			color: #2d8cf0;
		}
		h3 {
			border-top: 1px solid #e8eaec;
			padding-top: 10px;
		}
		.ivu-tree {
			max-height: calc(~'100% - 250px');
			overflow-y: auto;
		}
		&-footer {
			border-top: 1px solid #e8eaec;
			padding: 20px 80px 0;
		}
	}
}
</style>

<template>
    <div class="role">
        <div class="role_main">
            <Row class="business_main_header common_search" :gutter="20">
				<Col span="6">
					<span>角色名称</span>
					<Input v-model="searchParams.roleName" placeholder="角色名称"></Input>
				</Col>
				<Col span="2">
					<Button @click="changePage(1)" type="primary" :loading="tableParams.isLoading">查询</Button>
					<Button @click="addEditRole('')" v-permission="this.$API.roleManage.create">添加角色</Button>
				</Col>
            </Row>
			<Card>
				<div class="role_main_list">
					<Table :columns="config" :data="tableParams.data" :loading="tableParams.isLoading"></Table>
				</div>
				<Row class="role_main_page" v-if="tableParams.total">
					<Page show-total :total="tableParams.total" :current="searchParams.pager" :page-size="searchParams.limit" @on-change="changePage"></Page>
				</Row>
			</Card>
        </div>
        <Drawer title="查看角色"
				class-name="role-drawer"
                v-model="isDrawerShow"
                width="30"
                :mask-closable="false">
            <p><label>角色名称：</label>{{detailData.roleName}}</p>
            <p><label>角色说明：</label>{{detailData.remark}}</p>
            <h3>随访类型权限</h3>
            <p class="blue">{{detailData.activeType || '暂无'}}</p>
            <h3>菜单和功能权限</h3>
            <Tree :data="detailData.treeData"></Tree>
			<div class="role-drawer-footer">
				<Button type="primary" @click="addEditRole(detailData, 'edit')" v-permission="this.$API.roleManage.update">编辑</Button>
				<Button type="error" @click="delRole(detailData.roleId)" style="float: right;" v-permission="this.$API.roleManage.delete">删除</Button>
			</div>
        </Drawer>
    </div>
</template>

<script>
import { handleDeleteRefresh } from '@/libs/businessUtil'
export default {
    name: 'role-manage',
    data () {
        return {
        	activeTypeMap: {},
            isDrawerShow: false,
            detailData: {
                roleName: '',
                remark: '',
                activeType: '',
                treeData: []
            },
            searchParams: {
                pager: 1,
                roleName: '', // 角色名称
                limit: 10
            },
            tableParams: {
                data: [],
                total: 0,
                isLoading: false
            },
            config: [
                {
                    title: '角色名称',
                    key: 'roleName'
                },
                {
                    title: '说明',
                    key: 'remark'
                },
                {
                    title: '操作',
                    key: 'action',
                    width: 200,
                    render: (h, params) => {
                        return h('div', [
                            h('Button', {
                                props: {
                                    type: 'text',
                                    size: 'small'
                                },
                                style: {
                                    marginRight: '5px'
                                },
                                directives: [
                                    {
                                        name: 'permission',
                                        value: this.$API.roleManage.getActiveTypeSelected
                                    }
                                ],
                                on: {
                                    click: () => {
                                        this.handleDetail(params.row)
                                    }
                                }
                            }, '查看'),
                            h('Button', {
                                props: {
                                    type: 'text',
                                    size: 'small'
                                },
                                style: {
                                    marginRight: '5px'
                                },
                                directives: [
                                    {
                                        name: 'permission',
                                        value: this.$API.roleManage.update
                                    }
                                ],
                                on: {
                                    click: () => {
                                        this.addEditRole(params.row)
                                    }
                                }
                            }, '编辑'),
                            h('Button', {
                                props: {
                                    type: 'text',
                                    size: 'small'
                                },
                                directives: [
                                    {
                                        name: 'permission',
                                        value: this.$API.roleManage.delete
                                    }
                                ],
                                style: {
                                    display: params.row.canDelete === 0 ? 'inline-block' : 'none'
                                },
                                on: {
                                    click: () => {
                                    	if (params.row.canDelete === 0) {
                                            this.delRole(params.row.roleId)
                                        }
                                    }
                                }
                            }, '删除')
                        ])
                    }
                }
            ]
        }
    },
    methods: {
        /**
         * 分页改变,返回点击后的分页代码
         */
        changePage (index) {
            this.searchParams.pager = index
            this.getData()
        },
        /**
         * 获取数据
         */
        getData () {
        	this.tableParams.isLoading = true
            this.$API.roleManage.list(this.searchParams).then((res) => {
                this.tableParams.data = res.data || []
                this.tableParams.total = res.total
                this.tableParams.isLoading = false
            }).catch((err) => {
                console.error(err)
                this.tableParams.isLoading = false
            })
        },
        /**
        * 新增/编辑角色
        */
        addEditRole (rowData) {
            const type = rowData ? 1 : 0
            const params = {
                roleId: rowData.roleId,
                roleName: rowData.roleName,
                remark: rowData.remark
            }
            this.$router.push({
                path: '/user-role/role-edit',
                query: {
                    type: type,
                    detail: type == 0 ? null : JSON.stringify(params)
                }
            })
            this.isDrawerShow = false
        },
        /**
     * @description 删除方法
     * @param id
     */
        delRole (id) {
            this.$Modal.confirm({
                title: '删除角色',
                content: '确定删除该角色？',
                onOk: () => {
                    this.$API.roleManage.delete({
                        ids: id
                    }).then((res) => {
                        this.$Message.success('删除成功')
                        this.isDrawerShow = false
                        handleDeleteRefresh('searchParams', 'tableParams', 'getData', this)
                    }).catch((err) => {
                        console.error(err)
                    })
                }
            })
        },
        /**
     * @description 查看方法
     */
        async handleDetail (rowData) {
            this.isDrawerShow = true
            this.detailData.roleId = rowData.roleId
            this.detailData.roleName = rowData.roleName
            this.detailData.remark = rowData.remark
            // 获取 随访类型权限，菜单和功能权限 数据
            const postData = {
                roleId: rowData.roleId,
                limit: 9999
            }
            const activeTypeData = await this.$API.roleManage.getActiveTypeSelected(postData)
            const activeTypeArr = []
            if (activeTypeData.data) {
                activeTypeData.data.forEach(item => {
                	if (this.activeTypeMap[item.activeId]) {
                        activeTypeArr.push(this.activeTypeMap[item.activeId])
                    }
                })
            }
            this.detailData.activeType = activeTypeArr.join(' | ')
            const menuData = await this.$API.roleManage.getMenuSelected(postData)
            this.detailData.treeData = this.formatTreeData(menuData.data || [])
        },
        formatTreeData (data) {
            let result = []
            let systemArr = []
            data.forEach(item => {
                if (item.parentMentId === '0' || item.parentMentName === '') {
                    systemArr.push(item.systemName)
                }
            })
            systemArr = [...new Set(systemArr)]
            systemArr.forEach(item => {
                result.push({
                    title: item,
                    expand: true,
                    children: []
                })
            })
            data.forEach(item => {
                result.forEach(per => {
                    if ((item.parentMentId === '0' || item.parentMentName === '') && item.systemName === per.title) {
                        per.children.push({
                            title: item.menuName,
                            expand: true,
                            children: formatChildren(item.menuId, data),
                            menuSort: item.menuSort
                        })
                    }
                })
            })
            result.forEach(item => {
                item.children.sort(function (a, b) { // 排序
                    return (b.menuSort - a.menuSort)
                })
            })
            function formatChildren (parentMentId, allData) {
                const res = []
                allData.forEach(item => {
                    if (item.parentMentId === parentMentId) {
                        res.push({
                            title: item.menuName,
                            expand: true,
                            children: formatChildren(item.menuId, allData),
                            menuSort: item.menuSort
                        })
                    }
                })
                res.sort(function (a, b) { // 排序
                    return (b.menuSort - a.menuSort)
                })
                return res
            }
            return result
        },
        /**
		 * @description 随访计划类型 数据
		 */
        async getPlanType () {
            const res = await this.$API.planManage.planTypeList({ limit: 9999, pager: 1 })
            res.data.forEach(item => {
                this.activeTypeMap[item.planTypeId] = item.planTypeName
            })
        }
    },
    mounted () {
        this.getData()
        this.getPlanType()
    }
}
</script>
