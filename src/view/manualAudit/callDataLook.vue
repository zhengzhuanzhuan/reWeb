<template>
	<div>
		<Row class="user_main_search common_search" :gutter="20">
			<Col span="5">
				<span>随访类型</span>
				<Select v-model="searchParams.followupType" clearable>
					<Option v-for="(item, index) in followupTypeOptions" :value="item.planTypeId" :key='index'>{{item.planTypeName}}</Option>
				</Select>
			</Col>
			<Col span="5">
				<span>患者姓名</span>
				<Input v-model="searchParams.patientName" placeholder="患者姓名"></Input>
			</Col>
			<Col span="5">
				<span>随访方案</span>
				<Input v-model="searchParams.schemeName" placeholder="随访方案"></Input>
			</Col>
			<Col span="6">
				<span>执行时间</span>
				<date-time-picker :timeBegin.sync="searchParams.beginDate" :timeEnd.sync="searchParams.endDate" :is-default-today="true"></date-time-picker>
			</Col>
			<Col span="5">
				<span>外呼人</span>
				<Input v-model="searchParams.callPeople" placeholder="外呼人"></Input>
			</Col>
			<Col span="5">
				<span>外呼状态</span>
				<Select v-model="searchParams.outCallStatus" clearable>
					<Option v-for="(item, index) in callStateNum" :value="item.paramCode" :key='index'>{{item.paramName}}</Option>
				</Select>
			</Col>
			<Col span="6">
				<span>外呼时间</span>
				<date-time-picker :timeBegin.sync="searchParams.outBeginDate" :timeEnd.sync="searchParams.outEndDate" :is-default-today="true"></date-time-picker>
			</Col>
			<Col span="5">
				<span>通话状态</span>
				<Select v-model="searchParams.callStatus" clearable>
					<Option v-for="(item, index) in teleStateNum" :value="item.paramCode" :key='index'>{{item.paramName}}</Option>
				</Select>
			</Col>
			<Col span="2">
				<Button @click="handlePage(1)" type="primary" :loading="tableParams.isLoading" v-permission="this.$API.phoneCalls.callDataList">查询</Button>
			</Col>
		</Row>
		<Card style="overflow: auto;">
			<organization-shrink @chosen="selectTree" ref="orgTree" style="float:left;"></organization-shrink>
			<div style="overflow: auto;">
				<div>
					<Table :columns="config" :data="tableParams.data" :loading="tableParams.isLoading" class="table"></Table>
				</div>
				<Row>
					<Page :total="tableParams.total" :page-size="searchParams.limit" show-total :current="searchParams.pager" @on-change="handlePage"></Page>
				</Row>
			</div>
		</Card>
	<Modal
		v-model="isModalShow"
		title="随访详情"
		:mask-closable="false"
		:loading="true"
		width="70"
		@on-cancel="isModalShow=false"
		class-name="followup-detail">
		<Collapse value="1">
			<Panel name="1">
				随访结果
				<p slot="content">
					<Col span="12">
						<span>患者姓名：</span>
						<span>{{dealBaseMes.patientName}}</span>
					</Col>
					<Col span="12">
						<span>采用随访方案：</span>
						<span>{{dealBaseMes.schemeName}}</span>
					</Col>
					<Col span="12">
						<span>预计执行时间：</span>
						<span>{{dealBaseMes.date}}</span>
					</Col>
					<Col span="12">
						<span>呼叫状态：</span>
						<span>{{callStateColum[dealBaseMes.callStatus]}}</span>
					</Col>
					<Col span="12">
						<span>实际完成时间：</span>
						<span>{{dealBaseMes && dealBaseMes.endDate}}</span>
					</Col>
					<Col span="12">
						<span>联系电话：</span>
						<span>{{dealBaseMes && dealBaseMes.mobile}}</span>
					</Col>
				  <!-- 重新处理 -->
					<template>
						<Row class="rowSpace">
              <Col span="3">AI随访审核意见: </Col>
              <Col span="15">
                <Input v-model="dealBaseMes.callOutRemark" type="textarea" placeholder="请输入AI审核意见"></Input>
              </Col>
            </Row>
						 <div class="callPhone rowSpace">
              <h3>外呼号码: {{dealBaseMes.mobile}}</h3>
              <Button type="primary">马上外呼</Button></Col>
            </div>
            <div class="callStatus">
              <Form ref="stopForm" :model="dealBaseMes" :rules="ruleValidate" :label-width="120">
                <FormItem label="人工外呼通话状态" prop="callStatus">
                  <Select v-model="dealBaseMes.callStatus" placeholder="请选择通话状态" :disabled='dealBaseMes.callStatus==10' style="width: 200px">
                    <Option v-for='(item, index) in teleStateNum' :value="item.paramCode" :key='index'>{{item.paramName}}</Option>
                  </Select>
                </FormItem>
              </Form>
            </div>
					</template>
				</p>
			</Panel>
			<Panel name="2">
				记录详情
				<div slot="content">
					<div class="integrated-audio">
						<span  class="audioLable">完整录音</span>
						<audio
							ref='audioRef'
							:src="allAudioArr[0]"
							@ended="audioEnd()"
							controls="controls"
							preload="auto"
					></audio>
			    </div>
					<div class="integrated-audio" v-if='voiceMesNum[0] && voiceMesNum[0].isArtificialCall==1'>
						<span>人工外呼录音</span>
						<audio src="http://img.tukuppt.com/origin_music/08/03/15/8a9dc1e431a502c2e16974cad8b9dfa6.mp3"
								controls="controls"></audio>
			    </div>
					<Divider />
					<ul class="record">
						<li class="record-li" v-for="(item, index) in voiceMesNum" :key="index">
							<div class="record-li-left">
								<img src="../../assets/images/doctor.png" alt="认识AI">
								<div class="record-li-left-wrap">
									<span class="record-li-left-wrap-index">{{item.fieldName}}</span>
									<span class="record-li-left-wrap-ques">{{item.question}}</span>
								</div>
							</div>
							<div class="record-li-right">
								<Tag color="error" v-if="!item.isNormal && item.targetId">指标异常</Tag>
								<Tag color="warning" v-if="!item.fieldValue && !item.fieldName && item.targetId">结果未采集</Tag>
								<div class="record-li-right-main">
									<audio :src="item.audio" controls="controls">browser not support</audio>
									<Input v-model="item.asr" v-if="item.targetId"></Input>
									<ul v-if="item.targetId">
										<li>
											<label>指标:</label>
											<span>{{item.fieldName}}</span>
										</li>
										<li>
											<label>采集结果:</label>
											<div class="result-wrap">
												<Input v-if="item.targetOptions[0] && item.targetOptions[0].optionName=='string'" v-model="item.fieldValue"></Input>
												<InputNumber v-else-if="item.targetOptions[0] && item.targetOptions[0].optionName=='digit'" :min="1" v-model="item.fieldValue"></InputNumber>
												<DatePicker v-else-if="item.targetOptions[0] && item.targetOptions[0].optionName=='datetime'" v-model="item.fieldValue" transfer format="yyyy-MM-dd HH:mm" type="datetime" confirm></DatePicker>
												<RadioGroup v-else v-model="item.fieldValue" transfer>
													 <Radio v-for='(text, index) in item.targetOptions' :label='text.optionValues' :key='index'></Radio>
												</RadioGroup>
											</div>
										</li>
										<li>
											<label>指标是否正常</label>
											<RadioGroup v-model="item.isNormal">
												<Radio :label="1">正常</Radio>
												<Radio :label="0">不正常</Radio>
											</RadioGroup>
										</li>
									</ul>
								</div>
								<img src="../../assets/images/patient.png" alt="患者">
							</div>
						</li>
					</ul>
				</div>
			</Panel>
		</Collapse>
		<div slot="footer">
			<Button type="primary" @click="handlePost">提交</Button>
		</div>
	</Modal>
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
			dealModal: '',
			voiceMesNum: [],
			dealBaseMes:{},
			isModalShow: false,
			callStateNum: [],
			teleStateNum: [],
			followupTypeOptions: [],
			searchParams: {
				followupType: '',
				patientName: '',
				schemeName: '',
				beginDate: '', // 执行时间
				endDate: '',
				callPeople: '',
				outCallStatus: '', // 审核时间
				outBeginDate: '',
				outEndDate: '',
				callStatus:'',
				organizationId: '',
				pager: 1,
				limit: 10,
				userId: sessionStorage.getItem('rsysUserId')
			},
			tableParams: {
				data: [],
				total: 0,
				isLoading: false
			},
			ruleValidate: {
        callStatus: [
          { required: true, message: '通话状态你能为空', trigger: 'blur' }
        ],
      },
			// 列表配置
			config: [
				{
					title: '姓名',
					key: 'patientName'
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
					key: 'date'
				},
				{
					title: '外呼人',
					key: 'outCallPeople',
					render: (h, params) => {
            return h('div',  params.row.outCallStatus==0? '': params.row.outCallPeople);
          }
				},
				{
					title: '外呼时间',
					key: 'outCallDate'
				},
				{
					title: '外呼状态',
					key: 'outCallStatus',
					render: (h, params) => {
            return h('div', params.row.outCallStatus==='1'? '已外呼': '等待外呼')
          }
				},
				{
					title: '通话状态',
					key: 'callStatus',
					render: (h, params) => {
            return h('div', this.callStateColum[params.row.callStatus]);
          }
				},
				{
					title: '操作',
					key: 'action',
					width: 100,
					align: 'center',
					render: (h, params) => {
						let text =''
						let isDeal =''
						if(params.row.outCallStatus == 0){
							text = '处理'
              isDeal='deal'
						} else if(params.row.outCallStatus == 1){
							text = '重新处理'
							isDeal='againDeal'
						}
						return h('div', [
							h('Button',{
								props: {
									size: 'small',
									type: 'default'
								},
								directives: [
                  {
                    name: 'permission',
                    value: this.$API.phoneCalls.phoneCallsDetail
                  }
                ],
								on: {
									click: () => {
										this.handleOperation(params.row.recordId, isDeal)
										}
									}
								}, text)
								])
							}
						}
				],
				// 详情弹框props
				recordId: '',
				callStateColum: {},
				allAudioArr:[],
      	endIndex:0,
			}
    },
    methods: {
        /**
		 * @description 获取列表数据
		 */
		audioEnd(){
      this.endIndex++
      const audioRef= this.$refs.audioRef
      if(this.endIndex<this.allAudioArr.length){
        audioRef.src= this.allAudioArr[this.endIndex]
        audioRef.play();
      } else{
        this.endIndex=0
        audioRef.src= this.allAudioArr[0]
        audioRef.pause();
      }
    },
		async handleQuery () {
			this.tableParams.isLoading = true
			const res = await this.$API.phoneCalls.callDataList(this.searchParams)
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
			// 外呼状态
			const res2 = await this.$API.systemParamManage.list({ limit: 9999, pager: 1, paramTypeCode: 'outCallStatus' })
			this.callStateNum = res2.data
			// 通话状态
			const res3 = await this.$API.systemParamManage.list({ limit: 9999, pager: 1, paramTypeCode: 'callStatus' })
			this.teleStateNum = res3.data
			res3.data.forEach(item=> {
				this.callStateColum[item.paramCode]=item.paramName
			})
			// 终止原因
			const res4 = await this.$API.systemParamManage.list({ limit: 9999, pager: 1, paramTypeCode: 'planStopReasons' })
			this.reasonDataOptions = res4.data
		},
			/**
	 * @description 表格按钮方法
	 * @param rowData
	 */

		async handleOperation(recordId, type){
			this.dealModal = type
      this.isModalShow = true
			const res = await this.$API.phoneCalls.phoneCallsDetail({recordId})
			this.dealBaseMes = res.data.detail
			this.voiceMesNum = res.data.replies
			const audioArr = this.voiceMesNum.map(item=>({
        aiAudio: item.aiAudio.split(';'),
        audio: item.audio
      }))
      const allAudio = audioArr.map((item)=>(Object.values(item)))
      this.allAudioArr=allAudio.flat(2).filter(x=>x)
		},
		handlePost () {
			this.$refs.stopForm.validate(async (valid) => {
				if (valid) {
					this.$Modal.confirm({
						title: '提交',
						content: `<p>当前你选择的通话状态：${this.callStateColum[this.dealBaseMes.callStatus]}</p>`,
						okText: '确定',
						cancelText: '选错了',
						onOk: async() => {
							await this.$API.phoneCalls.phoneCallsSubmit({
								...this.dealBaseMes,
								"replies": this.voiceMesNum
							})
							this.$Message.success('人工外呼信息提交成功');
							this.handleQuery()
							this.isModalShow=false
						},
					});
				}
			})
		},
  },
	mounted () {
		this.getOptionsData().then(res => {
			this.handleQuery()
		})
	}
}
</script>

