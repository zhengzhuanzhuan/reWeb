<template>
  <div class="compose">
    <h3>随访列表</h3>
    <Row class='common_search' :gutter="20">
      <Col span="7">
        <span>随访变量名称</span>
        <Input v-model="searchParams.variableName" placeholder="请输入随访变量名称"></Input>
      </Col>
    	<Col span="2">
				<Button @click="handlePage(1)" type="primary" :loading="tableParams.isLoading" v-permission="this.$API.composeVoice.composeList">查询</Button>
			</Col>
    	<Col span="2">
				<Button @click="handleAddEdit('', 'add')" type="primary" v-permission="this.$API.composeVoice.composeAdd">添加随访变量</Button>
			</Col>
    </Row>
    <Table :columns="columns" :data="tableParams.data" :loading="tableParams.isLoading"></Table>
    <Page
      :total="tableParams.total"
      :current="searchParams.pager"
      :page-size='searchParams.limit'
      show-total
      @on-change='handlePage'/>
      <Drawer
        :title="drawerType =='edit'? '编辑随访变量': '添加随访变量'"
        :closable="false" v-model="addEditDrawer"
        class="drawerAdd"
        @on-close='handleClose'
        width='500px'
        >
        <Form ref="formValidate" :model="formValidate" :rules="validate.composeVoice" :label-width="100">
          <FormItem label="随访变量名称" prop="variableName">
            <Input v-model="formValidate.variableName" placeholder="请输入随访变量名称"></Input>
          </FormItem>
          <FormItem label="对应字段" prop="corresponding">
            <Select v-model="formValidate.corresponding" placeholder="请选择">
              <Option
                v-for='(item, index) in fileDropNum'
				:key='index'
                :value="`${item.correspondingField}&${item.columnName}&${item.columnComment}`"
                :label="item.correspondingField">
                <span>{{item.correspondingField}}</span>
                <span style="float:right;color:#ccc">{{item.columnComment}}</span>
              </Option>
            </Select>
          </FormItem>
          <FormItem>
            <Button type="primary" @click="handleSubmit('formValidate')">保存</Button>
        </FormItem>
        </Form>
    </Drawer>
  </div>
</template>
<script>
export default {
  name: 'composeVoice',
  data () {
    return {
      searchParams: {
        variableName: '',
        limit: 10,
        pager: 1
      },
      tableParams: {
        data: [],
        total: 10,
        isLoading: false
      },
      columns: [
         {
          title: '随访变量名称',
          key: 'variableName'
        },
        {
          title: '对应字段',
          key: 'correspondingField'
        },
        {
          title: '操作',
          align: 'center',
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
                directives: [
                  {
                    name: 'permission',
                    value: this.$API.composeVoice.composeEdit
                  }
                ],
                on: {
                  click: () => {
                    this.handleAddEdit(params.row, 'edit')
                  }
                }
              }, '编辑'),
              h('Button', {
                props: {
                  type: 'text',
                  size: 'small'
                },
                directives: [
                  {
                    name: 'permission',
                    value: this.$API.composeVoice.composeDelete
                  }
                ],
                on: {
                  click: () => {
                    this.handleDelete(params.row.variableId)
                  }
                }
              }, '删除')
            ]);
          }
        }
      ],
      addEditDrawer: false,
      formValidate: {
        corresponding: '',
      },
      fileDropNum:[],
      drawerType: '',
    }
  },
  methods: {
    async handleComposeList(){
      this.tableParams.isLoading = true
      const res = await this.$API.composeVoice.composeList({
        ...this.searchParams
      })
      this.tableParams.data = res.data
      this.tableParams.total = res.total
      this.tableParams.isLoading = false
    },
    handleDelete(data){
      this.$Modal.confirm({
        title: '删除提示',
        content: '<p>确定要删除该条信息吗？</p>',
        onOk: async() => {
          await this.$API.composeVoice.composeDelete({
            id: data,
            updateUserId: sessionStorage.getItem('rsysUserId')
          })
          this.handleComposeList()
          this.$Message.success('随访变量删除成功!');
        },
      });
    },
     handleAddEdit(rowData, type){
      this.addEditDrawer = true
      this.drawerType = type
      if(type=='add'){
        this.formValidate.corresponding = ''
      }
      let rowDate = rowData || this.formValidate
      this.formValidate = JSON.parse(JSON.stringify(rowDate))
      this.formValidate.corresponding = `${rowData.correspondingField}&${rowData.correspondingAttribute}&${rowData.correspondingDescription}`
    },
    
    handleSubmit (name) {
      if(this.formValidate.corresponding =='undefined&undefined&undefined'){
        this.formValidate.corresponding = ''
      }
      this.$refs[name].validate(async(valid) => {
        if (valid) {
          if(this.drawerType == 'edit'){
            await this.$API.composeVoice.composeEdit({
              variableId: this.formValidate.variableId,
              variableName: this.formValidate.variableName,
              correspondingField: this.formValidate.corresponding &&　this.formValidate.corresponding.split('&')[0],
              correspondingAttribute: this.formValidate.corresponding && this.formValidate.corresponding.split('&')[1],
              correspondingDescription: this.formValidate.corresponding && this.formValidate.corresponding.split('&')[2],
              updateUserId: sessionStorage.getItem('rsysUserId')
            })
            this.addEditDrawer = false
             this.$refs.formValidate.resetFields();
            this.$Message.success('随访变量编辑成功!');
            this.handleComposeList()
          } else if(this.drawerType == 'add'){
            await this.$API.composeVoice.composeAdd({
              variableName: this.formValidate.variableName,
              correspondingField: this.formValidate.corresponding &&　this.formValidate.corresponding.split('&')[0],
              correspondingAttribute: this.formValidate.corresponding && this.formValidate.corresponding.split('&')[1],
              correspondingDescription: this.formValidate.corresponding && this.formValidate.corresponding.split('&')[2],
              updateUserId: sessionStorage.getItem('rsysUserId')
            })
            this.addEditDrawer = false
            this.$refs.formValidate.resetFields();
            this.$Message.success('随访变量添加成功!');
            this.handleComposeList()
          }
        } else {
          this.$Message.error('请填写相对应字段!');
        }
      })
    },
    // 下拉框
    async handleFileDrop () {
      const res = await this.$API.composeVoice.fileDropDown({
        tableName: 'visit_followup_record'
      })
      this.fileDropNum = res.data
    },
    handlePage (pager) {
      this.searchParams.pager = pager
      this.handleComposeList()
    },
    handleClose () {
      this.$refs.formValidate.resetFields();
    }
  },
  mounted () {
    this.handleComposeList()
    this.handleFileDrop()
  }
}
</script>
<style lang="less">
.compose{
  background-color: #fff;
  width: 100%;
  height: 100%;
  padding: 20px;
}
.drawerAdd {
  .ivu-select-dropdown-list {
    width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
