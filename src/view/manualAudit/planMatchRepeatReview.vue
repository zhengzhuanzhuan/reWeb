<template>
	<div>
		<Row class="user_main_search common_search" :gutter="20">
			<Col span="6">
				<span>患者姓名</span>
				<Input v-model="searchParams.brxm" placeholder="患者姓名"></Input>
			</Col>
			<Col span="6">
				<span>联系电话</span>
				<Input v-model="searchParams.mobile" placeholder="联系电话"></Input>
			</Col>
			<Col span="6">
				<span>随访方案</span>
				<Input v-model="searchParams.schemeName" placeholder="随访方案"></Input>
			</Col>
			<Col span="2">
				<Button @click="handlePage(1)" type="primary" :loading="tableParams.isLoading">查询</Button>
			</Col>
		</Row>
		<Card style="overflow: auto;">
			<organization-shrink @chosen="selectTree" ref="orgTree" style="float:left;"></organization-shrink>
			<div style="overflow: auto;">
				<div>
					<Table :columns="config" :data="tableParams.data" :loading="tableParams.isLoading" class="table-btn-fixed-width"></Table>
				</div>
				<Row>
					<Page :total="tableParams.total" :page-size="searchParams.limit" show-total :current="searchParams.pager" @on-change="handlePage"></Page>
				</Row>
			</div>
		</Card>
		<!--终止弹框-->
		<Modal v-model="isModalShow" title="终止患者所有随访">
			<Form :model="modalForm" :label-width="80" :rules="validate.stopFollowUp" ref="stopForm">
				<FormItem label="原因" prop="cancleReason">
					<Select v-model="modalForm.cancleReason" :disabled="!modalForm.planIds">
						<Option v-for="(item, index) in reasonData" :value="index" :key="index">{{item}}</Option>
					</Select>
				</FormItem>
				<FormItem label="详情" prop="cancleRemark">
					<Input v-model="modalForm.cancleRemark" type="textarea" :autosize="{minRows: 2,maxRows: 5}" :disabled="!modalForm.planIds"></Input>
				</FormItem>
			</Form>
			<div slot="footer">
				<template v-if="modalForm.planIds">
					<Button @click="isModalShow = false">取消</Button>
					<Button type="primary" @click="handleFormPost('stopForm')">确定</Button>
				</template>
				<Button v-else type="primary" @click="isModalShow = false">关闭</Button>
			</div>
		</Modal>
	</div>
</template>

