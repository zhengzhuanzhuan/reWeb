<template>
  <div class="setManage">
    <h2 v-if="this.$route.query.id == 1">管理台字段设置</h2>
    <h2 v-else>医生端字段设置</h2>
    <Tabs @on-click='handleChangeTab'>
      <TabPane v-for='item,index in tabList' :key='index' :label="item.label" :name='item.name'>
        <Card >
          <p slot="title">
            <span>列表字段</span>
            <span class='sign'>{{item.remark}}</span>
          </p>
          <Button style="marginBottom: 20px" @click="handleJoggle">添加字段</Button>
          <Table
            :ref="item.name"
            highlight-row
            :start="handleOnstart" 
            :end="handleOnend" 
            :columns="columnsTable"
            :data="tableData"
            ></Table>
          <Page
            style="marginTop: 30px"
            :total="pageData.total"
            :page-size='pageData.pageSize'
            :current='pageData.current'
            @on-change='handlePage'
            show-total />
        </Card>
        <Button 
          class='saveBtn' 
          type="primary"
          @click='handleTableSave'
          v-permission="$API.planManage.visiFieldSave" 
          >保存</Button>        
      </TabPane>
    </Tabs>
    <Drawer 
      title="添加列表字段" 
      v-model="addFile"
      @on-close="resetForm"
      width = '600'
      >
     <div class="drawerSearch">
       <span>字段名称</span>
       <Input v-model="formItem.fieldName" placeholder="请输入字段名称" style="width: 150px"></Input>
       <span>状态</span>
       <Select v-model="formItem.isAdd" style="width: 100px" clearable>
        <Option value="0">全部</Option>
        <Option value="1">已添加</Option>
        <Option value="2">未添加</Option>
      </Select>
				<Button type="primary" @click='handlesearch' class="btn">查询</Button>
     </div>
      <Table :columns="columns2" :data="addTableData"></Table>
    </Drawer>
    <Drawer 
      title="编辑显示的字段名称" 
      v-model="editFile"
      width = '500'
      >
      <div class="editFileStyle">
        <span>显示的字段名称</span>
        <Input v-model="editFileNum.showName"  style="width: 200px"/>
      </div>
			<Button type="primary" class='btn' @click='handleFieldSave'>保存</Button>
    </Drawer>
  </div>
