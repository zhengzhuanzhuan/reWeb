<template>
  <div class="tempAddEdit">
   <h2>基本信息</h2>
   <Form ref="formValidate" :model="formValidate" :label-width="120">
      <FormItem label="统计模板名称" prop="templateName">
        <Input v-model="formValidate.templateName" placeholder="请输入统计模板名称"></Input>
      </FormItem>
      <FormItem label="统计条件显示方向" prop="isVertical">
        <RadioGroup v-model="formValidate.isVertical">
          <Radio :label="0">横向显示</Radio>
          <img :src="horizonPic">
          <Radio :label="1">纵向显示</Radio>
          <img :src="verticalPic" alt="">
        </RadioGroup>
      </FormItem>
      <FormItem label="模板状态" prop="isEnable">
        <RadioGroup v-model="formValidate.isEnable">
          <Radio :label="0">启用</Radio>
          <Radio :label="1">未启用</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="描述" prop="remark">
        <Input v-model="formValidate.remark" type="textarea" placeholder="请输入"></Input>
      </FormItem>
    </Form>
    <Card style="marginBottom: 25px">
      <div slot="title" class="slotTitle">
        <h3>统计条件</h3>
      </div>
      <div class="slotTitle">
        <h4>第一条件</h4>
        <p>{{statisConditionName.split('&')[1]}}</p>
      </div>
      <div class="cardTag">
        <Tag
          :style="formValidate.isVertical? 'display: block;width: 200px': 'display:inline-block'"
          v-for="(item,index) in statisConditionLabal"
          :key='index'
          >{{item.appName}}</Tag>
      </div> 
      <Button type="primary" @click="handleCondition('edit')" :disabled='statisConditionLabal.length? false:true'>修改</Button>
      <Button style='marginLeft: 20px' @click='handleStaticDel'>移除</Button>
      <Divider/>
      <Button @click="handleCondition('add')">添加条件</Button>
    </Card>
    <Card>
      <div slot="title" class="slotTitle">
        <h3>统计结果项</h3>
      </div>
      <p>拖动字段调整排序</p>
      <div class="cardTag" :style="formValidate.isVertical? 'width:100%': 'width: 120px'">
        <draggable v-model="resultLable" animation="500">
          <transition-group>
            <Tag 
              v-for='(item,index) in resultLable'
              :key='index'
              closable @on-close="handleClose(index)" 
            >{{item.collectName}}</Tag>
           </transition-group>
         </draggable>
      </div>
      <Button type="primary" @click='handleResult'>添加</Button>
    </Card>
    <Button type="primary" class="btn" @click="handleSave">保存</Button>
    <Drawer 
      :title="conditionTypeShow=='edit'? '编辑统计条件':'添加统计条件'" 
      :closable="false"
      width='600'
      v-model="conditionDrawer">
      <p style="marginLeft:20px">提示：只能选择一个统计条件进行设置</p>
      <Row class="common_search" :gutter="20">
        <Col span="12">
          <span>统计条件</span>
          <Select v-model="staticValue" placeholder="请选择" style="width: 300px" @on-change='handleChangeArr'>
            <Option v-for='item in staticNum' :value="`${item.paramCode}&${item.paramName}`" :key='index'>{{item.paramName}}</Option>
          </Select>
        </Col>
      </Row>
      <!-- 科室 -->
      <Tree v-if="staticValue.split('&')[0] == '1'" :data="menuList"  @on-check-change="selectTree" show-checkbox></Tree>
      <!-- 方案类型 -->
      <div style="display:flex" v-else-if="staticValue.split('&')[0] == '2'">
        <Checkbox
        :indeterminate="indeterType"
        :value="checkType"
        @click.prevent.native="handleTypeAll">全选</Checkbox>
        <CheckboxGroup v-model="checkTypeGroup" @on-change="checkTypeChange">
            <Checkbox v-for='(item, index) in schemeTypeNum' :label="`${item.planTypeId}&${item.planTypeName}`" :key='index'>{{item.planTypeName}}</Checkbox>
        </CheckboxGroup>
      </div>
      <!-- 方案名称 -->
      <div style="display:flex" v-else-if="staticValue.split('&')[0] == '3'">
        <Checkbox
          :indeterminate="indeterName"
          :value="checkName"
          @click.prevent.native="handleNameAll">全选</Checkbox>
          <CheckboxGroup v-model="checkNameGroup" @on-change="checkNameChange">
            <Checkbox  v-for="(item,index) in schemeNameNum" :label="`${item.schemeId}&${item.schemeName}`" :key='index'>
              <span>{{item.schemeName}}</span>
            </Checkbox>
          </CheckboxGroup>
      </div>
      <!-- 医生 -->
      <div v-else-if="staticValue.split('&')[0] == '4'">
        <Row class="common_search" :gutter="20">
          <Col span="10">
            <span>用户姓名</span>
            <Input v-model="userParams.realName" placeholder="用户姓名"></Input>
          </Col>
          <Col span="10">
            <span>角色</span>
           <Select v-model="userParams.roleId" style="width: 100px;marginRight: 20px" clearable>
              <Option 
                v-for='(item, index) in roleSelectNum'
                :key='index'
                :value="item.roleId">{{item.roleName}}</Option>
            </Select>
          </Col>
          <Col span="2">
            <Button type="primary" :loading="tableUserParams.isLoading" @click="handleUserSearch">查询</Button>
          </Col>
        </Row>
        <Table 
          :columns="columnsUser" 
          :data="tableUserParams.data" 
          :loading="tableUserParams.isLoading"
          @on-selection-change='handleUserSelect'
        ></Table>
      </div>
      <!-- 分类 -->
      <Row class="common_search" :gutter="20" v-else-if="staticValue.split('&')[0] == '5'">
        <Col span="10">
          <span>分类</span>
          <Select v-model="sortValue" placeholder="请选择" clearable @on-change="handleSort">
            <Option v-for="(item, index) in sortNum" :value="`${item.paramId}&${item.paramName}`" :key='index'>{{item.paramName}}</Option>
          </Select>
        </Col>
      </Row>
      <Divider/>
      <Button type="primary" style="marginLeft: 40% " @click='handleStaticSave' :disabled='(statisNum && statisNum.length)? false:true'>保存</Button>
    </Drawer>
    <Drawer title="添加统计结果项" v-model="resultDrawer" width='600'>
      <Row class="common_search" :gutter="20">
        <Col span="15">
          <span style="width: 100px">统计结果项名称</span>
          <Input v-model="searchParams.collectName" placeholder="统计结果项名称"></Input>
        </Col>
        <Col span="2">
          <Button @click="handlePage(1)" type="primary" :loading="tableParams.isLoading">查询</Button>
        </Col>
      </Row>
       <Table :columns="columnsAll" :data="tableParams.data" :loading="tableParams.isLoading"></Table>
    </Drawer>
  </div>
