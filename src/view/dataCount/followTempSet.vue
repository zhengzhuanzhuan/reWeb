<template>
  <div class="followTempSet">
    <h2>随访明细模板管理</h2>
    <Row class="common_search" :gutter="20">
			<Col span="8">
				<span style="width: 100px">明细模板名称</span>
				<Input v-model="searchParams.mouldName" placeholder="统计模板名称"></Input>
			</Col>
      <Col span="8">
				<span style="width: 100px">模板状态</span>
				<Select v-model="searchParams.isEnable" placeholder="请选择" clearable>
          <Option value="">全部</Option>
          <Option value="0">启用</Option>
          <Option value="1">禁用</Option>
        </Select>
			</Col>
			<Col span="1">
				<Button @click="handlePage(1)" type="primary" :loading="tableParams.isLoading">查询</Button>
			</Col>
			<Col span="2">
				<Button @click="handleAddEdit('', 'add')" type="primary"  v-permission="this.$API.followTemp.followTempAdd">添加明细模板</Button>
			</Col>
		</Row>
    <Table :columns="columnsAll" :data="tableParams.data" :loading="tableParams.isLoading"></Table>
    <Page 
      :total="tableParams.total"
      :current='searchParams.offset'
      :page-size='searchParams.limit'
      @on-change='handlePage'
      show-total
    />
  </div>
</template>
<script>
export default {
  data(){
    return{
      searchParams: {
        offset: 1,
        limit: 10,
        isEnable: '',
        mouldName: '',
      },
      tableParams: {
        isLoading: false,
        data: [],
        total: 0,
      },
      columnsAll: [
        {
          title: '明细模板名称',                              
          key: 'mouldName'
        },
        {
          title: '描述',
          key: 'remark'
        },
        {
          title: '模板状态',
          key: 'isEnable',
          render: (h, params) => {
            let text = ''
            switch(params.row.isEnable){
              case 0:
                text = '启用' 
                break;
              case 1:
               text = '未启用'
                break;
              }                                                                       
            return h('div', {},text)
          }
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
                style: {
                  margin: '0 5px'
                },
                directives: [
                  {
                    name: 'permission',
                    value: this.$API.followTemp.followTempEdit
                  }
                ],
                on: {
                  click: () => {
                    this.handleAddEdit(params.row.mouldId, 'edit')
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
                    value: this.$API.followTemp.followTempDel
                  }
                ],
                on: {
                  click: () => {
                    this.handleDelete(params.row.mouldId)
                  }
                }
            }, '删除')]);
          }
        }
      ]
    }
  },
  methods: {
    async handleFollowTempList(){
      this.tableParams.isLoading = true
      const res= await this.$API.followTemp.followTempList({
        ...this.searchParams,
      })
      this.tableParams.data = res.data
      this.tableParams.total = res.total
      this.tableParams.isLoading = false
    },
    handlePage(offset){
      this.searchParams.offset = offset
      this.handleFollowTempList()
    },
    handleAddEdit(id, type){
      this.$router.push({ 
        path: '/dataCount/followTempAddEdit', 
        query: { 
          id,
          type
         }});
    },
    handleDelete(id){
      this.$Modal.confirm({
        title: '删除提示',
        content: "<p>确定要删除该条记录吗</p>",
        onOk: async () => {
          await this.$API.followTemp.followTempDel({
            id,
            updateUserId: sessionStorage.getItem('rsysUserId')
          })
          this.$Message.success('该条信息已删除')
          this.handleFollowTempList()
        }
      })
    }
  },
  mounted(){
    this.handleFollowTempList()
  }
 
}
</script>
<style lang="less" scoped>
.followTempSet{
  height: 100%;
  background-color: #fff;
  padding: 20px;
}

</style>


