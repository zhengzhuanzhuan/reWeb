<template>
  <div class="homeContent">
    <Row :gutter="8">
      <i-col :xs="12" :md="8" :lg="8" style="height: 120px;padding-bottom: 8px;">
        <Card shadow class="info-card-wrapper" :padding="25">
          <div class='card-message'>
            <p>{{userName}}</p>
            <span>{{position}}</span>
          </div>
          <p>下午好，已等待您{{awaitTimer}}个小时</p>
        </Card>
      </i-col>
      <div style="display: flex;height: 120px;padding-bottom: 8px">
        <infor-card shadow :icon='followRecord' :icon-size="36" v-permission="this.$API.homePage.checkCount">
          <h4>随访记录审核</h4>
          <count-to :end="checkCount.checkedCount" count-class="count-style">
            <template slot='left'>已审核</template>
            <template slot='right'>条</template>
          </count-to>
          <count-to :end="checkCount.noCheckCount" count-class="count-style">
            <template slot='left'>待审核</template>
            <template slot='right'>条</template>
          </count-to>
        </infor-card>
        <infor-card shadow :icon='callOut' :icon-size="36"  v-permission="this.$API.homePage.callCount">
          <h4>人工外呼记录</h4>
          <count-to :end="callCount.callCount" count-class="count-style">
            <template slot='left'>已外呼</template>
            <template slot='right'>条</template>
          </count-to>
          <count-to :end="callCount.noCallCount" count-class="count-style">
            <template slot='left'>待外呼</template>
            <template slot='right'>条</template>
          </count-to>
        </infor-card>
        <infor-card shadow :icon='planRepeat' :icon-size="36">
          <h4 style="marginBottom: 30px">计划重复匹配审核</h4>
          <count-to :end="repeatPlanCount.repeatPlanCount" count-class="count-style">
            <template slot='left'>待审核</template>
            <template slot='right'>条</template>
          </count-to>
        </infor-card>
        <infor-card shadow :icon='followNum' :icon-size="36">
          <h4>随访人次</h4>
          <count-to :end="recordCount.followupCount" count-class="count-style">
            <template slot='left'>已随访</template>
            <template slot='right'>条</template>
          </count-to>
          <count-to :end="recordCount.successFollowupCount" count-class="count-style">
            <template slot='left'>成功随访</template>
            <template slot='right'>条</template>
          </count-to>
        </infor-card>
      </div>
    </Row>
    <Card shadow style='marginBottom: 20px;height: 430px'>
      <p slot="title">就诊信息统计</p>
      <div slot="extra" style="display: flex">
        <Cascader
          :data="menuList"
          v-model="DoctorTree"
          style="marginRight: 20px;width: 300px"
          placeholder="全部科室"
          @on-change="handleDoctorChange"
          @on-visible-change='handleDoctorStatus'
          change-on-select
        ></Cascader>
        <date-time-picker
        :timeBegin.sync="formValidate.dateBegin"
        :timeEnd.sync="formValidate.dateEnd"
        :is-default-today="true"
        @chosen="selectDoctorTimer"
        style="width: 300px"
        ></date-time-picker>
      </div>
      <Row :gutter="40" >
        <Col span='10'>
          <Table :columns="columns1" :data="DoctorTableList"></Table>
        </Col>
        <Col span='3' class='contentMes'>
          <p class="mes1">就诊累计情况</p>
          <p class="mes2">就诊患者数</p>
          <count-to :end="DoctorHZTotal" count-class="mes3"></count-to>
        </Col>
        <Col span='11'>
          <p v-if='!DoctorHZList.length' style='textAlign: center;marginTop: 18%'>暂无数据</p>
          <medical-line v-else :value='DoctorHZList' style="height: 310px"/>
        </Col>
      </Row>
    </Card>
    <Card shadow>
      <p slot="title">随访详情统计</p>
      <div slot="extra" style="display: flex">
        <Select
          v-model="formItem.icd"
          filterable
          @on-change='handleDisease'
          style="width: 250px"
		      placeholder="全部疾病"
          clearable>
          	<Option v-for="item in diseaseNum" :value="item.icd" :key="item.diseaseId">{{ item.icdName }}</Option>
        </Select>
        <Cascader
          :data="menuList"
          v-model="followTree"
          style="margin:0 20px;width: 250px"
          placeholder="全部科室"
          @on-change="handleFollowChange"
          @on-visible-change='handleFollowStatus'
          change-on-select></Cascader>
        <date-time-picker
          :timeBegin.sync="formItem.dateBegin"
          :timeEnd.sync="formItem.dateEnd"
          :is-default-today="true"
          @chosen="selectFollowTimer"
          style="width: 300px"></date-time-picker>
      </div>
      <Row :gutter="30" >
        <Col span='4'>
          <ul class="followDetail">
            <li>
              <div>
                <p>随访人数</p>
                <p>{{followDetail.hzNum || '--'}}</p>
              </div>
            </li>
            <li>
              <div>
                <p>随访人次</p>
                <p>{{followDetail.hzCount || '--'}}</p>
              </div>
            </li>
            <li>
              <div>
                <p>成功随访数</p>
                <p>{{followDetail.followupCount || '--'}}</p>
              </div>
            </li>
          </ul>
        </Col>
        <Col span='20'>
          <p v-if='!followList.length' style='textAlign: center;marginTop: 13%'>暂无数据</p>
          <example v-else :value='followList' style="height: 370px;"/>
        </Col>
      </Row>
      <div class="targetCall">
        <p class="headerTitle">指标采集与通话情况</p>
        <Row :gutter="20" >
          <Col span='12' class="targetPie">
            <p v-if='!targetNum.length' style='textAlign: center;marginTop: 18%'>暂无数据</p>
            <Row :gutter="20" v-else>
              <Col span='15'>
                <p class="pieTitle">指标采集</p>
                <patient-pie style="height: 300px;" :value="targetNum" :color="targetColor"/>
              </Col>
              <Col span='9'>
                <ul>
                  <li v-for='(item,index) in targetNum' :key='index'>
                    <i :style="`background:${targetColor[index]}`"></i>
                    <p>{{item.collectName}}</p>
                    <p class="count">{{item.collectNum}}人</p>
                    <p>{{item.collectPercent}}</p>
                  </li>
                </ul>
              </Col>
            </Row>
          </Col>
          <Col span='12' class="targetPie">
            <p v-if='!callStatusNum.length' style='textAlign: center;marginTop: 18%'>暂无数据</p>
            <Row :gutter="20" v-else>
              <Col span='15'>
                <p class="pieTitle">通话情况</p>
                <patient-pie style="height: 300px;" :value="callStatusNum" :color="callColor"/>
              </Col>
              <Col span='9'>
                <ul>
                  <li v-for='(item,index) in callStatusNum' :key='index'>
                     <i :style="`background:${callColor[index]}`"></i>
                    <p>{{item.collectName}}</p>
                    <p class="count">{{item.collectNum}}人</p>
                    <p>{{item.collectPercent}}</p>
                  </li>
                </ul>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </Card>
  </div>
