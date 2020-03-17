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
				<span>审核状态</span>
				<Select v-model="searchParams.vetStatus" clearable>
					<Option v-for="(item, index) in vetStatusOptions" :value="index" :key="index">{{item}}</Option>
				</Select>
			</Col>
			<Col span="9">
				<span>审核时间</span>
				<date-time-picker :timeBegin.sync="searchParams.vetDateBegin" :timeEnd.sync="searchParams.vetDateEnd" :is-default-today="true"></date-time-picker>
			</Col>
			<Col span="5">
				<span>人工外呼</span>
				<Select v-model="searchParams.isArtificialCall" clearable>
					<Option value="1">是</Option>
					<Option value="0">否</Option>
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
					<Table :columns="config" :data="tableParams.data" :loading="tableParams.isLoading" class="table-btn-fixed-width"></Table>
				</div>
				<Row>
					<Page :total="tableParams.total" :page-size="searchParams.limit" show-total :current="searchParams.pager" @on-change="handlePage"></Page>
				</Row>
			</div>
		</Card>
		<!--随访详情弹框&#45;&#45;审核、重新审核、查看-->
		<followup-record-detail :id="recordId" ref="followupDetail" @refresh="handleQuery"></followup-record-detail>
	</div>
</template>

<script>
import organizationShrink from '../common-components/organization-shrink'
import dateTimePicker from '../common-components/date-time-picker'
import followupRecordDetail from '../common-components/followup-record-detail'
export default {
    name: 'followUpRecordReview',
    components: {
        organizationShrink,
        dateTimePicker,
        followupRecordDetail
    },
    props: {
        isAfterDistribute: { // 根据此来调整列表调用的接口是 true--allCheckList(分配后的) 还是 false--checkList
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            followupTypeOptions: [],
            vetStatusOptions: [],
            searchParams: {
                followupType: '',
                brxm: '',
                schemeName: '',
                dateEndBegin: '', // 执行时间
                dateEndEnd: '',
                vetStatus: '',
                vetDateBegin: '', // 审核时间
                vetDateEnd: '',
                isArtificialCall: '',
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
            // 列表配置
            config: [
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
                    title: '审核状态',
                    key: 'vetStatus',
                    render: (h, params) => {
                        return h('span', this.vetStatusOptions[params.row.vetStatus])
                    }
                },
                {
                    title: '审核人',
                    key: 'vetUser'
                },
                {
                    title: '审核时间',
                    key: 'vetDate'
                },
                {
                    title: '审核意见',
                    key: 'vetRemark'
                },
                {
                    title: '人工外呼',
                    key: 'isArtificialCall',
                    render: (h, params) => {
                    	return h('span', params.row.isArtificialCall == 0 ? '否' : '是')
                    }
                },
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
                                        marginRight: '5px',
                                        display: params.row.vetStatus == 0 ? 'inline-block' : 'none'
                                    },
                                    directives: [
                                        {
                                            name: 'permission',
                                            value: this.$API.followupRecord.recordVet
                                        }
                                    ],
                                    on: {
                                        click: () => {
                                        	if (params.row.vetStatus == 0) {
                                        		this.handleOperation(params.row.recordId)
                                            }
                                        }
                                    }
                                },
                                '审核'
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
                                        display: (params.row.vetStatus == 1 && (params.row.cancleReason === -1 || params.row.cancleReason === '')) ? 'inline-block' : 'none'
                                    },
                                    directives: [
                                        {
                                            name: 'permission',
                                            value: this.$API.followupRecord.recordVet
                                        }
                                    ],
                                    on: {
                                        click: () => {
                                            if (params.row.vetStatus == 1 && (params.row.cancleReason === -1 || params.row.cancleReason === '')) {
                                                this.handleOperation(params.row.recordId)
                                            }
                                        }
                                    }
                                },
                                '重新审核'
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
                                        display: (params.row.vetStatus == 1 && (params.row.cancleReason !== -1 && params.row.cancleReason !== '')) ? 'inline-block' : 'none'
                                    },
                                    directives: [
                                        {
                                            name: 'permission',
                                            value: this.$API.followupRecord.allInfo
                                        }
                                    ],
                                    on: {
                                        click: () => {
                                            if (params.row.vetStatus == 1 && (params.row.cancleReason !== -1 && params.row.cancleReason !== '')) {
                                                this.handleOperation(params.row.recordId)
                                            }
                                        }
                                    }
                                },
                                '查看'
                            )
                        ])
                    }
                }
            ],
            // 详情弹框props
            recordId: ''
        }
    },
    methods: {
        /**
		 * @description 获取列表数据
		 */
        async handleQuery () {
            this.tableParams.isLoading = true
            const apiName = this.isAfterDistribute ? 'allCheckList' : 'checkList'
            const res = await this.$API.followupRecord[apiName](this.searchParams).catch(e => {
                this.tableParams.isLoading = false
            })
            this.tableParams.data = res.data
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
            // 审核状态
            const res2 = await this.$API.systemParamManage.list({ limit: 9999, pager: 1, paramTypeCode: 'vetStatus' })
            res2.data.forEach(item => {
                this.vetStatusOptions[item.paramCode] = item.paramName
            })
        },
        /**
		 * @description 表格按钮方法
		 * @param rowData
		 */
        handleOperation (recordId) {
            if (recordId) {
                this.recordId = recordId
                this.$refs.followupDetail.toggleModalShow()
            } else {
                this.$Message.warning('记录id为空！')
            }
        }
    },
    mounted () {
    	this.getOptionsData().then(res => {
            this.handleQuery()
        })
    }
}
</script>

<style lang="less">
</style>