</template>
<script>
import draggable from 'vuedraggable'
import { formatToTreeData } from '@/libs/businessUtil'
import horizonPic from '../../assets/images/horizontal.png'
import verticalPic from '../../assets/images/vertical.png'
export default {
  name:'countTempAddEdit',
  components: {
    draggable
  },
  data(){
    return{
      statisNum: [],
      sortValue:'',
      statisConditionName:'',
      statisConditionLabal:[],
      roleSelectNum:[],
      checkNameGroup:[],
      indeterName: true,
      checkName: false,
      checkType: false,
      indeterType: true,
      checkTypeGroup: [],
      formItem: {},
      formValidate: {
        isEnable: 0,
        templateId: this.$route.query.templateId || '',
        updateUserId: sessionStorage.getItem('rsysUserId') 
      },
      conditionTypeShow:'',
      menuList: [],
      tableParams: {
        data: [],
        isLoading: false
      },
      searchParams:{
        pager: 1,
        limit: 999,
        collectName: '',
      },
      columnsAll: [
        {
          title: '统计结果项名称',
          key: 'collectName'
        },
        {
          title: '备注',
          key: 'remark'
        },
         {
          title: '操作',
          width: 250,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: params.row.isChosen ? 'default' : 'primary',
                  disabled: params.row.isChosen
                },
                on: {
                  click: () => {
                    this.handleIsAdd(params.row,params.index)
                  }
                }
            }, params.row.isChosen ? '已添加' : '添加')]);
          }
        }
      ],
      userParams: {
        realName: '',
        roleId: '',
        userId: sessionStorage.getItem('rsysUserId'),
      },
      tableUserParams: {
        data: [],
        isLoading: false,
      },
      columnsUser: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '姓名',
          key: 'realName'
        },
        {
          title: '组织',
          key: 'orgainzationName'
        },
        {
          title: '角色',
          key: 'roleNames'
        },
      ],
      horizonPic,
      verticalPic,
      conditionDrawer: false,
      resultDrawer: false,
      resultLable:[],
      staticNum: [],
      staticValue:'',
      sortNum:[],
      schemeTypeNum: [],
      schemeNameNum: [],
      resData: [],
    }
  },
  methods: {
    formData(data, chosenData, dataName, chosenName, parame){
      data.forEach(item=> {
          chosenData.forEach(e=> {
            if(item[dataName] == e[chosenName]){
              item[parame] = true
            }
          })
      })
      return data
    },
    // 统计条件变数组变空
    handleChangeArr(){
      this.indeterName=true
      this.indeterType=true
      this.statisNum=[]
      this.checkNameGroup=[]
      this.checkTypeGroup=[]
    },
    handleTypeAll () {
      if (this.indeterType) {
        this.checkType = false;
      } else {
        this.checkType = !this.checkType;
      }
      this.indeterType = false;
       if (this.checkType) {
         this.schemeTypeNum.forEach(item=> {
           this.checkTypeGroup.push(`${item.planTypeId}&${item.planTypeName}`)
           this.statisNum.push({
              appId: item.planTypeId,
              appName: item.planTypeName,
           })
         })
        } else {
          this.checkTypeGroup = [];
          this.statisNum=[]
        }
    },
    checkTypeChange (data) {
      this.statisNum =data.map(item=> (
        {
          appId: item.split('&')[0],
          appName: item.split('&')[1],
        }
      ))
      if (data.length === this.schemeTypeNum.length) {
        this.indeterType = false;
        this.checkType = true;
      } else if (data.length > 0) {
        this.indeterType = true;
        this.checkType = false;
      } else {
        this.indeterType = false;
        this.checkType = false;
      }
    },
    handleNameAll(){
      if (this.indeterName) {
        this.checkName = false;
      } else {
        this.checkName = !this.checkName;
      }
      this.indeterName = false;
       if (this.checkName) {
        this.schemeNameNum.forEach(item=> {
          this.checkNameGroup.push(`${item.schemeId}&${item.schemeName}`)
          this.statisNum.push({
              appId: item.schemeId,
              appName: item.schemeName,
           })
        })
        } else {
          this.checkNameGroup = []
          this.statisNum=[]
        }
    },
    // 方案名称
    checkNameChange (data) {
      this.statisNum = data.map(item=> (
        {
          appId: item.split('&')[0],
          appName: item.split('&')[1],
        }
      ))
      if (data.length === this.schemeNameNum.length) {
        this.indeterName = false;
        this.checkName = true;
      } else if (data.length > 0) {
        this.indeterName = true;
        this.checkName = false;
      } else {
        this.indeterName = false;
        this.checkName = false;
      }
    },
    selectTree(data){
      this.statisNum = data.map(item=>(
        {
          appId: item.organizationId,
          appName: item.title,
        }
      ))
    },
    handleUserSelect(data){
      this.statisNum=data.map(item=>(
        {
          appId: item.userId,
          appName: item.realName,
        }
      ))
    },
    handleSort(data){
      this.statisNum=[]
      this.statisNum.push({
        appId: data && data.split('&')[0],
        appName: data && data.split('&')[1],
      })
    },
    // 编辑统计条件的保存
    handleStaticSave(){
      this.statisConditionLabal= this.statisNum
      this.statisConditionName=this.staticValue
      this.conditionDrawer=false
    },
    handleStaticDel(){
      this.statisConditionLabal=[]
    },
    handleClose(index){
      this.resultLable.splice(index, 1)
    },
    handleCondition(type){
      this.getMenuList()
      this.handleUserList()
      this.conditionTypeShow= type
      this.conditionDrawer = true
      if(type=='edit'){
        this.staticValue=this.statisConditionName
        if(this.staticValue.split('&')[0] == '2'){
          this.checkTypeGroup = this.statisConditionLabal.map(item => (
          `${item.appId}&${item.appName}`
          ))  
        } else if(this.staticValue.split('&')[0] == '3'){
          this.checkNameGroup = this.statisConditionLabal.map(item => (
            `${item.appId}&${item.appName}`
          ))
        }
      }else if(type=='add'){
        this.sortValue=''
        this.staticValue=`${this.staticNum[0].paramCode}&${this.staticNum[0].paramName}`
      }
    },
    async handleResult(){
      this.resultDrawer= true
      this.tableParams.isLoading = true
      const res = await this.$API.countResult.resultList({
        ...this.searchParams
      })
      this.tableParams.data = this.formData(res.data,this.resultLable,'collectName','collectName','isChosen')
      this.tableParams.isLoading = false
    },
    handleIsAdd(row,index){
      let copyData = JSON.parse(JSON.stringify(row))
      copyData.isChosen = !row.isChosen
      this.tableParams.data.splice(index, 1, copyData)
      this.resultLable.push(copyData)
    },
    handlePage(pager){
      this.searchParams.pager = pager
      this.handleResult()
    },
    // 查看模板的所有信息
    async handleEditMes(data){
      const res = await this.$API.countTemp.countTempMes({id: this.$route.query.templateId})
      this.formValidate = res.data.reportSummaryTemplate
      this.resultLable= res.data.reportSummaryTemplateOptions
      const templateOption =res.data.reportSummaryTemplateConditions
      this.statisConditionLabal=templateOption.map(item=> ({
        appId: item.appId,
        appName: item.appName,
      }))
      this.sortValue=templateOption[0] && `${templateOption[0].appId}&${templateOption[0].appName}` || ''
      this.statisConditionName=templateOption[0] && `${templateOption[0].conditionType}&${templateOption[0].conditionTypeName}` || ''
    },
    async handleSave(){
      const templateOptions = this.resultLable && this.resultLable.map((item,index)=> ({
        collectId: item.collectId,
        collectName: item.collectName,
        optionId:item.optionId || '',
        templateId: this.$route.query.templateId || '',
        sort: index
      }))
      const templateConditions = this.statisConditionLabal && this.statisConditionLabal.map(item=> ({
        ...item,
        conditionType: this.statisConditionName.split('&')[0],
        conditionTypeName  :this.statisConditionName.split('&')[1],
        templateId: this.$route.query.templateId || '',
      }))
      const reportSummary = {
          "reportSummaryTemplate": this.formValidate,
          // 统计条件
          "reportSummaryTemplateConditions": templateConditions,
          // 统计结果项
          "reportSummaryTemplateOptions": templateOptions
        }
      if(this.$route.query.type == 'add') {
        await this.$API.countTemp.countTempAdd(reportSummary)
        this.$Message.success('添加成功')
        this.$router.go(-1)
      } else {
        await this.$API.countTemp.countTempEdit(reportSummary)
        this.$Message.success('编辑成功')
        this.$router.go(-1)
      }
    },
    
    async handleStaticTotal(){
      // 统计条件
      const res1 = await this.$API.systemParamManage.list({ limit: 9999, pager: 1, paramTypeCode: 'summaryCondition' })
      this.staticNum = res1.data
      this.staticValue = `${res1.data[0].paramCode}&${res1.data[0].paramName}`
      // 分类
      const res2 = await this.$API.systemParamManage.list({ limit: 9999, pager: 1, paramTypeCode: 'followUpType' })
      this.sortNum = res2.data
      // 方案类型
      const res3 = await this.$API.planManage.planTypeList({ limit: 9999, pager: 1})
      this.schemeTypeNum = res3.data
      // 方案名称
      const res4 = await this.$API.schemeManage.list({ limit: 9999, pager: 1})
      this.schemeNameNum = res4.data
      // 角色列表
      const res5 = await this.$API.planManage.roleList({pager: 1, limit: 999})
      this.roleSelectNum = res5.data
    },
    // 用户管理
    async handleUserList(){
      this.tableUserParams.isLoading = true
      const res = await this.$API.planManage.userList({
        ...this.userParams,
      })
      if(this.conditionTypeShow=='edit'){
        this.formData(res.data,this.statisConditionLabal,'userId','appId','_checked')
      }
      this.tableUserParams.data = res.data
      this.tableUserParams.isLoading = false
    },
    // 用户管理的查询
    handleUserSearch(){
      this.handleUserList()
    },
    async getMenuList () {
      const res = await this.$API.organizeManage.orangeList({ userId: sessionStorage.getItem('rsysUserId') })
      const resData = res.data || []
      if(this.conditionTypeShow=='edit'){
        this.formData(resData, this.statisConditionLabal,'organizationId','appId','checked')
      }
      this.menuList = formatToTreeData({
        shouldGetParentNameArr: true,
        baseArr: resData,
        parentIdName: 'parentId',
        idName: 'organizationId',
        sortName: 'sort',
        expand: true,
        childrenFn: function (item) {
          return {
            organizationId: item.organizationId,
            title: item.name,
            parentId: item.parentId,
            sort: item.sort,
            expand: true,
            checked: item.checked,
            description: item.description,
            children: []
          }
        }
      })
    }
  },
  mounted(){
    if(this.$route.query.type == 'edit'){
      this.handleEditMes()
    }
    this.handleStaticTotal()
  }
}
</script>
<style lang="less" scoped>
.tempAddEdit {
  height: 100%;
  background-color: #fff;
  padding: 20px;
  overflow-y: auto;
  h2{
    margin-bottom: 20px;
  }
  img{
    width: 35px;
    height: 20px;
    margin-right: 20px;
    transform:translateY(7px)
  }
  .slotTitle{
    display: flex;
    h4{
      margin-right: 20px;
    }
    h3{
      width: 100px;
    }
  }
  .cardTag {
    margin: 10px;
  }
  .btn {
    margin: 15px 40% 10px;
  }
}
</style>