</template>
<script>
// 保存和查看没有接
import Sortable from 'sortablejs'
export default {
  name: 'planType',
  data () {
    return {
      tabList:[
        {
          name: 'tab1',
          label: '计划列表',
          remark: '(注：计划列表字段)'
        },
        {
          name: 'tab2',
          label: '记录结果查询',
          remark: '(注：记录结果列表字段)'
        }
      ],
      tableNameField: 'visit_followup_plan',
      judgeType: null,
      editFileNum:{},
      formItem: {
        isAdd: '0'
      },
      editFile: false,
      addFile: false,
      columns2: [
        {
          title: '默认显示名称',
          key: 'columnComment'
        },
        {
          title: '字段名称',
          key: 'columnName'
        },
        {
          title: '操作',
          render: (h, params) => {
            let text = '';
            let btnType = '';
            if(params.row.isChosen) {
              text = '已添加'
              btnType = 'warning'
            } else {
              text = '添加'
              btnType = 'primary'
            }
            return h('div', [
              h('Button', {
                props: {
                  type: btnType,
                  size: 'small',
                  disabled: params.row.isChosen
                },
                on: {
                  click: () => {
                    this.handleAddFile(params.row,params.index)
                  }
                }
            }, text)
          ]
        );
       }
      }],
      columnsTable: [
        {
          title: '排序',
          key: 'sort',
          render: (h, params) => {
             return h('div', [
                h('Button', {
                  props: {
                    type: 'text',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
              }, '拖拽'),
              h('Button', {
                props: {
                  type: 'text',
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
              on: {
                  click: () => {
                    this.handleMoveUp(params.index)
                  }
                }
              }, '上移'),
              h('Button', {
                props: {
                  type: 'text',
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.handleMoveDown(params.index)
                  }
                }
            }, '下移')
          ]);
        }
        },
        {
          title: '显示的名称',
          key: 'showName'
        },
        {
          title: '字段名称',
          key: 'fieldName'
        },
        {
          title: '操作',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'text',
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
              on: {
                  click: () => {
                    this.handleEdit(params.row,params.index)
                  }
                }
              }, '编辑'),
              h('Button', {
                props: {
                  type: 'text',
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.handleRemove(params.index)
                  }
                }
            }, '移除')
          ]
        );
       }
      }],
      addTableData: [],
      tableData: [],
      pageData:{
        total: 10,
        pageSize: 10,
        current: 1,
      },
      table: {
        hasDragged: false,
        isDragging: false,
        oldIndex: 0,
        newIndex: 0,
        draggingRecord: []
      }
    }
  },
  methods: {
    handleOnstart (el) {
      this.table.oldIndex = el.oldIndex;
      this.table.hasDragged = true;
      this.table.isDragging = true;
    },
    handleOnend (el) {
      this.table.newIndex = el.newIndex;
      this.table.isDragging = false;
      this.table.draggingRecord.unshift({
        from: this.table.oldIndex,
        to: this.table.newIndex
      });
      let upDate = this.tableData[el.oldIndex];
      this.tableData.splice(el.oldIndex, 1);
      this.tableData.splice(el.newIndex,0, upDate);
    },
    rowDrop1() {
      var el = this.$refs.tab1[0].$children[1].$el.children[1];
      Sortable.create(el, {
        onStart: this.handleOnstart,
        onEnd: this.handleOnend
      })
    },
    rowDrop2() {
      var el = this.$refs.tab2[0].$children[1].$el.children[1];
      Sortable.create(el, {
        onStart: this.handleOnstart,
        onEnd: this.handleOnend
      })
    },
     // 管理台字段列表
    async handleTotalList(params){
      const res = await this.$API.planManage.visiFieldList({
        pager: this.pageData.current,
        type: this.judgeType,
        sort: 'sort',
        order: 'ASC',
        ...params})
      this.tableData = res.data
      this.pageData.total=res.total
      this.rowDrop1()
      this.rowDrop2()
    },
    handlePage(page){
      this.pageData.current=page
      this.handleTotalList()
    },
    handleJoggle(){
      this.addFile = true
      this.handleShowField()
    },
   
    handleMoveUp(index){
      if(index > 0) {
        let upDate = this.tableData[index - 1];
        this.tableData.splice(index - 1, 1);
        this.tableData.splice(index,0, upDate);
      } else {
        this.$Message.warning('已经是第一条，不可上移')
        return
      }
    },
    handleMoveDown(index){
      if ((index + 1) === this.tableData.length){
        this.$Message.warning('已经是最后一条，不可下移')
        return
      } else {
        let downDate = this.tableData[index + 1];
        this.tableData.splice(index + 1, 1);
        this.tableData.splice(index,0, downDate);
      }
    },
    // 点击保存
    async handleTableSave(){
      const postData = {
        "type": this.judgeType,
        "visitFieldSettings": this.tableData.map((item,index)=>({
          ...item,
          sort: index,
        }))
      }
      const res =await this.$API.planManage.visiFieldSave(postData)
      this.$Message.success('保存成功')
    },
  
    // 切换Tab页
    handleChangeTab(data){
      // 管理端
      if(this.$route.query.id == 1) {
        if(data == 'tab2'){
          this.judgeType = 2
          this.tableNameField = 'visit_followup_record'
          this.handleShowField({identificationType: 2,tableName: 'visit_followup_record'})
          this.handleTotalList({type: 2})
        } else if(data == 'tab1') {
          this.judgeType = 1
          this.tableNameField = 'visit_followup_plan'
          this.handleShowField({identificationType: 1,tableName: 'visit_followup_plan'})
          this.handleTotalList({type: 1})
        }
      } else {
        if(data == 'tab2'){
          this.judgeType = 4
          this.tableNameField = 'visit_followup_record'
          this.handleShowField({identificationType: 4, tableName: 'visit_followup_record'})
          this.handleTotalList({type: 4})
        } else if(data == 'tab1'){
          this.judgeType = 3
          this.tableNameField = 'visit_followup_plan'
          this.handleShowField({identificationType: 3, tableName: 'visit_followup_plan'})
          this.handleTotalList({type: 3})
        }
      }
    },
    handlesearch() {
      this.handleShowField({...this.formItem})
    },
    // 编辑
    handleEdit(data,index){
      this.editFileNum.index=index
      this.editFileNum.showName = data.showName
      // this.editFileNum.id = data.id
      // this.editFileNum.identificationType = data.identificationType
      this.editFile = true
    },
     // 点击编辑的保存
    async handleFieldSave(){
      // const res = await this.$API.planManage.visiFieldUpdate({...this.editFileNum})
      // this.$Message.success('编辑成功')
      this.tableData[this.editFileNum.index].showName=this.editFileNum.showName
      this.editFile = false
      // this.handleTotalList()
    },

    // 移除
    handleRemove(index){
      this.tableData.splice(index, 1);
      this.pageData.total=this.tableData.length
    },
   
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
    
    // 添加字段列表
    async handleShowField(params){
      const res = await this.$API.planManage.visiFieldShow({
        tableName: this.tableNameField,
        identificationType: this.judgeType,
         ...params})
      this.addTableData = res.data
      this.addTableData = this.formData(res.data,this.tableData,'columnName','fieldName','isChosen')
    },
    
    //添加
    async handleAddFile(row,index){
      let copyData = JSON.parse(JSON.stringify(row))
      copyData.isChosen = !row.isChosen
      this.addTableData.splice(index, 1, copyData)
      this.tableData.push({
        fieldName:row.columnName,
        showName:row.columnComment,
        identificationType: this.judgeType
      })
      this.pageData.total=this.tableData.length
    },
    resetForm(){
      this.formItem =  {
        isAdd: '0'
      }
    } 
  },
  mounted(){
     if(this.$route.query.id == 1) {
       this.judgeType = 1 
     } else{
       this.judgeType = 3
     }
    this.handleTotalList()
    this.handleShowField()
  }
}
</script>
<style lang="less" scoped>
.setManage {
  background-color: #fff;
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  h2{
    margin-bottom: 20px;
  }
  .sign {
    color: #ccc;
    font-size: 12px;
    margin-left: 10px;
  }
}
.drawerSearch {
    display: flex;
    padding-bottom: 10px;
    span {
      margin: 10px;
    }
    .btn{
      margin: 0 20px;
    }
  }
  .editFileStyle {
    padding: 40px 0 60px;
    border-bottom: 1px solid #eee;
    span{
      margin: 15px;
    }
  }
  .btn{
   margin: 70px 200px;
  }
  .saveBtn {
    margin: 20px 50%;
  }
</style>


