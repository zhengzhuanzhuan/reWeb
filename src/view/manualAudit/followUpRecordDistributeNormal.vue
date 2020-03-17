<template>
	<div>
		<Row class="user_main_search common_search" :gutter="20">
			<Col span="5">
				<span>随访类型</span>
				<Select v-model="searchParams.followupType" clearable>
					<Option v-for="item in followupTypeOptions" :value="item.planTypeId" :key="item.planTypeId">{{item.planTypeName}}</Option>
				</Select>
			</Col>
			<Col span="5">
				<span>患者姓名</span>
				<Input v-model="searchParams.brxm" placeholder="患者姓名"></Input>
			</Col>
			<Col span="5">
				<span>随访方案</span>
				<Input v-model="searchParams.schemeName" placeholder="随访方案"></Input>
			</Col>
			<Col span="9">
				<span>执行时间</span>
				<date-time-picker :timeBegin.sync="searchParams.dateEndBegin" :timeEnd.sync="searchParams.dateEndEnd" :is-default-today="true"></date-time-picker>
			</Col>
			<Col span="5">
				<span>分配状态</span>
				<Select v-model="searchParams.disStatus" clearable>
					<Option value="1">已分配</Option>
					<Option value="0">未分配</Option>
				</Select>
			</Col>
			<Col span="2">
				<Button @click="handlePage(1)" type="primary" :loading="tableParams.isLoading">查询</Button>
			</Col>
		</Row>
		<Card style="overflow: auto;">
			<organization-shrink @chosen="selectTree" ref="orgTree" style="float:left;"></organization-shrink>
			<div style="overflow: auto;">
				<div>
					<Table :columns="configAll" :data="tableParams.data" :loading="tableParams.isLoading" class="table"></Table>
				</div>
				<Row>
					<Col span="6" class="page-left-btns">
						<Button type="primary" class="margin-right-20" :disabled="!tableParams.data.length" @click="handleAddCurrentPage">添加当页</Button>
						<Button type="primary" :disabled="!tableParams.total" @click="handleDistribute('all')">添加所有</Button>
					</Col>
					<Page :total="tableParams.total" :page-size="searchParams.limit" show-total :current="searchParams.pager" @on-change="handlePage"></Page>
				</Row>
				<Divider />
				<div class="page-bottom-btns">
					<Button type="primary" class="margin-right-20" :disabled="!chosenTableData.length" @click="isRecordDrawerShow=true">已添加{{chosenTableData.length}}条</Button>
					<Button type="primary" :disabled="!chosenTableData.length" @click="handleDistribute">分配</Button>
				</div>
			</div>
		</Card>
		<!--已添加的数据弹框-->
		<Drawer
			title="已添加记录"
			v-model="isRecordDrawerShow"
			width="40"
			:mask-closable="false"
		>
			<div class="margin-bottom-10">已添加{{chosenTableData.length}}条</div>
			<Table :columns="configChosen" :data="chosenTableData"></Table>
		</Drawer>
		<!--选择分配用户-->
		<Drawer
			title="分配数据"
			v-model="isUserDrawerShow"
			width="60"
			:mask-closable="false"
		>
			<div class="margin-bottom-10">
				<span class="margin-right-20">分配数据{{isAddAll ? tableParams.total : chosenTableData.length}}条</span>
				<span>请选择分配人员</span>
			</div>
			<Card style="overflow: auto;">
				<organization-shrink @chosen="selectTreeModal" ref="orgTree" style="float:left;"></organization-shrink>
				<div style="overflow: auto">
					<Row class="user_main_search common_search" :gutter="20">
						<Col span="18">
							<span>真实姓名</span>
							<Input v-model="searchParamsUser.realName"></Input>
						</Col>
						<Col span="6">
							<Button @click="handleQueryUser" type="primary" :loading="tableParamsUser.isLoading">查询</Button>
						</Col>
					</Row>
					<Table :columns="configUser" highlight-row :data="tableParamsUser.data" :loading="tableParamsUser.isLoading" @on-row-click="handleRowClick"></Table>
				</div>
			</Card>
			<Divider />
			<div class="page-bottom-btns">
				<Button type="primary" :disabled="chosenUserId === ''" @click="postData">分配</Button>
			</div>
		</Drawer>
	</div>
