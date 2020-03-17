<template>
  <div class="addPlanType">
    <h2 v-if="this.$route.query.type == 'add'">添加计划类型</h2>
    <h2 v-if="this.$route.query.type == 'edit'">编辑计划类型</h2>
    <Tabs>
      <TabPane label="基本信息">
        <div class="keyWordStyle">
          <Form :model="formValue" label-position="right" :label-width="120">
            <FormItem label="计划类型名称" style="width: 60%">
              <Input v-model="formValue.planTypeName" placeholder="请输入计划类型名称"></Input>
            </FormItem>
            <FormItem label="计划类型说明" style="width: 60%">
              <Input v-model="formValue.planTypeRemark" type="textarea" :autosize="{minRows: 2,maxRows: 5}"></Input>
            </FormItem>
            <FormItem label="数据来源">
              <Select v-model="formValue.planSource"  style="width: 250px" clearable>
                <Option 
                  v-for='(item, index) in dataSourceNum' 
                  :value="`${item.paramCode}&${item.paramName}`"
                  :key='index'
                  >{{item.paramName}}</Option>
              </Select>
              <span>数据来源即计划数据来源于住院患者、门诊患者或者体检患者等</span>
            </FormItem>
            <FormItem label="触发时间">
              <Select v-model="formValue.planTime" style="width: 250px" clearable>
                <Option 
                  v-for='(item, index) in touchTimeNum' 
                  :value="`${item.paramCode}&${item.paramName}`"
                  :key='item.paramId'
                  >{{item.paramName}}</Option>
              </Select>
              <span>注：触发时间即生成计划的基础时间。</span>
            </FormItem>
            <FormItem label="是否需要审核">
              <Select v-model="formValue.isCheck" style="width: 250px" @on-change='handleIsCheck'>
                <Option :value="1">是</Option>
                <Option :value="0">否</Option>
              </Select>
            </FormItem>
            <FormItem label="是否需要人工外呼">
              <Select v-model="formValue.isOutCall" style="width: 250px" :disabled='selectDisable'>
                <Option :value="1">是</Option>
                <Option :value="0">否</Option>
              </Select>
            </FormItem>
          </Form>
        </div>
        <Button 
          type="primary" 
          style="margin: 50px 50%"
          @click='handlePlanTypeAdd'
        >保存</Button>
      </TabPane>
      <TabPane label="需要随访的组织与用户">
        <div class="followUser">
          <div class="needFollow">
            <p class="needTitle">需要随访的组织</p>
            <div class="searchTerm">
              <span style="marginRight: 10px">组织名称</span>
              <Input v-model="originForm.organizationName" style="width: 30%"/>
              <Select v-model="originForm.isRelation" style="width: 100px;margin: 0 20px" clearable>
                <Option value="">全部</Option>
                <Option value="1">已选中</Option>
                <Option value="0">未选中</Option>
              </Select>
              <Button type="primary" @click='handleOrigin'>查询</Button>
            </div>
            <div class="planTree">
              <Checkbox v-model="treeCheckValue" class='treeCheck' @on-change='handleCheckBox'>全选组织</Checkbox>
              <Tree :data="menuList" show-checkbox @on-check-change='handleTreeCheckBox'></Tree>
            </div>
          </div>
          <div class="setFllow">
            <Checkbox v-model="checkValue" class="needTitle"  @on-change='handleFollowUser'>设置需要随访的用户</Checkbox>
            <div class="setTitle">
              <p>需要随访的用户</p>
              <span>(注：选中组织下的用户)</span>
            </div>
            <div class="searchTerm">
              <span style="marginRight: 10px">用户姓名</span>
              <Input v-model="followForm.realName" style="width: 30%"/>
              <Select v-model="followForm.isRelation" style="width: 100px;margin: 0 20px" clearable>
                <Option value="">全部</Option>
                <Option value="1">已关联</Option>
                <Option value="0">未关联</Option>
              </Select>
              <Select v-model="followForm.roleId" style="width: 100px;marginRight: 20px" clearable>
                <Option 
                  v-for='(item, index) in roleSelectNum'
                  :key='index'
                  :value="item.roleId">{{item.roleName}}</Option>
              </Select>
              <Button type="primary" @click='handleUserSearch'>查询</Button>
            </div>
            <div>
              <Table 
                ref="selection" 
                :columns="userColumns" 
                :data="userTableData" 
                height="500"
                @on-selection-change='handleUserTable'
                ></Table>
            </div>
          </div>
        </div>
        <Button 
          type="primary" 
          style="margin: 15px 50%" 
          @click='handlePlanTypeAdd'>保存</Button>
      </TabPane>
      <TabPane label="需要随访的分类">
        <div class="keyWordStyle">
          <span>需要随访的分类</span>
          <Select 
            v-model="needForm.select"
            @on-change='handleShineSort'
            style="width: 100px;margin: 0 20px"
            clearable
            >
            <Option 
              v-for='(item, index) in followSortNum' 
              :key='item.paramId'
              :value="`${item.paramId}&${item.paramCode}&${item.paramName}`"
            >{{item.paramName}}</Option>
          </Select>
           <Select v-model="needForm.sort" style="width: 100px;margin: 0 20px" clearable>
            <Option value="0">全部分类</Option>
            <Option value="1">指定分类</Option>
          </Select>
          <p class="setType">当前选择为随访全部分类，如有个别分类不需要随访请添加排除随访的分类。</p>
          <div class="classify">
            <p>排除随访的分类</p>
            <div style="margin: 20px 0">
              <Tag v-for="(item, index) in labelCount" :key="index" :name="index" closable @on-close="handleClose">{{ item.dataName }}</Tag>
            </div>
             <Select
                v-model="needForm.value"
                clearable
                filterable
                style="width: 330px;marginRight: 20px"
                >
                <Option 
                  v-for="(item, index) in addFollowSort" 
                  :value="`${item.diseaseId}&${item.icd}&${item.icdName}&${item.typeId}&${item.typeCode}&${item.typeName}`"
                  :label='item.icdName'
                  :key="index">
                    <span>{{item.icdName}}</span>
                    <span style="float:right;color:#ccc">{{item.icd}}</span>
                  </Option>
            </Select>
             <Button type="primary" @click='handleAddSearch'>添加</Button>
          </div>
        </div>
         <Button 
          type="primary" 
          style="margin: 50px 50%" 
          @click='handlePlanTypeAdd'>保存</Button>
      </TabPane>
      <TabPane label="关键词">
        <div class="keyWordStyle">
          <div class='loopAdd' v-for='(item, index) in keyWordAdd' :key='index'>
            <span>关键词{{index+1}}</span>
            <Select v-model='item.content' style="width: 100px;margin: 0 20px" clearable>
              <Option v-for='(item, index) in keyWordSelectNum' :value="item.paramCode" :key='index'>{{item.paramName}}</Option>
            </Select>
            <Cascader v-model='item.cacs' :data="hospitalNum" :load-data="loadData" style="width: 200px;margin: 0 20px 0 0"></Cascader>
            <Input v-model="item.value" style="width: 200px"/>
          </div>
          <Button type="primary" style="margin: 20px 0 20px 150px"  @click='handleKeyWordAdd'>添加条件</Button>
        </div>
        <Button 
          type="primary" 
          style="margin: 50px 50%"
          @click='handlePlanTypeAdd'
          >保存</Button>
      </TabPane>
      <TabPane label="相同类型设置">
        <div class="keyWordStyle">
          <p class="setType">设置相同随访类型后，同一患者如在设置的时间内已发起过相同类型随访的任意一种随访，则不会再发起的其他相同类型随访</p>
          <div v-for='(item, index) in AddFollowSet' style='marginTop: 20px;display: flex' :key='index'>
            <span style="marginTop: 7px">相同随访类型{{index+1}}</span>
            <Select v-model="item.select" style="width: 150px;margin: 0 20px" clearable>
              <Option v-for='(item,index) in followTypeNum' :value="item.planTypeId" :key='index'>{{item.planTypeName}}</Option>
            </Select>
            <Select v-model="item.timer" style="width: 200px;margin: 0 20px" clearable>
              <Option 
                v-for='(item, index) in yearSelectNum' 
                :value="`${item.paramId}&${item.paramCode}&${item.paramName}`" :key='index'>{{item.paramName}}</Option>
            </Select>
            <span v-if="item.timer && item.timer.split('&')[1] == 1"  style="marginTop: 8px">每年1-3月，4-6月，7-9月，10-12月四个时间段</span>
            <div v-if="item.timer && item.timer.split('&')[1]  == 2">
              最近
               <InputNumber v-model="item.recently" style='margin: 0 10px;width:100px' />
              天
              <span>最近N天时间内不重复发起</span>
            </div> 
            <div v-if="item.timer && item.timer.split('&')[1] == 3">
              <date-time-picker 
                :timeBegin.sync="item.vetDateBegin" 
                :timeEnd.sync="item.vetDateEnd" 
                :is-default-today="true" style="width: 350px"></date-time-picker>
              <span>设置时间段内不能重复发起</span>
            </div>
          </div>
          <Button type="primary" style="margin: 20px 100px" @click='handleAddFollowSet'>添加</Button>
        </div>
        <Button 
          type="primary" 
          style="margin: 50px 50%"
          @click='handlePlanTypeAdd'
          >保存</Button>
      </TabPane>
    </Tabs>
  </div>
