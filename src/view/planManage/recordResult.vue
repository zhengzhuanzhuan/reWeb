<template>
  <div class="planList">
    <organization-shrink @chosen="selectTree" :orgScroll='true'></organization-shrink>
    <Tabs @on-click='handleTabChange'>
      <TabPane v-for='(item, index) in tabLable' :label="item.planTypeName" :key='index' :name='item.planTypeId'>
        <Form :model="formValue" :label-width="80" class='tableSearch'>
          <FormItem label="姓名">
            <Input v-model="formValue.brxm" placeholder="请输入姓名" style="width: 200px"></Input>
          </FormItem>
           <FormItem label="方案名称">
            <Input v-model="formValue.schemeName" placeholder="请输入方案名称" style="width: 200px"></Input>
          </FormItem>
          <FormItem label="随访状态">
            <Select v-model="formValue.status" style="width: 200px" clearable>
              <Option v-for='(item,index) in followStatusSelect' :key='index' :value="item.paramCode">{{item.paramName}}</Option>
            </Select>
          </FormItem>
           <FormItem label="AI审核状态">
            <Select v-model="formValue.vetStatus" style="width: 200px" clearable>
              <Option v-for='(item, index) in AIJudgeSelect' :key='index' :value="item.paramCode">{{item.paramName}}</Option>
            </Select>
          </FormItem>
          <FormItem label="执行时间">
				    <date-time-picker
              :timeBegin.sync="formValue.dateEndBegin"
              :timeEnd.sync="formValue.dateEndEnd"
              :is-default-today="true" style="width: 350px"></date-time-picker>
          </FormItem>
          <FormItem label="通话状态">
            <Select v-model="formValue.callStatus" style="width: 200px" clearable>
              <Option v-for='(item,index) in callStatusSelect' :key='index' :value="item.paramCode">{{item.paramName}}</Option>
            </Select>
          </FormItem>
          <Button type="primary" class='btnSearch' @click='handlePageNum(1)'>查询</Button>
        </Form>
        <Table
          :columns="columnsFields"
          :data="tableData"></Table>
        <div class="tableChoose">
          <Page
            :total='pageData.total'
            :page-size='pageData.pageSize'
            :current='pageData.current'
            show-total
            @on-change='handlePageNum'
          />
        </div>
      </TabPane>
    </Tabs>
    <Drawer title="计划详情" :closable="false" v-model="planDetail" width="800">
      <div>
        <div class="baseMess">
          <Row class="RowSpace">
            <Col span="12">
              <span class='Name'>{{planDetailNum.brxm || '--' }}</span>
              <span class='Age'>{{`${brxb[planDetailNum.brxb] || '--'}/${planDetailNum.age}`}}</span>
            </Col>
          </Row>
          <Row class="RowSpace">
            <Col span="12">
              疾病分类：{{ planDetailNum.icdName }}
            </Col>
            <Col span="12">
              联系电话: {{ planDetailNum.mobile}}
            </Col>
          </Row>
          <Row class="RowSpace">
            <Col span="12">
              所属组织：{{planDetailNum.organizationName}}
            </Col>
            <Col span="12">
              所属方案：{{planDetailNum.schemeName }}
            </Col>
          </Row>
          <Row class="RowSpace">
            <Col span="12">
              随访状态：{{followStatusList[planDetailNum.status] }}
            </Col>
            <Col span="12">
              预计执行日期：{{ planDetailNum.dateBegin}}
            </Col>
          </Row>
          <Row class="RowSpace">
            <Col span="12">
              最终通话状态：{{callStatusList[ planDetailNum.callStatus]}}
            </Col>
          </Row>
        </div>
        <div class='testList'>
          <p>实际执行日期</p>
          <Table :columns="columns1" :data="detailTableNum"></Table>
        </div>
        <div class='testList'>
          <Row class="RowSpace">
            <Col span="12">
              AI审核状态: {{ planDetailNum.vetStatus? '已审核': '未审核'}}
            </Col>
            <Col span="12">
              AI审核时间: {{ planDetailNum.vetDate}}
            </Col>
          </Row>
          <Row>
            <Col span="12">
              AI审核意见: {{ planDetailNum.vetRemark}}
            </Col>
          </Row>
        </div>
        <div class='testList' v-show='manCallsNum'>
          <Row class="RowSpace">
            <Col span="12">
              需要人工外呼: {{ manCallsNum && manCallsNum.isArtificialCall? '是': '不是'}}
            </Col>
            <Col span="12">
              人工外呼时间：{{ manCallsNum && manCallsNum.callOutDate }}
            </Col>
          </Row>
          <Row>
            <Col span="12">
              人工外呼意见: {{ manCallsNum && manCallsNum.callOutRemark}}
            </Col>
          </Row>
        </div>
        <div class='testList'>
          医生处理结果：{{ diseaseInfoList[planDetailNum.diseaseInfo] || '医生暂未处理'}}
        </div>
        <div class='testList'>
          <h3>指标结果</h3>
          <div class='targetResult'>
            <p v-if="!targetResultShow.length">暂无数据</p>
            <p
              v-for='(item,index) in targetResultShow'
              style='width: 50%'
              :style="item.isNormal? 'color: green': 'color: red'"
              >{{item.fieldName+":"+ item.fieldValue}}</p>
          </div>
        </div>
        <div class='testList'>
          <h3>记录详情</h3>
          <div class="audioList">
            <span style='marginLeft: 35px'>AI完整录音</span>
            <div class="audioStyle">
              <audio
                ref='audioRef'
                :src="allAudioArr[0]"
                @ended="audioEnd()"
                controls
                controlslist='nodownload'
              ></audio>
            </div>

          </div>
          <div class="audioList" v-show='false'>
            <span>人工外呼完整录音</span>
            <div class="audioStyle">
              <audio
                src="http://img.tukuppt.com/origin_music/08/03/15/8a9dc1e431a502c2e16974cad8b9dfa6.mp3"
                controls="controls"
                controlslist='nodownload'
                preload="auto"
              ></audio>
            </div>
