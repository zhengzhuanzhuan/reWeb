<template>
  <div class="dataDetail">
    <Form :model="tableParams" :label-width="120">
       <FormItem  v-for="(item,index) in mouldCondition" :label="item.conditionFieldName" :key='index' style="display: inline-block">
        <Input v-if="item.conditionType==1" v-model="tableParams[item.conditionField]" style="width: 15vw"></Input>
        <Select 
          v-model="tableParams[item.conditionField]" 
          v-if="item.conditionField=='brxb'" style="width: 15vw">
          <Option value="">全部</Option>
          <Option value="1">男</Option>
          <Option value="2">女</Option>
        </Select>
        <!-- 年龄 -->
        <Row v-if="item.conditionType==2" style="width: 15vw">
          <Col span="11">
            <Input v-model="tableParams.ageBegin"></Input>
          </Col>
          <Col span="2" style="text-align: center">-</Col>
          <Col span="11">
            <Input v-model="tableParams.ageEnd"></Input>
          </Col>
        </Row>
        <!-- AI审核意见 -->
        <div v-if="item.conditionType==3 &&　item.conditionField=='vetRemark'"  style="width: 75vw">
          <Input v-model="AIsuggestName" @on-blur="handleTypeBlur()" style="width: 290px"></Input>
          <!-- <div style='display:flex;marginTop: 10px'>
            <Checkbox
                v-if='schemeTypeNum.length'
                :indeterminate="indeterminate"
                :value="checkAll"
                @click.prevent.native="handleCheckAll">全选</Checkbox>
              <CheckboxGroup v-model="checkAllGroup" @on-change="checkAllGroupChange">
                <Checkbox v-for='(item, index) in schemeTypeNum' :label="item.planTypeId" :key='index'>{{item.planTypeName}}</Checkbox>
              </CheckboxGroup>
          </div> -->
        </div>
         <!-- 人工外呼意见-->
         <div v-if="item.conditionType==3 && item.conditionField=='callOutRemark'"  style="width: 75vw">
          <Input v-model="callSuggestName" @on-blur="handleTypeBlur()" style="width: 290px"></Input>
          <!-- <div style='display:flex;marginTop: 10px'>
            <Checkbox
                v-if='schemeTypeNum.length'
                :indeterminate="indeterminate"
                :value="checkAll"
                @click.prevent.native="handleCheckAll">全选</Checkbox>
              <CheckboxGroup v-model="checkAllGroup" @on-change="checkAllGroupChange">
                <Checkbox v-for='(item, index) in schemeTypeNum' :label="item.planTypeId" :key='index'>{{item.planTypeName}}</Checkbox>
              </CheckboxGroup>
          </div> -->
        </div>
          <!-- 科室 -->
        <div v-if="item.conditionField=='organizationId'" style="display: flex;width:75vw">
          <Checkbox
            :indeterminate="indeDepartment"
            :value="checkDepartment"
            style="width: 200px"
            @click.prevent.native="handleCheckAll('indeDepartment','checkDepartment','departmentGroup','departmentNum', 'organizationId')">全选</Checkbox>
          <CheckboxGroup v-model="departmentGroup" @on-change="checkAllGroupChange($event,'departmentNum', 'indeDepartment','checkDepartment')">
            <Checkbox v-for='(item, index) in departmentNum' :label="item.organizationId" :key='index'>{{item.name}}</Checkbox>
          </CheckboxGroup>
        </div>
         <!-- 通话状态 -->
        <div v-if="item.conditionField=='callStatus'" style="display: flex;width:75vw">
          <Checkbox
            :indeterminate="indeCallStatus"
            :value="checkCallStatus"
            @click.prevent.native="handleCheckAll('indeCallStatus','checkCallStatus','callStatusGroup','callStatusNum', 'paramCode')">全选</Checkbox>
          <CheckboxGroup v-model="callStatusGroup" @on-change="checkAllGroupChange($event,'callStatusNum', 'indeCallStatus','checkCallStatus')">
            <Checkbox v-for='(item, index) in callStatusNum' :label="item.paramCode" :key='index'>{{item.paramName}}</Checkbox>
          </CheckboxGroup>
        </div>
        <!-- 方案类型多选 -->
        <div v-if="item.conditionType==3 &&item.conditionField=='followupType'"  style="width: 75vw">
          <Input v-model="schemeTypeCheck" @on-blur="handleTypeBlur()" style="width: 290px"></Input>
          <div style='display:flex;marginTop: 10px;width: 80vw'>
            <Checkbox
                v-if='schemeTypeNum.length'
                :indeterminate="indeSchemeType"
                :value="checkSchemeType"
                @click.prevent.native="handleCheckAll('indeSchemeType','checkSchemeType','SchemeTypeGroup','schemeTypeNum','planTypeId')">全选</Checkbox>
              <CheckboxGroup v-model="SchemeTypeGroup" @on-change="checkAllGroupChange($event,'schemeTypeNum', 'indeSchemeType','checkSchemeType')">
                <Checkbox v-for='(item, index) in schemeTypeNum' :label="item.planTypeId" :key='index'>{{item.planTypeName}}</Checkbox>
              </CheckboxGroup>
          </div>
        </div>
        <!-- 方案名称多选 -->
        <div v-if="item.conditionType==3 && item.conditionField=='方案名称'"  style="width: 75vw">
          <Input v-model="schemeCheck" @on-blur="handleNameBlur('check')" style="width: 290px"></Input>
          <div style='display:flex;marginTop: 10px'>
            <Checkbox
                v-if='schemeCheckNum.length'
                :indeterminate="indeSchemeName"
                :value="checkSchemeName"
                @click.prevent.native="handleCheckAll('indeSchemeName','checkSchemeName','schemeNameGroup','schemeCheckNum', 'schemeId')">全选</Checkbox>
              <CheckboxGroup v-model="schemeNameGroup" @on-change="checkAllGroupChange($event,'schemeCheckNum', 'indeSchemeName','checkSchemeName')">
                <Checkbox v-for='(item, index) in schemeCheckNum' :label="item.schemeId" :key='index'>{{item.schemeName}}</Checkbox>
              </CheckboxGroup>
          </div>
        </div>
         <!-- 方案名称单选 -->
        <div v-if="item.conditionType==4" style="width: 75vw">
          <Input v-model="schemeRadio" @on-blur="handleNameBlur('radio')"style="width: 290px;"></Input>
          <RadioGroup v-model="tableParams[item.conditionField]" style="width: 75vw">
            <Radio v-for='(item, index) in schemeRadioNum':label="item.schemeId" :key='index'>{{item.schemeName}}</Radio>
          </RadioGroup>
        </div>
        <!-- 下拉多选 -->
        <Select
          style="width: 15vw"
          v-if="item.conditionType==5"
          v-model="selectDisease"
          filterable
          multiple>
          <Option v-for="item in diseaseNum" :value="item.label" :key="item.value">{{ item.label }}</Option>
        </Select>
        <!-- 执行时间 -->
        <date-time-picker
          v-if="item.conditionType==6 && item.conditionField=='dateBegin'" 
          :timeBegin.sync="tableParams.dateBeginBegin" 
          :timeEnd.sync="tableParams.dateBeginEnd"
          style="width: 15vw"
          :is-default-today="true">
        </date-time-picker>
        <!-- 随访时间 -->
        <date-time-picker
          v-if="item.conditionType==6 && item.conditionField=='dateEnd'" 
          :timeBegin.sync="tableParams.dateEndBegin" 
          :timeEnd.sync="tableParams.dateEndEnd"
          style="width: 15vw"
          :is-default-today="true">
        </date-time-picker>
      </FormItem>
      <FormItem>
        <Button type="primary" @click="handlePage(1)">查询</Button>
      </FormItem>
    </Form>
    <Divider />
    <Table 
      ref="selection" 
      :columns="tableData.columnsAll"
      :loading='tableData.isLoading'
      :data="tableData.data"
      @on-selection-change='handleSelectTable'
    ></Table>
    <Row>
      <Col span="15" style="marginTop: 20px">
        <Button type="primary" @click="handleSelectPage('page')" :disabled="tableData.data.length?false:true">全选当页</Button>
        <Button type="primary" style="margin: 0 20px" @click="handleSelectPage('all')">全选所有页</Button>
        <Button type="primary" @click='handleExport' :disabled='exportDisable' v-permission="this.$API.followTemp.dataDetailExport">导出报表</Button>
      </Col>
      <Col span="9">
        <Page 
          :total="tableData.total"
          :page-size="tableData.limit"
          :current="tableData.offset"
          @on-change='handlePage'
          show-total />
      </Col>
    </Row>
  </div>
