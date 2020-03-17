<template>
  <div class='mesPlatfrom'>
    <h3>短信平台列表</h3>
    <div class='searchMes'>
      <span>短信平台名称</span>
      <Input v-model="platformName" placeholder="请填写短信平台名称" style="width:200px"></Input>
      <Button type="primary" @click='handleSearch' class='btn' v-permission="this.$API.mesConfig.mesList">查询</Button>
      <Button @click="handleAddEdit('','add')" v-permission="this.$API.mesConfig.mesAdd">添加短信平台</Button>
    </div>
    <div class='main'>
      <Table :columns="columns" :data="tableData"></Table>
      <Page
        :total='total'
        :current='pageData.offset'
        :page-size='pageData.limit'
        show-sizer 
        show-total
        @on-change='handlePageCurrent'
        @on-page-size-change='handlePageSize'
      />
    </div>
    <Drawer 
      :title="drawType=='edit'? '编辑短信平台': '添加短信平台'" 
      v-model="addEditMes"
      @on-close='handleClose'
      width='400px'>
      <Form ref="formValidate" :model="formValidate" :rules="validate.mesPlatForm" :label-width="115">
        <FormItem label="平台名称" prop="centerName">
          <Input v-model="formValidate.centerName" placeholder="请输入平台名称"></Input>
        </FormItem>
        <FormItem label="product" prop="product">
          <Input v-model="formValidate.product" placeholder="请输入product"></Input>
        </FormItem>
        <FormItem label="domain" prop="domain">
          <Input v-model="formValidate.domain" placeholder="请输入domain"></Input>
        </FormItem>
        <FormItem label="accessKeyId" prop="accessId">
          <Input v-model="formValidate.accessId" placeholder="请输入accessKeyId"></Input>
        </FormItem>
        <FormItem label="accessKeySecret" prop="accessSecret">
          <Input v-model="formValidate.accessSecret" placeholder="请输入accessKeySecret"></Input>
        </FormItem>
        <FormItem label="SIGN_NAME" prop="singName">
          <Input v-model="formValidate.singName" placeholder="请输入SIGN_NAME"></Input>
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
  name: 'mesPlatfrom',
  data(){
    return {
      drawType: '',
      addEditMes: false,
      platformName: '',
      formValidate: {},
      total:10,
      pageData: {
        offset: 1,
        limit:　10,
      },
      tableData: [],
      columns:[
        {
          title: '平台名称',
          key: 'centerName'
        },
        {
          title: 'product',
          key: 'product'
        },
        {
          title: 'domain',
          key: 'domain'
        },
        {
          title: 'accessKeyId',
          key: 'accessId'
        },
        {
          title: 'accessKeySecret',
          key: 'accessSecret'
        },
        {
          title: 'SIGN_NAME',
          key: 'singName'
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
                    value: this.$API.mesConfig.mesEdit
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
                    value: this.$API.mesConfig.mesDelete
                  }
                ],
                on: {
                  click: () => {
                    this.handleMesDelete(params.row.smsCid)
                  }
                }
              }, '删除')
            ]);
          },
        }
      ]
    }
  },
  methods: {
    // 列表
    async handleMesList(params){
      const res = await this.$API.mesConfig.mesList({
        ...this.pageData,
        centerName: this.platformName,
        ...params
      })
      this.tableData = res.data
      this.total = res.total
    },
    handleSearch(){
      this.handleMesList({ centerName: this.platformName })
    },
    handleAddEdit(rowData, type){
      this.addEditMes = true
      this.drawType = type
      let rowDate = rowData || this.formValidate
      this.formValidate = JSON.parse(JSON.stringify(rowDate))
    },
    handleSubmit (name) {
      this.$refs[name].validate(async(valid) => {
        if (valid) {
          if(this.drawType == 'edit'){
            await this.$API.mesConfig.mesEdit({
              ...this.formValidate,
              updateUserId: sessionStorage.getItem('rsysUserId')
            })
            this.$Message.success('短信平台编辑成功');
            this.$refs.formValidate.resetFields()
            this.handleMesList()
            this.addEditMes = false
          }else if(this.drawType == 'add'){
            await this.$API.mesConfig.mesAdd({
              ...this.formValidate,
              updateUserId:sessionStorage.getItem('rsysUserId')
            })
            this.$Message.success('短信平台添加成功');
            this.addEditMes = false
            this.handleMesList()
          }
        } else {
          this.$Message.error('请填写相关字段');
        }
      })
    },
    handleMesDelete(id){
      this.$Modal.confirm({
        title: '删除提示',
        content: '<p>确定要删除该条记录吗</p>',
        onOk: async () => {
          await this.$API.mesConfig.mesDelete({
            smsCid: id,
            updateUserId:sessionStorage.getItem('rsysUserId')
          })
          this.$Message.success('该条信息已删除')
          this.handleMesList()
        }
      })
    },
    handleClose(){
      this.$refs.formValidate.resetFields();
    },
    handlePageCurrent(offset){
      this.pageData.offset = offset
      this.handleMesList({offset})
    },
    handlePageSize(limit){
      this.pageData.limit= limit
      this.handleMesList({limit})
    },
  },
  mounted(){
    this.handleMesList() 
  }
}
</script>
<style lang="less" scoped>
.mesPlatfrom {
  width: 100%;
  height: 100%;
  background-color: #fff;
  padding: 20px;
  .searchMes {
    display: flex;
    span {
      margin: 8px 10px 0 0;
    }
    .btn {
      margin: 0 40px 0 20px;
    }
  }
  h3{
    margin-bottom: 20px;
  }
  .main {
    margin-top: 20px;
  }
  
}
</style>


