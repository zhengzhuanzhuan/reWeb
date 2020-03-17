<template>
  <div class="planList">
    <organization-shrink @chosen="selectTree" :orgScroll='true'></organization-shrink>
    <Tabs @on-click='handleTabs'>
      <TabPane 
        v-for='(item, index) in tabLable' 
        :key='index'
        :label="item.planTypeName" 
        :name='item.planTypeId'
        >
        <Form :model="formValue" :label-width="90" class='tableSearch'>
          <FormItem label="姓名">
            <Input v-model="formValue.brxm" placeholder="请输入姓名" style="width: 180px"></Input>
          </FormItem>
           <FormItem label="方案名称">
            <Input v-model="formValue.schemeName" placeholder="请输入方案名称" style="width: 180px"></Input>
          </FormItem>
          <FormItem label="计划状态">
            <Select v-model="formValue.status" style="width: 180px;" clearable>
              <Option v-for='(item, index) in planStatusNum' :key='index' :value="item.paramCode">{{item.paramName}}</Option>
            </Select>
          </FormItem>
          <FormItem label="计划开始日期" style='marginLeft:20px'>
            <date-time-picker 
              :timeBegin.sync="formValue.startTime" 
              :timeEnd.sync="formValue.endTime" 
              :is-default-today="true"
               style="width:280px"
            ></date-time-picker>
          </FormItem>
          <Button type="primary" class='btnSearch' @click='handlePageNum(1)' v-permission="$API.planList.followPlanList">查询</Button>
        </Form>
        <Table 
          ref='selection'
          :columns="columnsFields"
          @on-selection-change='handleTableRow'
          :data="tableData"></Table>
        <div class="tableChoose" v-if='pageData.total'>
          <Button @click="handleSelectPage(index)" :type="selectAllPage=='page'? 'primary' : 'default'">全选当页</Button>
          <Button style="margin: 0 20px"  @click='handleSelectAll(index)' :type="selectAllPage=='all'? 'primary':'default'">全选所有页</Button>
          <Button type="primary" @click='batchEndPlan' :disabled='stopState'>批量终止</Button>
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
    <Drawer width='500' title="方案测试" :closable="false" v-model="planTest">
      <div style="textAlign: center">
        <p>请输入测试时的接听电话号码，发起后会立即拨打电话。</p>
        <div class='planTestDrawer'>
          <span>电话</span>
          <Input v-model="testPhone" placeholder="请输入电话号码" style='width: 300px'></Input>
        </div>
        <Button type="primary" @click='handlePlanTest'>发起测试</Button>
      </div>
    </Drawer>
    <Drawer width='600' title="计划详情" :closable="false" v-model="planDetail">
      <div>
        <div class="baseMess">
          <Row class="RowSpace">
            <Col span="12">
              <span class='Name'>{{planDetailNum.brxm}}</span>
              <span class='Age'>{{planDetailNum.brxb==1? '男':'女'}}/{{planDetailNum.age}}</span>
            </Col>
            <Col span="12">
              <Button type="primary" @click='recordResult'>查看随访记录</Button>
            </Col>
          </Row>
          <Row class="RowSpace">
            <Col span="12">
              疾病分类：{{ planDetailNum.icdName}}
            </Col>
            <Col span="12">
              联系电话: {{ planDetailNum.mobile}}
            </Col>
          </Row>
          <Row class="RowSpace">
            <Col span="12">
              所属组织:{{planDetailNum.organizationName}}
            </Col>
            <Col span="12">
              方案名称：{{planDetailNum.schemeName}}
            </Col>
          </Row>
          <Row class="RowSpace">
            <Col span="12">
              计划状态：{{planStatusList[planDetailNum.status]}}
            </Col>
            <Col span="12">
              计划开始日期：{{parseTime(planDetailNum.followupStartTime)}}
            </Col>
          </Row>
          <Row class="RowSpace">
            <Col span="12">
              就诊时间：{{parseTime(planDetailNum.orderTime)}}
            </Col>
            <Col span="12">
              生成时间：{{parseTime(planDetailNum.dateAdd)}}
            </Col>
          </Row>
          <Row class="RowSpace">
            <Col span="12">
              随访周期: {{planDetailNum.type==0?'提前':'延后'}}{{planDetailNum.firstday || '--'}}天，间隔{{planDetailNum.intervalDays}}天
            </Col>
            <Col span="12">
              随访次数：{{`${planDetailNum.followupCurrentCount}/${planDetailNum.followupCount}`}}
            </Col>
          </Row>
        </div>
        <div class='testList' v-for='(item, index) in planDetailNum.lists' :key='index'>
          <Row>
            <Col span="6">
              <h1>第{{index+1}}次</h1>
            </Col>
            <Col span="13">
              <p>预计执行日期：{{parseTime(item.planBeginDate)}} 开始</p>
              <p>实际执行时间：{{item.recordBeginDate? parseTime(item.recordBeginDate) : ''}} <span style='color: #FF9900'>{{item.recordBeginDate ? '已随访' : '等待随访'}}</span></p>
              <h3>采集指标</h3>
              <Button type="primary" class="btn" v-for='(text, index) in item.targets' :key='index'>{{text &&　text.targetName}}</Button>
            </Col>
          </Row>
        </div>
      </div>
    </Drawer>
    <Drawer width='500' title="终止计划" :closable="false" v-model="planEnd" @on-close='handlePlayEndDraw'>
      <Form ref="formValidate" :model="formValidate" :rules="validate.planlist" :label-width="80">
        <FormItem label="终止原因" prop="cancleReason">
          <Select v-model="formValidate.cancleReason" clearable>
            <Option v-for='(item, index) in stopReasonNum' :value="item.paramCode" :key='index'>{{item.paramName}}</Option>
          </Select>
        </FormItem>
        <FormItem label="详情" prop="cancleRemark">
          <Input v-model="formValidate.cancleRemark" type="textarea" placeholder="请填写终止详情"></Input>
        </FormItem>
      </Form>
      <Button type="primary" class="planEndBtn" @click='confirmEndPlan'>确认终止</Button>
    </Drawer>
    <!-- 终止详情原因 -->
    <Drawer width='500' title="终止详情" v-model="planEndReason">
      <div class="reasonDrawer">
        <h3>终止原因</h3>
        <span>{{stopReasonList[tableRow.cancleReason]}}</span>
      </div>
      <div class="reasonDrawer">
        <h3>详情</h3>
        <span>{{tableRow.cancleRemark}}</span>
      </div>
     <Divider />
     <div class="reasonMark">
       终止原因是
       <span class="spanColor">{{stopReasonList[tableRow.cancleReason]}}</span>
        ，系统已终止
        <span class="spanColor">{{tableRow.brxm}}</span>
        的
        <span class="spanColor">所有计划</span>
     </div>
    </Drawer>
  </div>