<style lang="less">
	.followup-detail{
		.ivu-modal{
			top: 50px;
		}
		.ivu-collapse-content-box{
			overflow: auto;
			position: relative;
		}
		.ivu-col{
			margin-bottom: 8px;
		}
		.form-item{
			width: 200px;
			position: relative;
			&-tip{
				position: absolute;
				left: 230px;
				top: -5px;
			}
		}
		.stop-stamp{
			width: 80px;
			height: 80px;
			color: red;
			text-align: center;
			position: absolute;
			right: 20px;
			bottom: 20px;
			border: 2px solid red;
			border-radius: 50%;
			&-wrap{
				width: 70px;
				height: 70px;
				line-height: 70px;
				border: 2px solid red;
				border-radius: 50%;
				position: relative;
				top: 2.5px;
				left: 3px;
				transform: rotate(-30deg);
			}
		}
		.integrated-audio{
			position: relative;
			height: 71px;
			line-height: 55px;
			audio {
				position: absolute;
				left: 90px;
				top: 12px;
			}
			.audioLable{
				display: inline-block;
				margin-top: 13px;
			}
		}
		.record{
			margin-top: 8px;
			max-height: 500px;
			overflow-y: auto;
			img{
				height: 45px;
				width: 45px;
			}
			&-li{
				overflow: auto;
				&-left{
					width: 50%;
					margin-bottom: 3px;
					position: relative;
					&-wrap{
						width: calc(~"100% - 58px");
						display: inline-block;
						padding: 8px;
						box-sizing: border-box;
						margin-left: 8px;
						background-color: #f7f7f7;
						position: absolute;
						top: 0;
						span{
							display: block;
						}
						&-ques{
							margin-top: 8px;
							color: #999;
						}
					}
				}
				&-right{
					width: 50%;
					float: right;
					position: relative;
					.ivu-tag{
						position: absolute;
						right: 100%;
						bottom: 8px;
						margin: 0;
					}
					.ivu-tag-error{
						width: 65px;
					}
					.ivu-tag-warning{
						width: 77px;
					}
					img{
						position: absolute;
						top: 0;
					}
					&-main{
						width: calc(~"100% - 58px");
						display: inline-block;
						ul{
							margin-top: 4px;
							border: 1px solid #d7d7d7;
							border-bottom-width: 0;
							background-color: #f7f7f7;
							li{
								list-style: none;
								padding: 8px 4px;
								border-bottom: 1px solid #d7d7d7;
								label{
									margin-right: 3px;
								}
								.result-wrap{
									width: calc(~"100% - 60px");
									display: inline-block;
								}
							}
						}
					}
				}
			}
		}
	}
	.rowSpace {
		margin-bottom: 15px;
		.colSpace {
			margin-top: 10px;
		}
	}
	.callPhone {
		display: flex;
		padding:13px;
		justify-content: space-around;
		background-color: rgb(242, 242, 242);
		border: 1px solid rgb(228,228,228);
		h3{
			margin-top: 6px;
		}
	}
	.callStatus {
		margin: 30px 20% -10px 20%;
	}
</style>