</template>

<script>
import organizationShrink from '../common-components/organization-shrink'
import dateTimePicker from '../common-components/date-time-picker'
const baseConfig = [
    {
        title: '患者姓名',
        key: 'brxm'
    },
    {
        title: '随访方案',
        key: 'schemeName'
    },
    {
        title: '随访类型',
        key: 'followupTypeName'
    },
    {
        title: '执行日期',
        key: 'dateEnd'
    },
    {
        title: '已分配人员',
        key: 'disRealName',
        render: (h, params) => {
            return h('span', params.row.disRealName || '未分配')
        }
    }
]
export default {
    name: 'followUpRecordDistributeNormal',
    components: {
        organizationShrink,
        dateTimePicker
    },
    data () {
        return {
        	chosenUserId: '',
        	isAddAll: false,
        	chosenTableData: [], // 已添加的数据
            isRecordDrawerShow: false,
            isUserDrawerShow: false,
            followupTypeOptions: [],
            searchParams: {
                followupType: '',
                brxm: '',
                schemeName: '',
                dateEndBegin: '', // 执行时间
                dateEndEnd: '',
                disStatus: '',
                organizationId: '',
                pager: 1,
                limit: 10,
                sort: '', // 排序字段
                order: '', // 排序方式:降序 DESC 升序 ASC
                userId: sessionStorage.getItem('rsysUserId')
            },
            tableParams: {
                data: [],
                total: 0,
                isLoading: false
            },
            // 用户弹框
            searchParamsUser: {
                organizationId: '',
                realName: '',
                limit: 10000,
                sort: '', // 排序字段
                order: '' // 排序方式:降序 DESC 升序 ASC
            },
            tableParamsUser: {
                data: [],
                isLoading: false
            },
            configUser: [
                {
                    title: '用户名',
                    key: 'userName'
                },
                {
                    title: '真实姓名',
                    key: 'realName'
                }
            ],
            // 列表配置
            configAll: [
                ...baseConfig,
                {
                    title: '操作',
                    key: 'action',
                    width: 100,
                    align: 'center',
                    render: (h, params) => {
                        return h('div', [
                            h(
                                'Button',
                                {
                                    props: {
                                        size: 'small',
                                        type: params.row.isChosen ? 'default' : 'primary',
                                        disabled: params.row.isChosen
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.handleAdd(params.row, params.index)
                                        }
                                    }
                                },
                                params.row.isChosen ? '已添加' : '添加'
                            )
                        ])
                    }
                }
            ],
            // drawer 列表配置
            configChosen: [
                ...baseConfig,
                {
                    title: '操作',
                    key: 'action',
                    width: 100,
                    align: 'center',
                    render: (h, params) => {
                        return h('div', [
                            h(
                                'Button',
                                {
                                    props: {
                                        size: 'small',
                                        type: 'primary'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                        	this.handleRemove(params.row.recordId, params.index)
                                        }
                                    }
                                },
                                '移除'
                            )
                        ])
                    }
                }
            ]
        }
    },
    methods: {
        /**
			 * @description 获取列表数据
			 */
        /**
		 * 数据格式化
		 */
        formData (data, chosenData, idParamName, chosenParamName) {
            for (let item of data) {
                for (let ite of chosenData) {
                    if (item[idParamName] === ite[idParamName]) {
                        item[chosenParamName] = true
                    }
                }
            }
            return data
        },
        async handleQuery () {
            this.tableParams.isLoading = true
            const res = await this.$API.followupDistribute.list(this.searchParams).catch(e => {
                this.tableParams.isLoading = false
            })
            this.tableParams.data = this.formData(res.data, this.chosenTableData, 'recordId', 'isChosen')
            this.tableParams.total = res.total
            this.tableParams.isLoading = false
        },
        handlePage (pager) {
            this.searchParams.pager = pager
            this.handleQuery()
        },
        /**
			 * @description 左侧组织选中数据处理
			 * @param data
			 */
        selectTree (data) {
            if (!data.length) {
                this.searchParams.organizationId = ''
            } else {
                this.searchParams.organizationId = data[0].organizationId
            }
            this.handleQuery()
        },
        /**
			 * @description 获取头部筛选项的数据
			 */
        async getOptionsData () {
            // 随访类型
            const res1 = await this.$API.planManage.planTypeList({ limit: 9999, pager: 1 })
            this.followupTypeOptions = res1.data
        },
        /**
		 * @description 表格按钮方法 --添加
		 * @param rowData
		 * @param index
		 */
        handleAdd (rowData, index, isChosen = null) {
            let copyData = JSON.parse(JSON.stringify(rowData))
            if (isChosen !== null) {
            	copyData.isChosen = isChosen
            } else {
                copyData.isChosen = !rowData.isChosen
            }
            this.tableParams.data.splice(index, 1, copyData)
            this.chosenTableData.push(copyData)
        },
        /**
		 * @description 选中draswer中的移除按钮
		 */
        handleRemove (id, index) {
        	this.chosenTableData.splice(index, 1)
            this.tableParams.data.forEach(item => {
                if (item.recordId === id) {
                    item.isChosen = false
                }
            })
        },
        /**
		 * @description 添加当前页
		 */
        handleAddCurrentPage () {
            this.tableParams.data.forEach((item, index) => {
            	if (!item.isChosen) {
                    this.handleAdd(item, index)
                }
            })
        },
        /**
		 * @description 添加所有('all')/分配()
		 */
        handleDistribute (type = 'ids') {
        	if (type === 'all') {
        		this.isAddAll = true
            } else {
        		this.isAddAll = false
            }
        	this.isUserDrawerShow = true
            this.searchParamsUser.realName = ''
            this.searchParamsUser.organizationId = ''
            this.handleQueryUser()
        },
        // 分配弹框块方法
        async handleQueryUser () {
            this.tableParamsUser.isLoading = true
            const res = await this.$API.userManage.list(this.searchParamsUser).catch(e => {
                this.tableParamsUser.isLoading = false
            })
            this.tableParamsUser.data = res.data
            this.tableParamsUser.isLoading = false
            this.chosenUserId = ''
        },
        selectTreeModal (data) {
            if (!data.length) {
                this.searchParamsUser.organizationId = ''
            } else {
                this.searchParamsUser.organizationId = data[0].organizationId
            }
            this.handleQueryUser()
        },
        handleRowClick (rowData) {
        	this.chosenUserId = rowData.userId
        },
        async postData () {
        	const postData = JSON.parse(JSON.stringify(this.searchParams))
        	if (this.isAddAll) {
        		postData.isAll = 1
                postData.recordIds = []
            } else {
        		postData.isAll = 0
                const ids = []
                this.chosenTableData.forEach(item => {
                    ids.push(item.recordId)
                })
                postData.recordIds = ids
            }
            postData.disUserId = this.chosenUserId
            postData.userId = sessionStorage.getItem('rsysUserId')
            await this.$API.followupDistribute.add(postData)
            this.isUserDrawerShow = false
            this.$Message.success('提交成功！')
            this.handleQuery()
        }
    },
    mounted () {
        this.getOptionsData()
        this.handleQuery()
    }
}
</script>

<style lang="less">
	.page-left-btns{
		margin: 16px 0 0 16px;
	}
	.page-bottom-btns {
		text-align: center;
	}
</style>