</template>

<script>
import { timeFn } from '@/libs/tools'
import { formatToTreeData } from '@/libs/businessUtil'
import InforCard from '_c/info-card'
import CountTo from '_c/count-to'
import { ChartPie, ChartBar } from '_c/charts'
import dateTimePicker from '../../common-components/date-time-picker'
import Example from './example.vue'
import medicalLine from './medicalInformation'
import patientPie from './patientPie'
import callOut from '@/assets/images/callOut.png'
import followNum from '@/assets/images/followNum.png'
import followRecord from '@/assets/images/followRecord.png'
import planRepeat from '@/assets/images/planRepeat.png'
export default {
  name: 'home',
  components: {
    patientPie,
    medicalLine,
    dateTimePicker,
    InforCard,
    CountTo,
    ChartPie,
    ChartBar,
    Example
  },
  data () {
    return {
      callOut,
      followNum,
      followRecord,
      planRepeat,
      userName: sessionStorage.getItem('rsysUserName'),
      position: sessionStorage.getItem('rsysPosition'),
      awaitTimer: timeFn(sessionStorage.getItem('rsysLastLoginTime')),
      callStatusNum: [],
      targetNum: [],
      followList: [],
      followDetail: {},
      DoctorHZTotal: 0,
      DoctorHZList: [],
      DoctorTableList: [],
      diseaseNum: [],
      formItem: {},
      followTree: [],
      DoctorTree: [],
      menuList: [],
      checkCount: {},
      callCount: {},
      repeatPlanCount: {},
      recordCount: {},
      formValidate: {},
      targetColor: ['#033fff', '#4a9ff5', '#5ff4ee'],
      callColor: ['#6b76ff', '#a5ae77', '#c8e4fe', '#033fff', '#4a9ff5', '#5ff4ee', '#769fcd', '#b9d7ea', '#5176C9', '#415f77'],
      columns1: [
        {
          title: '排名',
          render: (h, params) => {
            return h('div', params.row._index + 1)
          }
        },
        {
          title: '姓名',
          key: 'realName'
        },
        {
          title: '接诊量',
          key: 'jzNum',
          sortable: true
        },
        {
          title: '随访量',
          key: 'sfNum'
        }
      ]
    }
  },
  methods: {
    // 就诊信息
    async handleDoctorMesList (params) {
      const res = await this.$API.homePage.seeDoctor({
        organizationId: this.DoctorTree[this.DoctorTree.length - 1],
        ...this.formValidate,
        ...params
      })
      this.DoctorTableList = res.data.slice(0, 8)
    },
    // 就诊患者
    async handleDoctorHZList (params) {
      const res = await this.$API.homePage.seeADoctorHZCount({
         organizationId: this.DoctorTree[this.DoctorTree.length - 1],
        ...this.formValidate,
        ...params
      })
      this.DoctorHZList = res.data.data
      this.DoctorHZTotal = res.data.total
    },
    // 随访列表
    async handleFollowList (params) {
      const res = await this.$API.homePage.followUpList({
        organizationId: this.followTree[this.followTree.length - 1],
        ...this.formItem,
        ...params
      })
      this.followList = res.data
    },
    // 随访详情
    async handleFollowDetail (params) {
      const res = await this.$API.homePage.followUpCount({
        organizationId: this.followTree[this.followTree.length - 1],
        ...this.formItem,
        ...params
      })
      this.followDetail = res.data || {}
    },
    handleCompare (property) {
      return function (a, b) {
        return b[property] - a[property]
      }
    },
    // 指标采集
    async handleTarget (params) {
      const res = await this.$API.homePage.targetCollected({
        organizationId: this.followTree[this.followTree.length - 1],
        ...this.formItem,
        ...params
      })
      this.targetNum = res.data.sort(this.handleCompare('collectNum'))
    },
    // 通话状态
    async handleCallStatus (params) {
      const res = await this.$API.homePage.followupStatus({
        organizationId: this.followTree[this.followTree.length - 1],
        ...this.formItem,
        ...params
      })
      this.callStatusNum = res.data.sort(this.handleCompare('collectNum'))
    },
    handleDoctorChange (value) {
      if (!value.length) {
        this.handleDoctorMesList({ organizationId: '' })
        this.handleDoctorHZList({ organizationId: '' })
      }
    },
    handleDoctorStatus (status) {
      if (!status) {
        this.handleDoctorMesList()
        this.handleDoctorHZList()
      }
    },
    selectDoctorTimer () {
      if (this.formValidate.dateBegin) {
        this.handleDoctorMesList()
        this.handleDoctorHZList()
      } else {
        this.$Message.warning('请选择时间哦!')
      }
    },
    handleFollowChange (value, selectData) {
      if (!value.length) {
        this.handleFollowList({ organizationId: '' })
        this.handleFollowDetail({ organizationId: '' })
        this.handleTarget({ organizationId: '' })
        this.handleCallStatus({ organizationId: '' })
      }
    },
    handleFollowStatus (status) {
      if (!status) {
        this.handleInterface()
      }
    },
    handleDisease (value) {
      this.handleInterface()
    },
    selectFollowTimer () {
      if (this.formItem.dateBegin) {
        this.handleInterface()
      } else {
        this.$Message.warning('请选择时间哦!')
      }
    },
    async handleTotal () {
       // 人工外呼记录
      const res1 = await this.$API.homePage.callCount({})
      this.callCount = res1.data || {}
       // 随访审核
      const res2 = await this.$API.homePage.checkCount({})
      this.checkCount = res2.data || {}
       // 计划重复审核
      const res3 = await this.$API.homePage.repeatPlanCount({})
      this.repeatPlanCount = res3.data || {}
      // 随访人次
      const res4 = await this.$API.homePage.recordCount({})
      this.recordCount = res4.data || {}
      // 疾病
      const res5 = await this.$API.followTemp.dataDisease({ pager: 1, limit: 999 })
      this.diseaseNum = res5.data
    },
    // 获取组织数据
    async getMenuList () {
      const res = await this.$API.organizeManage.orangeList({ userId: sessionStorage.getItem('rsysUserId') })
      const resData = res.data || []
      this.menuList = formatToTreeData({
        shouldGetParentNameArr: true,
        baseArr: resData,
        parentIdName: 'parentId',
        idName: 'value',
        sortName: 'sort',
        expand: true,
        childrenFn: function (item) {
          return {
            value: item.organizationId,
            label: item.name,
            parentId: item.parentId,
            sort: item.sort,
            expand: true,
            description: item.description,
            children: []
          }
        }
      })
    },
    handleInterface () {
      this.handleFollowList()
      this.handleFollowDetail()
      this.handleTarget()
      this.handleCallStatus()
    }
  },
  mounted () {
    this.handleTotal()
    this.getMenuList()
    this.handleDoctorMesList()
    this.handleDoctorHZList()
    this.handleInterface()
  }
}
</script>