<<<<<<< HEAD
=======

>>>>>>> faaba0085985ca2d1015b2cdaea4cf8344ef69fc
          </div>
        </div>
        <div class='testList'>
          <div
            class='languCommit'
            v-for='(item, index) in targetResultNum'>
            <div class="langAI">
              <div class='picBlock'>
                <img :src="headPicture">
              </div>
              <p :style="item.question==''?'height:35px': ''">{{item.question}}</p>
            </div>
            <div class="langWord">
              <div class="audioStyle">
                <audio
                :src="item.audio"
                controls
                controlslist='nodownload'
              ></audio>
              </div>
              <div class='picBlock'>
                <img :src="phonePicture" alt="">
              </div>
            </div>
             <div class="langWord">
              <p :style="item.asr==''?'height:35px': '' ">{{item.asr}}</p>
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  </div>
</template>
<script>
import dateTimePicker from '../common-components/date-time-picker'
import formatDate from '@/libs/tools.js'
import headPicture from '@/assets/images/u1516.png'
import phonePicture from '@/assets/images/u1520.png'
import organizationShrink from '../common-components/organization-shrink'

export default {
  name: 'planType',
  components: {
    organizationShrink,
    dateTimePicker
  },
  data () {
    return {
      targetResultShow:[],
      allAudioArr:[],
      endIndex: 0,
      headPicture,
      phonePicture,
      brxb: {
        1: '男',
        2: '女',
        3: '其他'
      },
      columns1: [
        {
          title: '执行次数',
          key: 'numberTimer'
        },
        {
          title: '执行时间',
          key: 'dateAdd'
        },
        {
          title: '通话状态',
          key: 'remark'
        }
      ],
      formValue: {
        dateEndBegin:'',
        dateEndEnd: '',
      },
      tableData: [],
      pageData: {
        total: 10,
        pageSize: 10,
        current: 1,
      },
      columnsFields: [],
      planDetail: false,
      planDetailNum:{},
      detailTableNum: [],
      targetResultNum: [],
      followStatusSelect: [],
      AIJudgeSelect: [],
      callStatusSelect: [],
      manCallsNum: {},
      tabLable: [],
      followTypeNum: null,
      listOrigin: null,
      diseaseInfoList:{
        0: '病情稳定',
        1:'通知就诊',
        2: ':自行处理'
      },
      brxbLsit:{
        1: '男',
        2: '女',
        3: '其他'
      },
      stopReasonList:{},
      callStatusList:{},
      followStatusList:{},
      resultStatusLsit:{
        0: '未采集',
        1: '部分采集',
        2: '全部采集',
      }
    }
  },
  methods: {
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
    async handleTabLabel(){
      const res = await this.$API.planManage.tabChange({ userId: sessionStorage.getItem('rsysUserId') })
      this.tabLable = res.data
      this.followTypeNum = res.data[0] && res.data[0].planTypeId
      this.$nextTick(() => {
        this.handlePlanList({followupType: res.data[0] && res.data[0].planTypeId })
      })
    },
    // 切换Tab
    handleTabChange(value){
      this.followTypeNum=value
      this.handlePlanList({
        pager: 1,
        followupType: value,
      })
    },
    // 表格的动态表头数据
    async handleTableHeader(){
      const res = await this.$API.planManage.visiFieldList({pager: 1, type: 2, limit: 999})
      this.columnsFields = [
        ...res.data.map((item, index)=> ({
          title: item.showName,
          key: item.fieldName,
          render: (h, params) => {
              let text=''
              switch(item.fieldName){
                case 'callStatus':
                 text = this.callStatusList[params.row.callStatus]
                 break;
                case 'cancleReason':
                 text = this.stopReasonList[params.row.cancleReason]
                 break;
                case 'status':
                 text = this.followStatusList[params.row.status]
                 break;
                case 'diseaseInfo':
                 text = this.diseaseInfoList[params.row.diseaseInfo]
                 break;
                case 'brxb':
                 text = this.brxbLsit[params.row.brxb]
                 break;
                case 'resultStatus':
                 text = this.resultStatusLsit[params.row.resultStatus]
                 break;
                case 'isTest':
                 text = params.row.isTest?'是': '否'
                break;
                case 'isNormal':
                 text = params.row.isNormal?'是': '否'
                break;
                case 'vetStatus':
                 text = params.row.vetStatus?'已审核':'未审核'
                break;
                case 'isDeleted':
                 text = params.row.isDeleted?'删除': '正常'
                break;
                case 'hadExport':
                 text = params.row.hadExport?'有':'没有'
                break;
                case 'isArtificialUrgent':
                 text = params.row.isArtificialUrgent?'是':'不是'
                break;
                case 'isArtificialCall':
                 text = params.row.isArtificialUrgent?'是':'不是'
                break;
                default:
                  text = params.row[`${item.fieldName}`]
                break;
              }
              return h('div',text);
            }
        })),
        {
          title: '操作',
          key: 'action',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'text',
                  size: 'small'
                },
                directives: [
                  {
                    name: 'permission',
                    value: this.$API.recordResult.followRecordDetail
                  }
                ],
                on: {
                  click: () => {
                    this.handlePlanDetail(params.row.recordId)
                  }
                }
              }, '详情')
            ]);
          }
        }
      ]
    },
    // 列表
    async handlePlanList(params){
      const res = await this.$API.recordResult.followRecordList({
        pager: this.pageData.current,
        limit:  this.pageData.pageSize,
        followupType: this.followTypeNum,
        organizationId: this.listOrigin,
        ...this.formValue,
        ...params
      })
      this.tableData = res.data
      this.pageData.total = res.total
    },
    // 计划详情
    async handlePlanDetail(data){
		const res = await this.$API.recordResult.followRecordDetail({id: data})
		this.planDetailNum = res.data.visitFollowupRecordVo || {}
		this.detailTableNum = res.data.visitFollowupRecordResults
		this.manCallsNum = res.data.visitFollowupRecordCall
		this.detailTableNum && this.detailTableNum.map((item, index)=> {item.numberTimer = `第${index+1}次`})
		if(res.data.visitFollowupRecordReplyVos.length){
			this.targetResultNum = res.data.visitFollowupRecordReplyVos
			// 去空
			const result = this.targetResultNum.filter(e=> {
				return e.fieldName!==''
			})
			// 去重
			let hash={}
			this.targetResultShow= result.reduce((preVal, curVal) => {
				hash[curVal.fieldName] ? '' : hash[curVal.fieldName] = true && preVal.push(curVal);
				return preVal
			}, [])
			const audioArr = this.targetResultNum.map(item=>({
				aiAudio: item.aiAudio.split(';'),
				audio: item.audio
			}))
			const allAudio = audioArr.map((item)=>(Object.values(item)))
			this.allAudioArr=allAudio.flat(2).filter(x=>x)
		}
    this.$nextTick(() => {
      this.planDetail = true
    })
    },
    // 页码改变
    handlePageNum(pager){
      this.pageData.current= pager
      this.handlePlanList({pager})
    },
    selectTree(data){
       if (!data.length) {
        this.listOrigin = ''
      } else {
        this.listOrigin = data[0].organizationId
      }
      this.handlePlanList()
    },
    // 随访状态下拉框
    async followStatus(){
      const res = await this.$API.planManage.upmsParamDataList({paramTypeCode: 'recordStatus', limit: 999})
      this.followStatusSelect = res.data
      res.data.forEach(item => {
        this.followStatusList[item.paramCode]=item.paramName
      })
    },
    // 通话状态
    async handleCallStatus(){
      const res1 = await this.$API.planManage.upmsParamDataList({paramTypeCode: 'callStatus', limit: 999})
      this.callStatusSelect = res1.data
      res1.data.forEach(item => {
        this.callStatusList[item.paramCode]=item.paramName
      })
      // 终止原因的下拉框
      const res2 = await this.$API.planManage.upmsParamDataList({paramTypeCode: 'planStopReasons', limit: 999})
      res2.data.forEach(item => {
        this.stopReasonList[item.paramCode]=item.paramName
      })
      // AI审核状态
      const res3 = await this.$API.planManage.upmsParamDataList({paramTypeCode: 'vetStatus', limit: 999})
      this.AIJudgeSelect = res3.data
    },
  },

  mounted(){
    this.handleTabLabel()
    this.handleTableHeader()
    this.followStatus()
    this.handleCallStatus()
  }
}
</script>
<style lang="less" scoped>
.planList{
  background-color: #fff;
  height: 100%;
  padding: 20px;
  .tableSearch {
    display: flex;
    flex-wrap: wrap;
    .btnSearch {
      margin-bottom: 24px;
      margin-left: 20px;
    }
  }
  .tableChoose {
    margin-top: 20px;
    overflow:visible;
  }
}
.planTestDrawer{
  display: flex;
  justify-content: center;
  margin: 40px 0 50px 0;

  span {
    margin: 8px 20px 0 0;
  }
}
.baseMess {
  border-bottom: 1px solid #ccc;
}
.RowSpace {
    margin-bottom: 20px;
    .Name {
      color: #3366FF;
      font-size: 24px;
      font-weight: 600;
    }
    .Age{
      color: #3366CC;
      margin-left: 20px;
    }
  }
.testList {
  padding: 20px 0;
  border-bottom: 1px solid #ccc;
  p, h3{
    margin-bottom: 7px;
  }
  .targetResult{
    display: flex;
    flex-wrap: wrap;
  }
 .audioList {
   margin-top: 20px;
   display: flex;
   align-items: center;
    span {
      margin-right: 20px;
    }
 }
 .languCommit{
   .langAI {
     display: flex;
   }
   .langWord {
      display: flex;
      justify-content: flex-end;
      margin-top: 10px;
      p{
        margin: -10px 60px 20px 0;
      }
      audio{
        margin-right: 20px;
        margin-top:5px;
      }
   }
  .picBlock{
    width: 40px;
    height: 40px;
    line-height: 60px;
    background-color: rgb(242, 242, 242);
    text-align: center;
    img{
      width: 20px;
      height: 25px;
    }
  }
  p{
    width: 280px;
    padding: 8px 10px 8px 10px;
    background-color: rgb(242, 242, 242);
    margin-left: 20px;
  }
 }
}
</style>





