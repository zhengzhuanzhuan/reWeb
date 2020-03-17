<template>
  <div class="outCall">
    <Form ref="formValidate" :model="formValidate" :label-width="80"  class="outCall-search">
      <FormItem label="随访类型">
        <Select v-model="formValidate.followupType" placeholder="请选择随访类型" style="width:200px" clearable>
          <Option v-for='(item, index) in followTypeNum' :value="item.planTypeId" :key='index'>{{item.planTypeName}}</Option>
        </Select>
      </FormItem>
      <FormItem label="姓名">
        <Input v-model="formValidate.patientName" placeholder="请输入患者姓名" style="width:200px"></Input>
      </FormItem>
      <FormItem label="随访方案">
        <Input v-model="formValidate.schemeName" placeholder="请输入随访方案" style="width:200px"></Input>
      </FormItem>
      <FormItem label="执行时间">
        <date-time-picker :timeBegin.sync="formValidate.beginDate" :timeEnd.sync="formValidate.endDate" :is-default-today="true" style="width: 300px"></date-time-picker>
      </FormItem>
      <FormItem label="外呼人">
        <Input v-model="formValidate.callPeople" placeholder="请输入外呼人" style="width:200px"></Input>
      </FormItem>
      <FormItem label="外呼状态">
        <Select v-model="formValidate.outCallStatus" placeholder="请输入外呼状态" style="width:200px" clearable>
          <Option v-for='(item,index) in outCallStatusNum' :value="item.paramCode" :key='index'>{{item.paramName}}</Option>
        </Select>
      </FormItem>
      <FormItem label="外呼时间">
        <date-time-picker
          :timeBegin.sync="formValidate.outBeginDate"
          :timeEnd.sync="formValidate.outEndDate"
          :is-default-today="true"
          style="width: 300px"></date-time-picker>
      </FormItem>
      <FormItem label="通话状态">
        <Select v-model="formValidate.callStatus" placeholder="请选择通话状态" style="width:200px" clearable>
          <Option v-for='(item, index) in callStatusNum' :value="item.paramCode" :key='index'>{{item.paramName}}</Option>
        </Select>
      </FormItem>
      <FormItem>
        <Button type="primary" @click='handlePage(1)' v-permission="this.$API.phoneCalls.phoneCallsList">查询</Button>
      </FormItem>
    </Form>
    <div class="outCall-main">
      <organization-shrink @chosen="selectTree" :orgScroll='true'></organization-shrink>
      <Table :columns="columnsData" :data="tableData" class="main-right"/>
      <Page
        :total="pageData.total"
        :page-size="pageData.pageSize"
        show-total
        :current="pageData.current"
        @on-change='handlePage'
        style="float: right"/>
    </div>
    <Modal title="随访详情" width="850" v-model='handleModal' :mask-closable='false'>
      <Collapse value="1">
        <Panel name="1">
          随访结果
          <div slot="content" class="baseMes">
            <Row class="rowSpace">
              <Col span="12">
                患者姓名: {{dealBaseMes.patientName}}
                <Button type="error" style="margin-left: 10px" v-show='dealBaseMes.isArtificialUrgent == 1'>外呼加急</Button>
              </Col>
              <Col span="12">
                采用随访方案：{{dealBaseMes.schemeName}}
              </Col>
            </Row>
            <Row class="rowSpace">
              <Col span="8">预计执行时间：{{dealBaseMes.date}}</Col>
              <Col span="8">呼叫状态：{{callStateColum[dealBaseMes.callStatus]}}</Col>
              <Col span="8">实际完成时间：{{dealBaseMes && dealBaseMes.endDate}}</Col>
            </Row>
            <Row class="rowSpace">
              <Col span="3">AI随访审核意见: </Col>
              <Col span="15">
                <Input v-model="dealBaseMes.callOutRemark" type="textarea" placeholder="请输入AI审核意见"></Input>
              </Col>
            </Row>
            <div class="callPhone rowSpace">
              <h3>外呼号码: {{dealBaseMes.mobile}}</h3>
              <Button type="primary" @click='handlePhoneCall'>马上外呼</Button></Col>
            </div>
            <div class="callStatus">
              <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="120">
                <FormItem label="人工外呼通话状态" prop="callStatus">
                  <Select v-model="dealBaseMes.callStatus" placeholder="请选择通话状态" style="width: 200px" :disabled='dealBaseMes.callStatus==10'>
                    <Option v-for='(item, index) in callStatusNum' :value="item.paramCode" :key='index'>{{item.paramName}}</Option>
                  </Select>
                </FormItem>
              </Form>
            </div>
          </div>
        </Panel>
        <Panel name="2">
          记录详情
          <div slot="content">
            <Row class="rowSpace">
              <Col span="3">
                <p style="marginTop: 10px">完整录音</p>
              </Col>
              <Col span="8">
                <audio
                  ref='audioRef'
                  :src="allAudioArr[0]"
                  @ended="audioEnd()"
                  controls="controls"
                  preload="auto"
              ></audio>
              </Col>
            </Row>
            <Row class="rowSpace" v-if='voiceMesNum[0] && voiceMesNum[0].isArtificialCall==1'>
              <Col span="4" class="colSpace">
                人工外呼录音
              </Col>
              <Col span="8">
                <audio
                  src="http://img.tukuppt.com/origin_music/08/03/15/8a9dc1e431a502c2e16974cad8b9dfa6.mp3"
                  controls="controls"
                  preload="auto"
                ></audio>
              </Col>
            </Row>
            <Divider />
            <ul class="record">
						<li class="record-li" v-for="item, index in voiceMesNum" :key="index">
							<div class="record-li-left">
								<img src="../../assets/images/doctor.png" alt="认识AI">
								<div class="record-li-left-wrap">
									<span class="record-li-left-wrap-index">{{item.fieldName}}</span>
									<span class="record-li-left-wrap-ques">{{item.question}}</span>
								</div>
							</div>
							<div class="record-li-right">
								<Tag color="error" v-if="!item.isNormal && item.targetId">指标异常</Tag>
								<Tag color="warning"  v-if="!item.fieldValue && !item.fieldName && item.targetId">结果未采集</Tag>
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
        <Button type="primary" @click='handleSubmit'>提交</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import patient from '@/assets/images/patient.png'