<style lang="less">
.homeContent{
  .count-style{
    font-size: 14px;
    font-weight: 600;
    padding: 0 5px;
  }
  .card-message{
    display: flex;
    p{
      font-size: 20px;
      font-weight: 600;
      margin: -6px 30px 20px 0;
    }
  }
  .contentMes{
    text-align: center;
    height: 350px;
    border-left: 1px solid #eee;
    border-right: 1px solid #eee;
    .mes1{
      margin: 20px 0 60px 0;
      font-size: 18px;
    }
    .mes2{
      margin-bottom: 15px;
    }
    .mes3{
      font-size: 18px;
    }
  }
  .followDetail{
    list-style: none;
    text-align: center;
    border-right: 1px solid #eee;
    li{
      height: 130px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-bottom: 1px solid #eee;
    }
   li:last-child{
     border-bottom: none;
   }
  }
  .targetCall{
    border-top: 1px solid #eee;
    .headerTitle{
      height: 50px;
      line-height: 50px;
      font-size: 14px;
      color: #17233d;
      font-weight: 700;
      border-bottom: 1px solid #eee;
    }
    .targetPie {
      height: 350px;
      border-right: 1px solid #eee;
      .pieTitle{
        margin: 20px 0 0 20px;
        font-weight: 600;
      }
      ul{
        list-style: none;
        li{
          display: flex;
          margin-top: 20px;
          i{
            display: block;
            background: red;
            width: 15px;
            height: 15px;
            border-radius: 5px;
            margin: 3px 5px 0 0;
          }
          .count{
            margin: 0 20px;
          }
        }
      }
    }
  }

}

</style>