</template>
<script>
import { parseTime } from '@/libs/tools.js'
import organizationShrink from '../common-components/organization-shrink'
import dateTimePicker from '../common-components/date-time-picker'
export default {
  name: 'planType',
  components: {
    organizationShrink,
    dateTimePicker
  },
  data () {
    return {
      planEndReason:false,
      parseTime,
      stopState: true,
      testPhone: '',
      formValidate: {
      },
      formValue: {},
      tableData: [],
      pageData: {
        total: 0,
        pageSize: 10,
        current: 1,
      },
      columnsFields: [],
      planDetail: false,
      planTest: false,
      planEnd: false,
      tableRow: {},
      planIdSign: false,
      // 全选当页
      selectAllPage: '',
      stopReasonNum: [],
      tabLable: [],
      planTypeNum: '',
      planStatusNum: [],
      listOrigin: '',
      // 点击表格每行的数据
      tableRowData: [],
      planDetailNum: {},
      planStatusList: {},
      // 终止原因
      stopReasonList:{}
    }
  },
  methods: {
   
    // 随访记录的跳转
    recordResult(){
      this.$router.push({path:'/planManage/recordResult'})
    },
   
    handleTabs(data){
      this.planTypeNum=data
      this.handlePlanList({
        pager:1,
        followupType: data,
      })
    },
    // 表格的动态表头数据
    async handleTableHeader(){
      const res = await this.$API.planManage.visiFieldList({pager: 1, type: 1,limit: 999})
      this.columnsFields = [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        ...res.data.map((item, index)=> ({
            title: item.showName,
            key: item.fieldName,
            render: (h, params) => {
              let text=''
              switch(item.fieldName){
                case 'cancleReason':
                 text = this.stopReasonList[params.row.cancleReason]
                 break;
                case 'status':
                 text = this.planStatusList[params.row.status]
                 break;
                case 'isRepeat':
                 text = params.row.isRepeat?'有': '无'
                 break;
                case 'isDeleted':
                 text = params.row.idDeleted?'删除': '正常'
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
          width: 300,
          align: 'center',
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
                    value: this.$API.planList.followPlanTest
                  }
                ],
                on: {
                  click: () => {
                     this.planTest = true
                     this.tableRowData = params.row
                  }
                }
              }, '方案测试'),
              h('Button', {
                props: {
                  type: 'text',
                  size: 'small'
                },
                style: {
                  margin: '0 10px'
                },
                directives: [
                  {
                    name: 'permission',
                    value: this.$API.planList.followPlanDetail
                  }
                ],
                on: {
                  click: () => {
                    this.handlePlanDetail(params.row.planId)
                  }
                }
              }, '计划详情'),
              h('Button', {
                props: {
                  type: 'text',
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.handlePlanModal(params.row)
                  }
                }
              },params.row.status==4? '终止详情':'终止计划'),
              h('Button', {
                props: {
                  type: 'text',
                  size: 'small'
                },
                style: {
                  marginLeft: '10px'
                },
                directives: [
                  {
                    name: 'permission',
                    value: this.$API.planList.followPlanDelete
                  }
                ],
                on: {
                  click: () => {
                    this.handleDelete(params.row.planId)
                  }
                }
              }, '删除')
            ]);
          }
        }
      ] 
    },
    handlePlanModal(data){
      this.tableRow =data
       this.planIdSign = false
      if(data.status == 4){
        this.planEndReason= true
      } else {
         this.planEnd = true
      }
    },
     // 设置表格的全选
    handleSelectPage (index) {
      this.$refs.selection[index].selectAll(true)
      this.selectAllPage = 'page'
    },
    handleTableRow (row) {
      if (row.length) {
        this.stopState = false
      } else {
        this.stopState =true
      }
      this.selectAllPage = 'page'
       const planIds = row.map((item, index) => (
        item.planId
      ))
      this.tableRow.planId = planIds.join(',')
    },
    handleSelectAll (index) {
      this.$refs.selection[index].selectAll(false)
      this.stopState = false
      this.selectAllPage = 'all'
    },
     // 获取表头数据
    async handleTabLabel () {
      const res = await this.$API.planManage.tabChange({ userId: sessionStorage.getItem('rsysUserId') })
      this.tabLable = res.data
      this.planTypeNum = res.data[0] && res.data[0].planTypeId
      this.$nextTick(() => {
        this.handlePlanList({followupType: this.planTypeNum })
      })
    },
    // 列表
    async handlePlanList (params) {
      const res = await this.$API.planList.followPlanList({
        pager: this.pageData.current,
        limit:  this.pageData.pageSize,
        followupType: this.planTypeNum,
        organizationId: this.listOrigin,
        ...this.formValue,
        ...params
      })
      this.tableData = res.data
      this.pageData.total = res.total
    },
    // 方案测试
    async handlePlanTest () {
      const res = await this.$API.planList.followPlanTest({planId: this.tableRowData.planId,phone:this.testPhone})
      this.$Message.success('测试成功！')
      this.planTest = false
    },
    batchEndPlan () {
      this.planEnd = true
      this.planIdSign = true
    },
    // 终止原因的下拉框
    async stopReasons () {
      const res = await this.$API.planManage.upmsParamDataList({paramTypeCode: 'planStopReasons', limit: 999})
      this.stopReasonNum = res.data
      res.data.forEach(item => {
        this.stopReasonList[item.paramCode]=item.paramName
      })
    },
    // 计划状态
    async planStatus () {
      const res = await this.$API.planManage.upmsParamDataList({paramTypeCode: 'planStatus', limit: 999})
      this.planStatusNum = res.data
      res.data.forEach(item => {
        this.planStatusList[item.paramCode]=item.paramName
      })
    },
    // 确认终止计划
    async confirmEndPlan () {
      this.$refs.formValidate.validate(async (valid) => {
        if (valid) {
          if(this.planIdSign){
            // 表格的全选为false
            if(this.selectAllPage == 'all') {
               await this.$API.planList.batchCancleAll({
                ...this.formValidate,
               ...this.formValue,
                planType: this.planTypeNum,
                userId: sessionStorage.getItem('rsysUserId'),
              })
              this.$Message.success('终止所有页成功');
              this.handlePlanList()
              this.$refs.formValidate.resetFields();
              this.planEnd= false
            } else {
              await this.$API.planList.batchEndPlay({
                planIds: this.tableRow.planId,
                ...this.formValidate,
                userId:sessionStorage.getItem('rsysUserId'),
              })
              this.$Message.success('批量终止计划成功');
              this.handlePlanList()
              this.$refs.formValidate.resetFields();
              this.planEnd = false
            }
          } else {
            // 点击终止计划
            await this.$API.planList.followEndPlay({
              planId: this.tableRow.planId,
              ...this.formValidate,
              userId: sessionStorage.getItem('rsysUserId'),
            })
            this.$Message.success('终止计划成功')
            this.handlePlanList()
            this.$refs.formValidate.resetFields()
            this.planEnd= false
          }
        } else {
          this.$Message.error('请填写终止原因！')
        }
      })
    },
    // 计划详情
    async handlePlanDetail(data){
      this.planDetail = true
      const res = await this.$API.planList.followPlanDetail({id: data})
      this.planDetailNum = res.data.followupPlanDetail || {}
    },
    // 页码改变
    handlePageNum(pager){
      this.pageData.current= pager
      this.handlePlanList({pager})
    },
    handleDelete(id){
      this.$Modal.confirm({
        title: '删除提示',
        content: "<p>确定要删除该条记录吗</p>",
        onOk: async () => {
          await this.$API.planList.followPlanDelete({ id })
          this.$Message.success('该患者已删除')
          this.handlePlanList()
        }
      })
    },
   
    // 抽屉关闭清空数据
    handlePlayEndDraw(){
      this.$refs.formValidate.resetFields();
    },
    selectTree(data){
      if (!data.length) {
        this.listOrigin = ''
      } else {
        this.listOrigin = data[0].organizationId
      }
      this.handlePlanList()
    }
  },
  mounted(){
    this.planStatus()
    this.handleTableHeader()
    this.stopReasons()
    this.handleTabLabel()
  }
}
</script>
<style lang="less" scoped>
.planList{
  background-color: #fff;
  height: 100%;
  padding: 20px;
  overflow-y: auto;
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
    // height: 170px;
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
  margin-bottom: 20px;
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
}
.testList {
  padding-bottom: 20px;
  border-bottom: 1px solid #ccc;
  p {
    margin-bottom: 10px;
  }
  .btn {
    margin: 10px 10px 0 0;
  }
}
.planEndBtn {
  margin: 0 50%;
}
.reasonDrawer {
  display: flex;
  margin-left: 40px;
  margin-bottom: 10px;
  h3{
    margin-right:20px;
  }
}
.reasonMark{
  margin-left: 30px;
  .spanColor{
  color: red;
}

}

</style>


