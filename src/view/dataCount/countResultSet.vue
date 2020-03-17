<template>
  <div class="countResuitSet">
    <h2>统计结果项管理</h2>
    <Row class="common_search" :gutter="20">
			<Col span="8">
				<span style="width: 100px">统计结果项名称</span>
				<Input v-model="searchParams.collectName" placeholder="统计结果项名称"></Input>
			</Col>
			<Col span="1">
				<Button @click="handlePage(1)" type="primary" :loading="tableParams.isLoading">查询</Button>
			</Col>
			<Col span="2">
				<Button @click="handleAddEdit('', 'add')" type="primary" v-permission="this.$API.countResult.resultAdd">添加统计结果项</Button>
			</Col>
		</Row>
    <Table :columns="columnsAll" :data="tableParams.data" :loading="tableParams.isLoading"></Table>
    <Page 
      :total="tableParams.total"
      :current='searchParams.pager'
      :page-size='searchParams.limit'
      @on-change='handlePage'
      show-total
    />
    <Drawer 
      :title="titleName[drawpType]" 
      :closable="false" 
      width='500'
      @on-close='handleClose' 
      v-model="addEditDrawer">
      <Form ref="formValidate" :model="formValidate" :rules="validate.countResult" :label-width="100">
        <FormItem label="统计结果名称" prop="collectName">
          <Input v-show="drawpType !=='see'" v-model="formValidate.collectName" placeholder="统计结果名称"></Input>
          <p v-show="drawpType =='see'" >{{formValidate.collectName}}</p>
        </FormItem>
        <FormItem label="SQL语句" prop="sqlStatement">
          <Input v-model="formValidate.sqlStatement" type="textarea" placeholder="SQL语句"></Input>
        </FormItem>
        <FormItem label="描述" prop="remark">
          <Input v-model="formValidate.remark" type="textarea"  placeholder="描述"></Input>
        </FormItem>
         <FormItem v-show="drawpType !=='see'">
            <Button type="primary" @click="handleSave('formValidate')">保存</Button>
        </FormItem>
      </Form>
    </Drawer>
  </div>
</template>
<script>
export default {
  data(){
    return{
      addEditDrawer: false,
      drawpType: '',
      titleName: {
        'edit': '编辑统计结果',
        'add': '添加统计结果',
        'see': '查看统计结果'
      },
      formValidate: {},
      searchParams: {
        pager: 1,
        limit: 10,
        collectName: '',
        sort: 'create_time',
        order: 'DESC'
      },
      tableParams: {
        isLoading: false,
        data: [],
        total: 0,
      },
      columnsAll: [
        {
          title: '统计结果项名称',
          key: 'collectName'
        },
        {
          title: '描述',
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
                  type: 'text',
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.handleAddEdit(params.row, 'see')
                  }
                }
              }, '查看'),
              h('Button', {
                props: {
                  type: 'text',
                  size: 'small'
                },
                style: {
                  margin: '0 5px'
                },
                directives: [
                  {
                    name: 'permission',
                    value: this.$API.countResult.resultEdit
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
                    value: this.$API.countResult.resultDelete
                  }
                ],
                on: {
                  click: () => {
                    this.handleDelete(params.row.collectId)
                  }
                }
            }, '删除')]);
          }
        }
      ]
    }
  },
  methods: {
    async handleResultList(){
      this.tableParams.isLoading = true
      const res = await this.$API.countResult.resultList({
        ...this.searchParams
      })
      this.tableParams.data = res.data
      this.tableParams.total = res.total
      this.tableParams.isLoading = false
    },
    handlePage (pager) {
      this.searchParams.pager = pager
      this.handleResultList()
    },
    handleDelete(id){
      this.$Modal.confirm({
        title: '删除提示',
        content: '<p>确认要删除该条信息吗？</p>',
        onOk: async() => {
          await this.$API.countResult.resultDelete({
            id,
            updateUserId: sessionStorage.getItem('rsysUserId') 
          })
          this.$Message.success('删除成功');
          this.handleResultList()
        },
      })
    },
    handleAddEdit(rowData, type){
      this.addEditDrawer = true
      this.drawpType = type
      let rowDate = rowData || this.formValidate
      this.formValidate = JSON.parse(JSON.stringify(rowDate))
    },
    handleSave(name){
      this.$refs[name].validate(async(valid) => {
        if (valid) {
          if(this.drawpType == 'add') {
            await this.$API.countResult.resultAdd({
              ...this.formValidate,
              updateUserId: sessionStorage.getItem('rsysUserId') 
            })
            this.addEditDrawer = false
            this.$refs.formValidate.resetFields()
            this.$Message.success('统计结果项添加成功');
            this.handleResultList()
          }else if(this.drawpType == 'edit') {
            await this.$API.countResult.resultEdit({
              ...this.formValidate,
              updateUserId: sessionStorage.getItem('rsysUserId') 
            })
            this.addEditDrawer = false
             this.$refs.formValidate.resetFields()
            this.$Message.success('统计结果项编辑成功');
            this.handleResultList()
          }  
        } else {
          this.$Message.error('请填写相关字段！');
        }
      })
    },
    handleClose(){
      this.$refs.formValidate.resetFields();
    }
  },
  mounted(){
    this.handleResultList()
  }
}
</script>
<style lang="less" scoped>
.countResuitSet {
  height: 100%;
  background-color: #fff;
  padding: 20px;
}
</style>


