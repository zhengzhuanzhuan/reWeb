<template>
  <div>
    <Card class="sf-card">
      <div class="search-con search-con-top">
        <Input clearable placeholder="字段名称" class="search-input" v-model="params.fieldName" />
        <Button
          @click="handleChangePage(1)"
          class="search-btn"
          type="primary"
          v-permission="this.$API.fieldManage.list"
        >
          <Icon type="search" />搜索
        </Button>
        <slot name="otherButtons"></slot>
      </div>
    </Card>
    <Card>
      <Table :columns="columns" :data="tableData" :loading="loading"></Table>
      <Row class="pages">
        <Page
          :total="totalPage"
          :page-size="params.limit"
          show-total
          :current="params.pager"
          @on-change="handleChangePage"
        ></Page>
      </Row>
    </Card>
  </div>
</template>

<script>
export default {
  name: 'field-component',
  props: ['isNormal'],
  data () {
    return {
      // 搜索框
      searchValue: '',
      // 表格是否加载中
      loading: false,
      // 表格信息
      columns: [
        {
          title: '字段名称',
          key: 'fieldName'
        },
        {
          title: '类型',
          key: 'type'
        },
        {
          title: '操作',
          key: 'action',
          width: 180,
          align: 'center',
          render: (h, params) => {
            if (this.isNormal) {
              return h('div', [
                h(
                  'Button',
                  {
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
                        value: this.$API.fieldManage.update
                      }
                    ],
                    on: {
                      click: () => {
                        this.handleEdit(params.row)
                      }
                    }
                  },
                  '编辑'
                ),
                h(
                  'Button',
                  {
                    props: {
                      type: 'text',
                      size: 'small'
                    },
                    directives: [
                      {
                        name: 'permission',
                        value: this.$API.fieldManage.delete
                      }
                    ],
                    on: {
                      click: () => {
                        this.handleRemove(params.row.fieldId)
                      }
                    }
                  },
                  '删除'
                )
              ])
            } else {
              return h('div', [
                h(
                  'Button',
                  {
                    props: {
                      type: 'text',
                      size: 'small'
                    },
                    on: {
                      click: () => {
                        this.handleSelect(params.row)
                      }
                    }
                  },
                  '选择'
                )
              ])
            }
          }
        }
      ],
      // 表格数据
      tableData: [],
      // 总记录数
      totalPage: 0,
      // 初始化、搜索、分页时，请求的参数
      params: {
        pager: 1,
        limit: 10,
        fieldName: ''
      }
    }
  },
  methods: {
    /**
     * @description 共享方法：获取表格数据
     * @param null
     */
    async getData () {
      this.loading = true
			const res = await this.$API.fieldManage.list(this.params)
			console.log(res, '表格数据')
      this.tableData = res.data.data || []
      this.totalPage = res.data.total
      this.loading = false
    },
    /**
     * @description 分页
     * @param currentPage
     */
    async handleChangePage (currentPage) {
      this.params.pager = currentPage
      this.getData()
    },
    /**
     * @description 编辑
     * @param id
     */
    handleEdit (rowData) {
      const data = JSON.parse(JSON.stringify(rowData))
      this.$emit('openDrawerEdit', data)
    },
    /**
     * @description 删除
     * @param ids
     */
    async handleRemove (id) {
      this.$Modal.confirm({
        title: '删除提示',
        content: '确定要删除该字段属性吗?',
        onOk: async () => {
          await this.$API.fieldManage.delete({ ids: id })
          this.getData()
        }
      })
    },
    /**
     * @description 选择
     * @param id
     */
    handleSelect (obj) {
			console.log(obj, '点击选择的数据')
      this.$emit('closeDrawerField', obj)
    },
    /**
     * @description 清空搜索内容，并搜索，供父组件使用
     */
    clearNameSearch () {
      this.params.fieldName = ''
      this.getData()
    }
  },
  mounted () {
    // 获取表格数据
    this.getData()
  }
}
</script>

<style lang="less">
.sf-card {
  margin-bottom: 10px;
}

.search-con {
  padding: 10px 0;
  .search {
    &-col {
      display: inline-block;
      width: 200px;
    }
    &-input {
      display: inline-block;
      width: 200px;
      margin-left: 2px;
    }
    &-btn {
      margin-left: 2px;
    }
  }
}
.pages {
  padding: 10px 0;
  text-align: right;
}
.demo-drawer-footer {
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  border-top: 1px solid #e8e8e8;
  padding: 10px 16px;
  text-align: right;
  background: #fff;
}
.item-type {
  margin-bottom: 5px;
}
</style>
