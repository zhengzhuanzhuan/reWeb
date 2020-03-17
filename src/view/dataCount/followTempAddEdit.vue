<template>
  <div class="followAddEdit">
    <Form :model="formValidate" :label-width="90">
      <FormItem label="明细模板名称">
        <Input v-model="formValidate.mouldName" placeholder="请输入明细模板名称"></Input>
      </FormItem>
      <FormItem label="模板状态">
        <RadioGroup v-model="formValidate.isEnable">
          <Radio :label="0">启用</Radio>
          <Radio :label="1">未启用</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="描述">
        <Input v-model="formValidate.remark" type="textarea" placeholder="请输入"></Input>
      </FormItem>
    </Form>
    <Card style="marginBottom: 20px">
      <div slot="title" class="slotTitle">
        <h3>列表字段</h3>
      </div>
      <p>拖动字段调整排序</p>
      <div style="margin: 10px 0">
        <draggable v-model="listFieldLable" animation="500">
          <transition-group>
            <Tag v-for="(item,index) in listFieldLable" closable :key='index' @on-close="handleClose(index, 'file')">{{item.alias}}</Tag>
          </transition-group>
        </draggable>
      </div>
      <Button type="primary" @click='handeleAddList(1)'>添加</Button>
    </Card>
    <Card>
      <div slot="title" class="slotTitle">
        <h3>查询条件</h3>
      </div>
      <div style="marginBottom: 10px">
        <draggable v-model="queryConditionLable" animation="500">
          <transition-group>
            <Tag v-for="(item,index) in queryConditionLable" :key='index' closable @on-close="handleClose(index, 'query')">{{item.alias}}</Tag>
         </transition-group>
        </draggable>
      </div>
      <Button type="primary" @click="handeleAddList(2)">添加</Button>
    </Card>
    <Button type="primary" class="btn" @click="handleSave">保存</Button>
    <Drawer title="添加列表字段 " v-model="addListField" width='600' @on-close='handleDrawerClose'>
      <Row class="common_search" :gutter="20">
        <Col span="12">
          <span>字段名称</span>
          <Input v-model="fileName" placeholder="请输入"></Input>
        </Col>
          <Col span="2">
          <Button @click="handleSearch(1)" type="primary" :loading="tableFieldParams.isLoading">查询</Button>
        </Col>
      </Row>
     <Table :columns="columnsFields" :data="tableFieldParams.data" :loading="tableFieldParams.isLoading"></Table>
  </Drawer>
   <Drawer title="添加查询条件" v-model="addQuery" width='600' @on-close='handleDrawerClose'>
      <Row class="common_search" :gutter="20">
        <Col span="12">
          <span>查询条件名称</span>
          <Input v-model="fileName" placeholder="请输入"></Input>
        </Col>
          <Col span="2">
          <Button @click="handleSearch(2)" type="primary" :loading="tableFieldParams.isLoading">查询</Button>
        </Col>
      </Row>
     <Table :columns="columnsQuery" :data="tableQueryParams.data" :loading="tableFieldParams.isLoading"></Table>
  </Drawer>
  </div>
  