</template>
<script>
import {postExportExcelFunc} from '../../services//fetch'
import dateTimePicker from '../common-components/date-time-picker'
export default {
  components: {
    dateTimePicker
  },
  data(){
    return{
      postExportExcelFunc,
      addTableHeader: [],
      tableCallStatus:[],
      exportDisable: true,
      exportParams: {},
      AIsuggestName: '',
      callSuggestName:'',
      schemeTypeCheck:'',
      callStatusNum: [],
      departmentNum: [],
      schemeTypeNum:[],
      diseaseNum: '',
      schemeRadioNum: '',
      schemeCheckNum: '',
      schemeRadio: '',
      schemeCheck: '',
      mouldCondition: [],
      tableParams: {
        mouldId:this.$route.query.id || '',
      },
      tableData:{
        limit: 10,
        offset: 1,
        total: 10,
        columnsAll:[],
        data: [],
        isLoading:false, 
      },
      selectDisease:[],
      // 通话状态
      indeCallStatus:false,
      checkCallStatus: false,
      callStatusGroup:[],
      // 科室
      indeDepartment: false,
      checkDepartment: false,
      departmentGroup: [],
      // 方案类型
      indeSchemeType:false,
      checkSchemeType: false,
      SchemeTypeGroup:[],
      // 方案名称
      indeSchemeName:false,
      checkSchemeName: false,
      schemeNameGroup:[],
      tableBrxb: {
        '1':'男',
        '2': '女',
        '3':'其他'
      }
    }
  },
  methods: {
    handleCheckAll(all,check, arr,signNum,itemCode){
      if (this[all]) {
        this[check] = false;
      } else {
        this[check] = !this[check];
      }
      this[all] = false;
      if (this[check]) {
        this[arr] =this[signNum].map(e=>e[itemCode]);
      } else {
        this[arr] = [];
      }
    },
    checkAllGroupChange(data,orgArr,all,check){
      if (data.length === this[orgArr].length) {
        this[all] = false;
        this[check] = true;
      } else if (data.length > 0) {
        this[all] = true;
        this[check] = false;
      } else {
        this[all] = false;
        this[check] = false;
      }
    },
    async handleTypeBlur(){
       // 方案类型
      const res = await this.$API.planManage.planTypeList({ 
          limit: 9999, 
          pager: 1,
          planTypeName:this.schemeTypeCheck
        })
      this.schemeTypeNum = res.data
    },
    // 方案名称
    async handleNameBlur(type){
      const res = await this.$API.schemeManage.list({
        pager: 1,
        limit: 10,
        schemeName:type=='radio'? this.schemeRadio:this.schemeCheck,
      })
      if(type=='radio'){
        this.schemeRadioNum = res.data
      }else{
        this.schemeCheckNum = res.data
      }  
    },
    async handleDataDetail(){
      const res = await this.$API.followTemp.followTempDetail({
        id:this.$route.query.id || ''
      })
      this.mouldCondition = res.data.reportFollowupMouldCondition
      const reportFollowup = res.data.reportFollowupMouldField.filter((item,index)=> {
        return item.listField !=="targetName"&&item.listField !=="resultStatus"
      })
      this.tableData.columnsAll=[
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        ...reportFollowup.map(item=>({
          title: item.listFieldName,
          key:item.listField,
          render:(h, params) => {
            return h('div',{},item.listField=='brxb'?this.tableBrxb[params.row.brxb]:params.row[`${item.listField}`] );
          }
        })),
      ]
    },
    async handleDetailList(){
      this.tableData.isLoading=true
      const res = await this.$API.followTemp.dataDetailList({
        schemeId:this.schemeNameGroup,
        ...this.tableParams,
        limit: this.tableData.limit,
        offset: this.tableData.offset,
        organizationId: this.departmentGroup,
        callStatus: this.callStatusGroup,
        followupType:this.SchemeTypeGroup,
        icdName:this.selectDisease,
        isNow:1,
      })
      res.data.targetList && res.data.targetList.forEach(e=>{
        this.tableData.columnsAll.push({
          title: e.targetName,
          key: e.targetName,
        })
      })
      this.tableData.data=res.data.MouldList.map(item=> ({
        ...item,
        ...item.resultStatus,
      }))
      res.total ? this.exportDisable=false : this.exportDisable=true
      this.tableData.total=res.total
      this.tableData.isLoading=false
    },
    handleSelectTable(data){
      this.exportParams={
        limit: this.tableData.limit,
        offset: this.tableData.offset,
        recordIds: data.map(item=> (item.recordId))
      } 
    },
     // 全选当页
    handleSelectPage(type){
      // this.exportDisable=false
      if(type=='all'){
        this.exportParams={}
        this.tableData.data =this.tableData.data.map((e,i)=> ({
           ...e,
           _disabled: true
         }))
      }else{
        this.tableData.data =this.tableData.data.map((e,i)=> ({
          ...e,
           _disabled: false,
           _checked: true
         }))
        this.exportParams={
          limit: this.tableData.limit,
          offset: this.tableData.offset,
          recordIds: this.tableData.data.map(item=> (item.recordId))
        } 
      }
    },
    handleExport(){
      const params = {
        schemeId: this.schemeNameGroup,
        ...this.tableParams,
        ...this.exportParams,
        callStatus: this.callStatusGroup,
        followupType:this.SchemeTypeGroup,
        icdName:this.selectDisease,
        isNow:0
      }
    this.postExportExcelFunc(params,"/manage/reportFollowupMould/statisticsExcel",'随访明细')
    },
    handlePage(pager){
      this.tableData.offset=pager
      this.handleDetailList()
    },
    async handleDisease(){
       // 疾病
      const res1 = await this.$API.followTemp.dataDisease({
        pager: 1,
        limit: 9999,
      })
      this.diseaseNum = res1.data.map(item =>({
          value: item.icd,
          label: item.icdName
      }))
      // 通话状态
      const res2 = await this.$API.systemParamManage.list({ limit: 9999, pager: 1, paramTypeCode: 'callStatus' })
      this.callStatusNum = res2.data
      this.tableCallStatus = res2.data.map(e=> e.paramName)
      // 科室
      const res3 = await this.$API.organizeManage.orangeList({ userId: sessionStorage.getItem('rsysUserId') })
      this.departmentNum = res3.data
    },
  },
  mounted(){
    this.handleDetailList()
    this.handleDisease()
    this.handleDataDetail()
  }
}
</script>
<style lang="less" scoped>
.dataDetail {
  height: 100%;
  padding: 20px;
  overflow-y: auto;
  background-color: #fff;
  .topStyle{
    margin-top: 7px;
  }
}
</style>