<script>
import organizationShrink from '../common-components/organization-shrink'
import expandRow from './table-expand.vue'
export default {
    name: 'planMatchRepeatReview',
    components: {
    	expandRow,
        organizationShrink
    },
    data () {
        return {
            searchParams: {
                brxm: '',
                mobile: '',
                schemeName: '',
                organizationId: '',
                pager: 1,
                limit: 10,
                sort: '', // 排序字段
                order: '' // 排序方式:降序 DESC 升序 ASC
            },
            tableParams: {
                data: [],
                total: 0,
                isLoading: false
            },
            // 列表配置
            config: [
                {
                    type: 'expand',
                    width: 50,
                    render: (h, params) => {
                    	let create = this.$createElement
                        let dom = create(expandRow, {
                            ref: `expandRow${params.index}`,
                            props: {
                                data: params.row.child
                            },
                            on: {
                                handleOperation: this.operationFunc
                            }
                        })
                        return dom
                    }
                },
                {
                    title: '患者姓名',
                    key: 'brxm'
                },
                {
                    title: '联系电话',
                    key: 'mobile'
                },
                {
                    title: '疾病名称',
                    key: 'icdName'
                },
                {
                    title: '随访方案',
                    key: 'schemeName'
                },
                {
                    title: '随访状态',
                    key: 'statusName'
                },
                {
                    title: '生成时间',
                    key: 'dateAdd',
                    width: 160
                },
                {
                    title: '计划开始执行时间',
                    key: 'followupStartTime',
                    width: 160
                },
                {
                    title: '医生',
                    key: 'userName'
                },
                {
                    title: '操作者',
                    key: 'cancleUser'
                },
                {
                    title: '操作',
                    key: 'action',
                    width: 120,
                    align: 'center',
                    render: (h, params) => {
                        return h('div', [
                            h(
                                'Button',
                                {
                                    props: {
                                        size: 'small',
                                        type: 'warning'
                                    },
                                    style: {
                                        marginRight: '5px',
                                        display: params.row.status == 2 ? 'inline-block' : 'none'
                                    },
                                    directives: [
                                        {
                                            name: 'permission',
                                            value: this.$API.planList.batchEndPlay
                                        }
                                    ],
                                    on: {
                                        click: () => {
                                            if (params.row.status == 2) {
                                                this.handleOperation(params.row)
                                            }
                                        }
                                    }
                                },
                                '终止'
                            ),
                            h(
                                'Button',
                                {
                                    props: {
                                        size: 'small',
                                        type: 'primary'
                                    },
                                    style: {
                                        marginRight: '5px',
                                        display: params.row.status == 0 ? 'inline-block' : 'none'
                                    },
                                    directives: [
                                        {
                                            name: 'permission',
                                            value: this.$API.planList.planBegin
                                        }
                                    ],
                                    on: {
                                        click: () => {
                                            if (params.row.status == 0) {
                                                this.handleOperation(params.row)
                                            }
                                        }
                                    }
                                },
                                '排期'
                            ),
                            h(
                                'Button',
                                {
                                    props: {
                                        size: 'small',
                                        type: 'default'
                                    },
                                    style: {
                                        marginRight: '5px',
                                        display: params.row.status == 4 ? 'inline-block' : 'none'
                                    },
                                    directives: [
                                        {
                                            name: 'permission',
                                            value: this.$API.planList.stopReasonInfo
                                        }
                                    ],
                                    on: {
                                        click: () => {
                                            if (params.row.status == 4) {
                                            	this.handleOperation(params.row)
                                            }
                                        }
                                    }
                                },
                                '终止详情'
                            )
                        ])
                    }
                }
            ],
            // 终止弹框
            reasonData: {},
            isModalShow: false,
            modalForm: {
                cancleReason: '',
                cancleRemark: '',
                planIds: '',
                userId: sessionStorage.getItem('rsysUserId')
            }
        }
    },
    methods: {
        /**
		 * @description 获取列表数据
		 */
        async handleQuery () {
            this.tableParams.isLoading = true
            const res = await this.$API.planList.repeatList(this.searchParams).catch(e => {
                this.tableParams.isLoading = false
            })
            this.tableParams.data = this.dataForm(res.data)
            this.tableParams.total = res.total
            this.tableParams.isLoading = false
        },
        /**
		 * @description 列表数据格式化
		 * @param data
		 */
        dataForm (data) {
            let Arrays = {}
            for (let item of data) {
                if (Arrays[item.mobile]) {
                    Arrays[item.mobile].child.push(item)
                } else {
                    Arrays[item.mobile] = {
                        brxm: item.brxm,
                        mobile: item.mobile,
                        icdName: item.icdName,
                        schemeName: item.schemeName,
                        status: item.status,
                        statusName: item.statusName,
                        dateAdd: item.dateAdd,
                        followupStartTime: item.followupStartTime,
                        userName: item.userName,
                        cancleUser: item.cancleUser,
                        planId: item.planId,
                        cancleReason: item.cancleReason,
                        cancleRemark: item.cancleRemark,
                        child: []
                        // _expanded: true
                    }
                    // Arrays[item.mobile].child.push(item)
                }
            }
            let newArray = []
            for (let key in Arrays) {
                newArray.push(Arrays[key])
            }
            return newArray
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
            // console.log(data)
            if (!data.length) {
            	this.searchParams.organizationId = ''
            } else {
                this.searchParams.organizationId = data[0].organizationId
            }
            this.handleQuery()
        },
        /**
		 * @description 处理表格中的按钮
		 * @param rowData
		 */
        handleOperation (rowData) {
            this.operationFunc(rowData)
        },
        operationFunc (rowData) {
            if (rowData.status == 0) { // 排期
                this.$Modal.confirm({
                    title: '提示',
                    content: '是否确定执行该操作？',
                    onOk: async () => {
                        this.$API.planList.planBegin({ planId: rowData.planId })
                        this.$Message.success('操作成功')
                        setTimeout(() => {
                        	this.handleQuery()
                        }, 100)
                    }
                })
            } else if (rowData.status == 4) { // 终止详情
                this.$refs.stopForm.resetFields()
                this.isModalShow = true
                this.modalForm.planIds = ''
                this.modalForm.cancleRemark = rowData.cancleRemark
                this.modalForm.cancleReason = rowData.cancleReason + ''
            } else if (rowData.status == 2) { // 终止
                this.isModalShow = true
                this.$refs.stopForm.resetFields()
                this.modalForm.planIds = rowData.planId
            }
        },
        handleFormPost (name) {
            this.$refs[name].validate(async (valid) => {
                if (valid) {
                    await this.$API.planList.batchEndPlay(this.modalForm)
                    this.$Message.success('操作成功')
                    this.isModalShow = false
                    setTimeout(() => {
                        this.handleQuery()
                    }, 100)
                } else {
                    this.$Message.error('请填写全必填信息!')
                }
            })
        },
        async getReasonData () {
            const res = await this.$API.systemParamManage.list({ limit: 9999, pager: 1, paramTypeCode: 'planStopReasons' })
            res.data.forEach(item => {
                this.reasonData[item.paramCode] = item.paramName
            })
        }
    },
    mounted () {
    	this.handleQuery()
        this.getReasonData()
    }
}
</script>

<style lang="less">
	td.ivu-table-expanded-cell {
		padding: 0 0 0 50px;
	td {
		background-color: #f8f8f9;
	}
	}
</style>
