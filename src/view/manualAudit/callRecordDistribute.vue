<template>
  <div>
    <Row class="user_main_search common_search" :gutter="16">
     <Col span="5">
				<span>随访类型</span>
				<Select v-model="searchParams.followupType" clearable>
					<Option v-for="item in followupTypeNum" :value="item.planTypeId" :key="item.planTypeId">{{item.planTypeName}}</Option>
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
      <Col span="8">
				<span>执行时间</span>
				<date-time-picker :timeBegin.sync="searchParams.beginDate" :timeEnd.sync="searchParams.endDate" :is-default-today="true"></date-time-picker>
			</Col>
      <Col span="5">
				<span>分配状态</span>
				<Select v-model="searchParams.allocatStatus" clearable>
					<Option value="-1">全部</Option>
					<Option value="0">未分配</Option>
					<Option value="1">已分配</Option>
				</Select>
			</Col>
			<Col span="2">
				<Button @click="handlePage(1)" type="primary" :loading="tableParams.isLoading" v-permission="this.$API.phoneCalls.callRecordDistribute">查询</Button>
			</Col>
    </Row>
    <Card style="overflow: auto;">
			<organization-shrink @chosen="selectTree" ref="orgTree" style="float:left;"/>
      <div style="overflow: auto;">
      	<Table :columns="configAll" :data="tableParams.data" :loading="tableParams.isLoading" class="table"></Table>
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
    <!-- 已添加弹框 -->
    <Drawer
			title="已添加记录"
			v-model="isRecordDrawerShow"
			width="650"
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
			:mask-closable="false">
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
    title: '已分配人员',
    key: 'outCallPeople'
  }
]
export default {
  name: 'callRecord',
  components: {
    organizationShrink,
    dateTimePicker
  },
  data(){
   return {
    chosenUserId: '',
    followupTypeNum: [],
    isAddAll: false,
    isUserDrawerShow: false,
    isRecordDrawerShow: false,
    chosenTableData: [], // 已添加的数据
    searchParams: {
      pager:1,
      limit: 10,
      userId: sessionStorage.getItem('rsysUserId'),
    },
    tableParams: {
      data: [],
      total: 0,
      isLoading: false,
    },
    configAll: [
      ...baseConfig,
      {
        title: '操作',
        key: 'action',
        width: 100,
        align: 'center',
        render: (h, params) => {
          return h('div', [
          h('Button',{
            props: {
              size: 'small',
              type:'default',
              disabled: params.row.isChosen
            },
           
            on: {
              click: () => {
                this.handleAdd(params.row, params.index)
              }
            }
          },
          params.row.isChosen ? '已添加' : '添加')
        ])
      }
    }],
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
              },'移除')
            ])
          }
        }
    ]
   }
  },
  methods: {
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
  // 随访类型下拉框
  async handleFollowType(){
    const res = await this.$API.planManage.planTypeList({ limit: 9999, pager: 1 })
    this.followupTypeNum = res.data
  },
  // 列表
  async handleCallRecord(params){
    this.tableParams.isLoading = true
    const res = await this.$API.phoneCalls.callRecordDistribute({
      ...this.searchParams,
      ...params,
      })
    this.tableParams.data = this.formData(res.data, this.chosenTableData, 'recordId', 'isChosen')
     this.tableParams.total = res.total
      this.tableParams.isLoading = false
  },
  handleRemove (id, index) {
  this.chosenTableData.splice(index, 1)
    this.tableParams.data.forEach(item => {
      if (item.recordId === id) {
        item.isChosen = false
      }
    })
  },
    // 添加当页
    handleAddCurrentPage () {
      this.tableParams.data.forEach((item, index) => {
        if(!item.isChosen){
          this.handleAdd(item, index)
        }
      })
    },
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
    // 添加所有,分配
    handleDistribute(type = 'ids'){
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
    handlePage(pager){
      this.searchParams.pager=pager
      this.handleCallRecord()
    },
    selectTree (data) {
      this.searchParams.organizationId = data[0] && data[0].organizationId
      this.handleCallRecord()
    },
    // 分配的弹框
    async handleQueryUser () {
      this.tableParamsUser.isLoading = true
      const res = await this.$API.userManage.list(this.searchParamsUser)
      this.tableParamsUser.data = res.data
      this.tableParamsUser.isLoading = false
      this.chosenUserId = ''
    },
    selectTreeModal (data) {
      this.searchParamsUser.organizationId = data[0] && data[0].organizationId
      this.handleQueryUser()
    },
    // 单击某一行的时候触发
    handleRowClick (rowData) {
      this.chosenUserId = {
        userId: rowData.userId,
        userName: rowData.realName
      }
    },
     async postData () {
      // const postData = JSON.parse(JSON.stringify(this.searchParams))
      // 全选所有的时候为true
      if (this.isAddAll) {
          await this.$API.phoneCalls.callRecordList({
            ...this.searchParams,
            userId: this.chosenUserId.userId,
            userName: this.chosenUserId.userName
          })
          this.isUserDrawerShow = false
          this.$Message.success('分配成功！')
          this.handleCallRecord()
        } else {
          const ids = []
          this.chosenTableData.forEach(item => {
            ids.push(item.recordId)
          })
          await this.$API.phoneCalls.callDataDistribute({
            records: ids.join(),
            userId: this.chosenUserId.userId,
            userName: this.chosenUserId.userName
          })
          this.isUserDrawerShow = false
          this.$Message.success('分配成功！')
          this.handleCallRecord()
        }
    }
  },
  mounted () {
   this.handleCallRecord()
   // 随访的
   this.handleFollowType()
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