</template>
<script>
import draggable from 'vuedraggable'
export default {
  name: 'followTempAddEdit',
  components: {
    draggable
  },
  data(){
    return{
      formValidate: {
        isEnable: 0,
        updateUserId: sessionStorage.getItem('rsysUserId')
      },
      fileName:'',
      QueryName:'',
      addListField: false,
      addQuery: false,
      tableFieldParams: {
        isLoading: false,
        data: [],
      },
      tableQueryParams:{
        data: [],
      },
      columnsFields: [
        {
          title: '列表字段',
          key: 'alias'
        },
        {
          title: '操作',
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
                    this.handleAdd(params.row,params.index,'field')
                  }
                }
              }, params.row.isChosen ? '已添加':'添加'),
            ]);
          }
        }
      ],
      columnsQuery:[
        {
          title: '列表字段',
          key: 'alias'
        },
        {
          title: '类型',
          key: 'remarks'
        },
        {
          title: '操作',
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
                    this.handleAdd(params.row,params.index,'query')
                  }
                }
              }, params.row.isChosen ? '已添加':'添加'),
            ]);
          }
        }
      ],
      listFieldLable: [],
      queryConditionLable: [],
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
    handleAdd(row, index, type){
      const copyData = JSON.parse(JSON.stringify(row))
      copyData.isChosen = !row.isChosen
      if(type =='field') {
        this.listFieldLable.push(copyData)
        this.tableFieldParams.data.splice(index, 1, copyData)
      } else if(type =='query') {
        this.queryConditionLable.push(copyData)
        this.tableQueryParams.data.splice(index, 1, copyData)
      }
    },
    handleClose(index,type){
      if(type =='file'){
        this.listFieldLable.splice(index, 1)
      } else if(type =='query') {
        this.queryConditionLable.splice(index, 1)
      } 
    },
    // 添加查询条件
    async handeleAddList(data){
      this.tableFieldParams.isLoading=true
      const res = await this.$API.followTemp.followTempField({
        batch: data,
        alias: this.fileName,
      })
      if(data==1){
        this.addListField = true
        this.tableFieldParams.data=this.formData(res.data,this.listFieldLable,'alias','alias','isChosen')
      } else if(data==2) {
         this.addQuery = true
         this.tableQueryParams.data=this.formData(res.data,this.queryConditionLable,'alias','alias','isChosen')
      }
      this.tableFieldParams.isLoading=false
    },
    handleSearch(data){
      this.handeleAddList(data)
    },
    handleDrawerClose(){
      this.fileName=''
    },
    // 编辑查看接口
    async handleDetail(){
      const res= await this.$API.followTemp.followTempDetail({
        id:this.$route.query.id || ''
      })
      this.formValidate=res.data.reportFollowupMould,
      this.listFieldLable=res.data.reportFollowupMouldField.map(item=>({
        fieldId: item.fieldId || '',
        name: item.listField,
        alias:item.listFieldName,
      }))
      this.queryConditionLable=res.data.reportFollowupMouldCondition.map(item=> ({
        conditionId: item.conditionId,
        name: item.conditionField,
        alias: item.conditionFieldName,
        expand: item.conditionType,
      }))
    },
    // 最后保存
    async handleSave(){
      const mouldField = this.listFieldLable.map((item,index) => ({
        fieldId: item.fieldId || '',
        listField: item.name,
        listFieldName: item.alias,
        mouldId: this.$route.query.id || '',
        sort: index,
      }))
      const mouldCondition = this.queryConditionLable.map((item,index) => ({
        conditionId: item.conditionId || '',
        conditionField : item.name,
        conditionFieldName : item.alias,
        conditionType: item.expand,
        mouldId: this.$route.query.id || '',
        sort: index,
      }))
      const reportFollow= {
        "reportFollowupMould":this.formValidate,
        "reportFollowupMouldCondition": mouldCondition,
        "reportFollowupMouldField": mouldField
      }
      if(this.$route.query.type=='add'){
        await this.$API.followTemp.followTempAdd(reportFollow)
        this.$Message.success('添加成功')
        this.$router.go(-1)
      }else {
        await this.$API.followTemp.followTempEdit(reportFollow)
        this.$Message.success('编辑成功')
        this.$router.go(-1)
      }
    }
  },
  mounted(){
     if(this.$route.query.type=='edit'){
       this.handleDetail()
     }
  }
}
</script>
<style lang="less" scoped>
.followAddEdit{
  height: 100%;
  background-color: #fff;
  padding: 20px;
  .slotTitle {
    display: flex;
    h3{
      width: 90px;
    }
  }
  .btn {
    margin: 40px 40%;
  }
}
</style>