import doctor from '@/assets/images/doctor.png'
import organizationShrink from '../common-components/organization-shrink'
import dateTimePicker from '../common-components/date-time-picker'
export default {
  name: 'outSideCall',
  components: {
    organizationShrink,
    dateTimePicker
  },
  data(){
    return {
      patient,
      doctor,
      allAudioArr:[],
      endIndex:0,
      formValidate: {},
      columnsData: [
        {
          title: '姓名',
          key: 'patientName',
          width: 200,
          render: (h, params) => {
            return h('div', [
              h('span', {
                style: {
                  display: 'inline',
                },
              }, params.row.patientName),
              h('Button', {
                props: {
                  type: 'error',
                  size: 'small'
                },
                style: {
                  display: (params.row.isArtificialUrgent == 1)? 'inline-block': 'none',
                  marginLeft: '10px'
                },
              }, '外呼加急'),
            ]);
          }
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
            return h('div', params.row.outCallStatus==0? '': params.row.outCallPeople);
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
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'default',
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                directives: [
                  {
                    name: 'permission',
                    value: this.$API.phoneCalls.phoneCallsDetail
                  }
                ],
                on: {
                  click: () => {
                    this.handleDetail(params.row)
                  }
                }
              }, params.row.outCallStatus==='1'? '重新处理': '处理'),
            ]);
          }
        }
      ],
      tableData: [],
       pageData: {
        total: 100,
        pageSize: 10,
        current: 1,
      },
      // 通话状态
      callStatusNum: [],
      callStateColum: {},
      // 终止原因
      endDetailNum: [],
      // 随访类型
      followTypeNum: [],
      // 外呼状态
      outCallStatusNum: [],

      orgTreeId: localStorage.getItem('orgId'),
      dealBaseMes: {},
      voiceMesNum: [],
      animal: '',
      ruleValidate: {
        callStatus: [
          { required: true, message: '通话状态不能为空', trigger: 'blur' }
        ],
        name: [
          { required: true, message: 'The name cannot be empty', trigger: 'blur' }
        ],
      },
      handleModal: false,
      textarea: '',
    }
  },
  methods: {
    handlePhoneCall(){
    },
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
    // 列表
    async handleCallList(params){
      const res = await this.$API.phoneCalls.phoneCallsList({
        pager: this.pageData.current,
        limit: this.pageData.pageSize,
        organizationId: this.orgTreeId,
        userId: sessionStorage.getItem('rsysUserId'),
        ...this.formValidate,
        ...params
      })
      this.tableData = res.data
      this.pageData.total = res.total
    },
    handlePage(pager){
      this.pageData.current = pager
      this.handleCallList({pager})
    },
    // 详情
    async handleDetail(data){
      this.handleModal = true
      const res = await this.$API.phoneCalls.phoneCallsDetail({recordId: data.recordId})
      this.dealBaseMes = res.data.detail
      this.voiceMesNum = res.data.replies
      const audioArr = this.voiceMesNum.map(item=>({
        aiAudio: item.aiAudio.split(';'),
        audio: item.audio
      }))
      const allAudio = audioArr.map((item)=>(Object.values(item)))
      this.allAudioArr=allAudio.flat(2).filter(x=>x)
    },
    // 提交
    handleSubmit(){
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
            this.handleModal=false
            this.handleCallList()
          },
        });
    },

    selectTree(data){
      if (!data.length) {
        this.orgTreeId = ''
      } else {
        this.orgTreeId = data[0].organizationId
      }
      this.handleCallList()
    },
    async handleCallStatus() {
      // 通话状态
      const res1 = await this.$API.planManage.upmsParamDataList({paramTypeCode: 'callStatus', limit: 999})
      this.callStatusNum = res1.data
       res1.data.forEach(item => {
        this.callStateColum[item.paramCode]=item.paramName
      })
      // 随访类型
      const res2 = await this.$API.planManage.planTypeList({ limit: 9999, pager: 1 })
      this.followTypeNum = res2.data
       // 外呼状态
      const res3 = await this.$API.planManage.upmsParamDataList({paramTypeCode: 'outCallStatus', limit: 999})
      this.outCallStatusNum = res3.data
       // 终止详情
      const res4 = await this.$API.planManage.upmsParamDataList({paramTypeCode: 'planStopReasons', limit: 999})
      this.endDetailNum = res4.data
    },

  },
  mounted(){
    this.handleCallList()
    this.handleCallStatus()
  }
}
</script>

<style lang="less" scoped>
  .outCall {
    height: 100%;
    width: 100%;

    &-search{
      display: flex;
      flex-flow: wrap;
      background-color: #fff;
      padding-top: 20px;
    }
    &-main {
      height: calc(~'100% - 140px');
      padding: 20px;
      margin-top: 10px;
      background-color: #fff;
      .main-right{
        overflow-x: auto;
      }
    }
  }
  .baseMes{
    .tipsMes {
      display: inline-block;
      width: 300px;
      line-height: 16px;
      margin-left: 20px;
    }
    .followResult{
      width: 100%;
      height: 40px;
      margin-bottom:20px;
      line-height: 40px;
      padding-left: 20px;
      border-radius: 10px;
      border: 1px solid rgb(204,204,204);
      background-color: rgb(242,242,242);
      span{
        font-size: 16px;
        color: #333;
        font-weight: 500;
      }
    }
    .rowSpace {
      margin-bottom: 15px;
      .colSpace {
        margin-top: 20px;
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
      margin-top: 20px;
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
          margin-left: 10px;
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
</style>

