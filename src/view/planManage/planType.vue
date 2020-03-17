<template>
  <div class="playType">
    <div  class="playType-header">
      <h2>计划类型列表</h2>
      <span>计划类型名称</span>
      <Input v-model="searchInput" placeholder="请输入计划类型名称" style='width: 250px'></Input>
      <Button type="primary" class="btn" @click='handleSearchTable'>查询</Button>
      <Button @click="addPlanType('','add')" v-permission="this.$API.planManage.planTypeAdd">添加计划类型</Button>
    </div>
    <div>
      <Table :columns="tableColumns" :data="tableData"></Table>
      <Page
        :total="pageData.total"
        :page-size="pageData.pageSize" 
        show-total
        :current="pageData.current"
        @on-change='handlePage'
        style="float: right"/>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'planType',
  data () {
    return {
      searchInput: '',
      pageData: {
        total: 0,
        pageSize: 10,
        current: 1
      },
      tableData: [],
      tableColumns: [
        {
          title: '计划类型名称',
          key: 'planTypeName'
        },
        {
          title: '随访数据来源',
          key: 'planSource',
          render: (h, params) => {
            let text = '';
            switch(params.row.planSource){
              case 1:
                text = '门诊';
                break;
              case 2:
                text = '住院';
                break;
              case 3:
                text = '体检';
                break;
              case 4:
                text = '肿瘤';
                break;
              case 5:
                text = '疫苗';
                break;
              default:
                text = ''
            }
            return h('div', {
            }, text)
          }
        },
        {
          title: '触发时间',
          key: 'planTimeName'
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
                    this.handleManageFiles(params.row)
                  }
                }
              }, '管理台字段'),
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
                    this.handleDocFiles(params.row)
                  }
                }
              }, '医生端字段'),
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
                    value: this.$API.planManage.planTypeEdit
                  }
                ],
                on: {
                  click: () => {
                    this.addPlanType(params.row, 'edit')
                  }
                }
              }, '编辑'),
               h(
                'Button',{
                  props: {
                    type: 'text',
                    size: 'small'
                  },
                  directives: [
                    {
                      name: 'permission',
                      value: this.$API.planManage.planTypeDelete
                    }
                  ],
                  on: {
                    click: () => {
                      this.handleDelete(params.row.planTypeId)
                    }
                  }
                },
                '删除'
              )
            ])
          }
        }
      ],
    }
  },
  methods: {
    handlePage(pager){
      this.pageData.current = pager
      this.handlePlanTypeList({pager})
    },
    async handlePlanTypeList (params){
      const res = await this.$API.planManage.planTypeList({
        pager: this.pageData.current,
        limit: this.pageData.pageSize,
        ...params
      })
      this.tableData = res.data
      this.pageData.total = res.total
    },
    handleSearchTable () {
      this.handlePlanTypeList({ planTypeName: this.searchInput })
    },
    handleDelete (ids) {
       this.$Modal.confirm({
          title: '删除提示',
          content: '<p>确定要删除该条记录吗？？</p>',
          onOk: async () => {
            const res = await this.$API.planManage.planTypeDelete({ ids })
            this.$Message.success('该条记录已删除')
            this.handlePlanTypeList()
          },
      });
    },
    // 添加计划类型
    addPlanType(rowData, type){
      if(type === 'add') {
        this.$router.push({
          path: '/planManage/addPlanType',
          query: {
            type: 'add'
          }
        })
      } else {
        this.$router.push({
          path: '/planManage/addPlanType',
          query: {
            type: 'edit',
            rowData: JSON.stringify(rowData)
          }
        })
      }
    },
    // 管理台字段设置
    handleManageFiles(data){
      this.$router.push({
        path: '/planManage/manageFileAdd',
        query: {id: 1}
      })
    },
    // 医生端字段设置
    handleDocFiles(data) {
     this.$router.push({
        path: '/planManage/manageFileAdd',
        query: {id: 3}
      })
    }
  },
  mounted(){
    this.handlePlanTypeList()
  }
}
</script>
<style lang="less" scoped>
.playType {
  height: 100%;
  padding: 20px;
  background-color: #fff;
  &-header {
    padding-bottom: 20px;
    margin-bottom: 20px;
    border-bottom: 1px solid #eee;
    h2{
      margin-bottom: 20px;
    }
    span {
      margin-right: 10px;
    }
    .btn {
      margin: 0 20px;
    }
  }
}
</style>