</template>
<script>
import dateTimePicker from '../common-components/date-time-picker'
import { formatToTreeData, handleArray } from '@/libs/businessUtil'

export default {
  name: 'addPlanType',
  components: {
    dateTimePicker
  },
  data () {
    return {
      selectDisable: false,
      userTreeId: [],
      dataSourceNum: [],
      userListOriginId: null,
      planTypeId: null,
      resDataTree: [],
      // 选中的树
      selectTableNum: [],
      followTypeNum: [],
      selectTree:[],
      formValue: {
        isCheck: 1,
        isOutCall: 1
      },
      ccc:[],
      AddFollowSet: [{}],
      keyWordAdd: [{}],
      yearSelectNum: [],
      hospitalNum: [],
      keyWordSelectNum: [],
      roleSelectNum: [],
      loading1: false,
      options1: [],
      labelCount: [],
      followSortNum: [],
      treeCheckValue: false,
      checkValue: false,
      touchTimeNum: null,
      menuList: [],
      followForm:{},
      originForm: {
      },
      typeValue: {},
      needForm: {},
      userTableData: [],
      addFollowSort: [],
      userColumns: [
        {
          type: 'selection',
          width: 60,
        },
        {
          title: '用户姓名',
          key: 'realName'
        },
        {
          title: '账号',
          key: 'userName'
        },
        {
          title: '角色',
          key: 'roleNames'
        },
        {
          title: '操作',
          render: (h, params) =>{
            let text = '';
            let btnType = '';
            if(params.row.isRelation){
              text = '已关联'
              btnType = 'warning'
            } else{
              text = '数据关联'
              btnType = 'primary'
            }
            return h('div', [
              h('Button', {
                props: {
                  type: btnType,
                  size: 'small'
              },
            }, text)
          ])
          }
        }
      ]
    }
  },
  methods: {
    // 是否需要审核
    handleIsCheck(value){
      if(!value){
        this.formValue.isOutCall = 0
        this.selectDisable= true
      } else{
         this.selectDisable= false
        this.formValue.isOutCall = 1
      }
    },
    // 处理用户表格
    handleUserTable(selection){
      this.selectTableNum = selection.map((item, index) => (
        {
          'organizationId': item.organizationId,
          'organizationName': item.orgainzationName,
          'realName': item.realName,
          'userId': item.userId,
          'planTypeId': this.planTypeId,
        }
      ))
    },
    handleAddFollowSet(){
      this.AddFollowSet.push({})
    },
    handleKeyWordAdd(){
      this.keyWordAdd.push({})
    },
    // 下拉改变，获取模糊输入的值
    async handleShineSort(value) {
      const res = await this.$API.diseaseManage.list({typeCode: value.split('&')[1], limit: 999, pager:1})
      this.addFollowSort = res.data
    },
    // 点击模糊搜索的添加
    handleAddSearch(){
      const lable = JSON.parse(JSON.stringify(this.labelCount))
      const lableArr = lable.map(item => item.dataName)
      if(this.needForm.value && (!lableArr.includes(this.needForm.value.split('&')[2]))){
        this.labelCount.push({
          dataId: this.needForm.value && this.needForm.value.split('&')[0],
          dataCode: this.needForm.value && this.needForm.value.split('&')[1],
          dataName: this.needForm.value && this.needForm.value.split('&')[2],
          followupTypeId: this.needForm.value && this.needForm.value.split('&')[3],
          followupTypeCode: this.needForm.value && this.needForm.value.split('&')[4],
          followupTypeName: this.needForm.value && this.needForm.value.split('&')[5],
        })
      }
    },
    //  // 点击标签的X
    handleClose (event, name) {
      this.labelCount.splice(name, 1);
    },
    // 点击树全选的复选框
    // 将所有的originId传给用户表格
    // 传值给保存接口
    handleCheckBox(check) {
      if(check) {
        const userOriginId = []
        this.resDataTree.forEach((item, index) => {
          userOriginId.push(item.organizationId)
          this.selectTree.push({
            organizationId: item.organizationId,
            title: item.name
          })
        })
        this.userList({organizationIds: userOriginId.join()})
        handleArray(this.menuList, true)
      } else {
        this.userTableData=[]
        handleArray(this.menuList, false)
      }
    },
    // 点击树的复选框
    handleTreeCheckBox(value){
      this.treeCheckValue = false
      const originId = value.map((item, index) => (item.organizationId))
      if(this.originForm.isRelation==0){
        this.selectTree=[...this.selectTree,...value]
      } else {
        this.selectTree = value
      }
      value.map(e=> {
        if(e.parentId=='0' || e.parentId==''){
          this.treeCheckValue = true
        } 
      })
      this.userListOriginId = originId.join()
       if(!value.length){
        this.userTableData=[]
      }else {
        this.userList({organizationIds: originId.join()})
      }
     
    },
    // 点击组织查询
    handleOrigin(){
      this.originTree({...this.originForm})
    },
    // 组织管理
    async originTree(params){
      const res = await this.$API.planManage.originList({
        pager: 1,
        limit: 9999,
        userId:sessionStorage.getItem('rsysUserId'),
        planTypeId: this.planTypeId,
        ...this.originForm,
        ...params
      })
      this.resDataTree = res.data || []
      res.data.forEach(item => {
        if(item.isRelation){
          this.userTreeId.push(item.organizationId)
          this.selectTree.push({
            organizationId: item.organizationId,
            title: item.name
          })
        }
      })
      if(this.$route.query.type=='edit'){
         this.userList({
          organizationIds: this.userTreeId.join(),
          planTypeId: this.$route.query.rowData.planTypeId 
        })
      } 
     // 如果有值或者下拉不为空
      if(this.originForm.organizationName){
        this.menuList = res.data.map(item=> ({
          organizationId: item.organizationId,
          title: item.name,
          checked: !!item.isRelation,
         }))
         return 
      }
      this.menuList = formatToTreeData({
        baseArr: this.resDataTree,
        parentIdName: 'parentId',
        idName: 'organizationId',
        sortName: 'sort',
        childrenFn: function (item) {
          return {
            parentId: item.parentId,
            organizationId: item.organizationId,
            title: item.name,
            expand: true,
            checked: !!item.isRelation,
            children: []
          }
        },
      })
    },
    // 添加计划类型
    async handlePlanTypeAdd (params) {
      const playTypeTypes = this.labelCount.map((item, index) => ({
        ...item,
        isAll: this.needForm.sort,
        planTypeId: this.planTypeId
      }))
      const followSameSet = this.AddFollowSet.map((item, index) => ({
        sameTypeId: item.select,
        dataId: item.timer && item.timer.split('&')[0],
        dataCode: item.timer && item.timer.split('&')[1],
        dataName: item.timer && item.timer.split('&')[2],
        dataBegin:item.recently || item.vetDateBegin || 1,
        dataEnd: item.vetDateEnd,
        planTypeId: this.planTypeId
      }))
      const typeKeyNum =this.keyWordAdd.map((item, index) => ({
        keyValue: item.value,
        isHave: item.content,
        dataId: item.cacs && item.cacs[0].split('&')[0],
        dataCode: item.cacs && item.cacs[0].split('&')[1],
        dataColumn:item.cacs && item.cacs[0].split('&')[2],
        dataName: item.cacs && item.cacs[1],
        planTypeId: this.planTypeId
      }))
      const treeAndTable = this.selectTree.map((item, index) => ({
        isNeedUser: this.checkValue? 1: 0,
        organizationId: item.organizationId,
        organizationName: item.title,
        planTypeId: this.planTypeId,
        'visitPlanTypeUsers': this.selectTableNum && this.selectTableNum.filter((text, index)=> {
          if(item.organizationId == text.organizationId) {
            return text
          }
        })
      }))
      const postData = {
       "visitPlanType": {
         ...this.formValue,
         planSource: this.formValue.planSource && this.formValue.planSource.split('&')[0],
         planSourceName: this.formValue.planSource && this.formValue.planSource.split('&')[1],
         planTime: this.formValue.planTime && this.formValue.planTime.split('&')[0],
         planTimeName: this.formValue.planTime && this.formValue.planTime.split('&')[1],
         planTypeId: this.planTypeId
       },
       "visitPlanTypeOrganizationQueries": treeAndTable,
       "visitPlanTypeTypes": playTypeTypes,
       "visitPlanTypeKeys": typeKeyNum,
       "visitPlanTypeSames": followSameSet
      }
      if(this.planTypeId){
        const res =  await this.$API.planManage.planTypeEdit(postData)
        this.$Message.success('编辑成功')
      } else {
        const res =  await this.$API.planManage.planTypeAdd(postData)
        this.planTypeId= res.data 
        this.$Message.success('添加成功')
        this.handleFollowType(res.data)
      }
    },
    
    // 设置需要随访的用户
    handleFollowUser(data){
      if(data){
        this.userTableData && this.userTableData.map(item => {
          item._disabled = false
        })
      } else {
        this.userTableData && this.userTableData.map(item => {
          item._disabled = true
        })
      }
    },
    // 用户管理列表
    async userList(params) {
      const res = await this.$API.planManage.userList({
        userId: sessionStorage.getItem('rsysUserId'),
        organizationIds: this.userTreeId.join(),
        planTypeId: this.planTypeId,
        ...params,
      })
      res.data && res.data.forEach((item, index)=> {
        if(item.isRelation == 1) {
          this.selectTableNum.push(
            {
              'organizationId': item.organizationId,
              'organizationName': item.orgainzationName,
              'realName': item.realName,
              'userId': item.userId,
              'planTypeId': this.planTypeId,
            })
          item._checked = true
          this.checkValue = true
          return res.data
        } else {
          item._disabled = true
          return res.data
        }
      })
      if(this.checkValue) {
        res.data && res.data.map(e => e._disabled = false)
      }
      this.userTableData = res.data
    },
    
    // 相同随访类型的一个下拉框
    async handleFollowType(data){
      const res1 = await this.$API.planManage.planTypeList({pager: 1, limit: 999})
      this.followTypeNum = res1.data
      // 添加和编辑的时候添加当前计划类型
      for(var i=0;i<this.followTypeNum.length;i++){
        if(this.$route.query.type=='edit') {
          if(this.followTypeNum[i].planTypeName == this.$route.query.rowData.planTypeName){
            this.followTypeNum[i].planTypeName = '当前计划类型'
          } 
        } else {
          if(this.followTypeNum[i].planTypeId == data){
            this.followTypeNum[i].planTypeName = '当前计划类型'
          } 
        }
      }
       // 出院小结下拉框
      const res2 = await this.$API.planManage.upmsParamDataList({paramTypeCode: 'planTypeTable', limit: 999})
      this.hospitalNum = res2.data.map((item, index) => {
        return{
          value: `${item.paramId}&${item.paramCode}&${item.paramName}`,
          label: item.paramName,
          children: [],
          loading: false
        }
      })
       //  随访类型的按季度
      const res3 = await this.$API.planManage.upmsParamDataList({paramTypeCode: 'planTypeTimeRange', limit: 999})
      this.yearSelectNum = res3.data
       // 触发时间
      const res4 = await this.$API.planManage.upmsParamDataList({paramTypeCode: 'TriggerTime', limit: 999})
      this.touchTimeNum = res4.data
       // 数据来源
      const res5 = await this.$API.planManage.upmsParamDataList({paramTypeCode: 'dataSource', limit: 999})
      this.dataSourceNum = res5.data
        // 随访分类的下拉
      const res6 = await this.$API.planManage.upmsParamDataList({paramTypeCode: 'followUpType', limit: 999})
      this.followSortNum = res6.data
      // 关键词的包含和排除
       const res7 = await this.$API.planManage.upmsParamDataList({paramTypeCode: 'planTypeKey', limit: 999})
      this.keyWordSelectNum = res7.data
        // 角色列表
      const res8 = await this.$API.planManage.roleList({pager: 1, limit: 999})
      this.roleSelectNum = res8.data
    },
    // 级联选择器的异步加载
    loadData(item, callback){
      item.loading = true;
      this.hospitalNum.forEach(async(text,index)=> {
        if(text.label == item.label) {
          const res = await this.$API.planManage.patientSelect({ tableName: item.value.split('&')[1] })
          text.children = res.data && res.data.map((item, index) => ({
            value: item.columnName,
            label: item.columnComment
          }))
          item.loading = false
          callback()
        }
      })
    },
  
    // 用户的列表搜索
    handleUserSearch(){
      this.userList({...this.followForm})
    },
    // 相同类型的编辑
    async editSameField() {
      const res = await this.$API.planManage.addSameField({planTypeId: this.planTypeId})
      if(res.data && res.data.length){
        this.AddFollowSet = res.data.map((item,index)=> ({
          select: item.sameTypeId,
          timer: `${item.dataId}&${item.dataCode}&${item.dataName}`,
          vetDateBegin: item.dataCode == 3? item.dataBegin: '',
          vetDateEnd: item.dataCode == 3? item.dataEnd: '',
          recently: item.dataCode == 2? parseInt(item.dataBegin) : null,
        }))
      }else {
        this.AddFollowSet=[{}]
      }
    },
    // 关键字的编辑
     async editKeyField() {
      const res = await this.$API.planManage.addKeyField({planTypeId: this.planTypeId})
      if(res.data && res.data.length){
        this.keyWordAdd = res.data.map((item, index)=> ({
          content: item.isHave+'',
          value: item.keyValue,
          cacs: [].concat(`${item.dataId}&${item.dataCode}&${item.dataColumn}`, item.dataName)
        }))
      } else {
        this.keyWordAdd = [{}]
      }
    },
    // 需要随访的分类的标签
    async addAddField() {
      const res = await this.$API.planManage.addList({planTypeId: this.planTypeId})
      this.labelCount = res.data.map((item, index) => ({
        dataId: item.dataId,
        dataCode: item.dataCode,
        dataName: item.dataName,
        followupTypeId: item.followupTypeId,
        followupTypeCode: item.followupTypeCode,
        followupTypeName: item.followupTypeName,
      }))
    },
    handleEdit () {
      const rowData = JSON.parse(this.$route.query.rowData)
      const type = this.$route.query.type
      if(type == 'edit') {
        this.formValue.isCheck = rowData.isCheck
        if(!rowData.isCheck){
          this.selectDisable= true
        }
        this.formValue.isOutCall = rowData.isOutCall
        this.planTypeId = rowData.planTypeId
        this.formValue.planTypeName = rowData.planTypeName
        this.formValue.planSource = `${rowData.planSource}&${rowData.planSourceName}`
        this.formValue.planTime =`${rowData.planTime}&${rowData.planTimeName}`
        this.formValue.planTypeRemark = rowData.planTypeRemark
        this.addAddField()
        this.editSameField()
        this.originTree({planTypeId: rowData.planTypeId })
        this.editKeyField()
      }else {
        this.planTypeId = null
        this.originTree()
      }
    }
  },
  mounted () {
    this.$nextTick( () => {
      this.handleEdit()
    })
    this.handleFollowType()
  }
}
</script>
<style lang="less" scoped>
.addPlanType {
  padding: 20px;
  background-color: #fff;
  height: 100%;
  h2 {
    margin-bottom: 20px;
  }
  span {
    margin-left: 20px;
    color: #666;
  }
  .followUser {
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
    display: flex;
    .treeCheck {
      height: 30px;
      line-height: 30px;
      width: 100%;
      margin-bottom: 6px;
      padding-left: 10px;
      background-color: #ccc;
    }
    .needTitle{
      font-size: 16px;
      padding-left: 20px;
      width: 100%;
      height: 40px;
      line-height: 40px;
      border-bottom: 1px solid #eee;
    }
    .searchTerm{
        height: 50px;
        line-height: 50px;
        border-bottom: 1px solid #eee;
      }
    .needFollow {
      width: 50%;
      border: 1px solid #eee;
      margin-right: 20px;
      .planTree {
        height: 550px ;
        overflow-y: auto;
        padding: 10px;
      }
    }
    .setFllow {
      width: 50%;
       border: 1px solid #eee;
       .setTitle {
          padding-left: 20px;
          height: 50px;
          line-height: 50px;
          border-bottom: 1px solid #eee;
          display: flex;
          p {
            font-size: 14px;
          }
          span {
            color: #666;
            font-size: 12px;
          }
       }
    }
  }
  .setType {
    color: #0066CC;
    margin:20px 0 20px 20px;
  }
  .classify {
    padding: 20px;
    background-color: #eee;
  }
  .keyWordStyle {
    border-bottom: 1px solid #eee;
    height: 600px;
    overflow-y: auto;
    .loopAdd{
      display: flex;
      margin-top: 20px;
      span{
        margin-top: 6px;
      }
    }
  }
}
</style>


