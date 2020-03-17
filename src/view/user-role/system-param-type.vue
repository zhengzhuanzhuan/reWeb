<style lang="less" scoped>
</style>

<template>
  <div class="user">
    <div class="user_main">
      <Row class="user_main_search common_search" :gutter="20">
        <Col span="6">
          <span>类型名称</span>
          <Input v-model="searchParams.paramTypeName"></Input>
        </Col>
		  <Col span="6">
			  <span>类型编码</span>
			  <Input v-model="searchParams.paramTypeCode"></Input>
		  </Col>
        <Col span="2">
          <Button @click="handlePage(1)" type="primary" :loading="tableParams.isLoading">查询</Button>
			<Button @click="handleAddEdit('','add')" v-permission="this.$API.systemParamType.add">添加类型</Button>
        </Col>
      </Row>
		<Card>
			<div class="user_main_list">
				<Table :columns="config" :data="tableParams.data" :loading="tableParams.isLoading"></Table>
			</div>
			<Row class="user_main_page">
				<Page :total="tableParams.total" :page-size="searchParams.limit" show-total :current="searchParams.pager" @on-change="handlePage"></Page>
			</Row>
		</Card>
    </div>
    <Drawer
            :title="drawerType==='add'?'添加类型':drawerType==='edit'?'编辑类型':'查看类型'"
            v-model="isDrawerShow"
            width="30"
            :mask-closable="false"
            @on-close="resetForm"
    >
      <Form :model="formData" :rules="validate.systemParamType" ref="form" class="drawer-form" :label-width="80">
        <FormItem label="类型名称" prop="paramTypeName">
          <Input v-model.trim="formData.paramTypeName" :disabled="drawerType==='detail'" />
        </FormItem>
        <FormItem label="类型编码" prop="paramTypeCode">
          <Input v-model.trim="formData.paramTypeCode" :disabled="drawerType!=='add'" />
        </FormItem>
      </Form>
      <div style="text-align: center;"  v-if="drawerType!=='detail'">
        <Button type="primary" @click="handleSave">保存</Button>
      </div>
      <div v-else style="padding: 0 80px;">
        <Button type="primary" @click="handleAddEdit(formData, 'edit')" v-permission="this.$API.systemParamType.update">编辑</Button>
        <Button type="error" @click="handleDelete(formData.paramTypeId)" style="float: right;" v-permission="this.$API.systemParamType.delete">删除</Button>
      </div>
    </Drawer>
  </div>
</template>

<script>
import { handleDeleteRefresh } from '@/libs/businessUtil'
const baseForm = {
    paramTypeId: '',
    paramTypeCode: '',
    paramTypeName: ''
}
export default {
    name: 'system-set',
    data () {
        return {
            isDrawerShow: false,
            drawerType: 'add', // add/edit/detail
            formData: baseForm,
            tableParams: {
                data: [],
                total: 0,
                isLoading: false
            },
            searchParams: {
                paramTypeName: '',
                paramTypeCode: '',
                pager: 1,
                limit: 10,
                sort: '', // 排序字段
                order: '' // 排序方式:降序 DESC 升序 ASC
            },
            config: [
                {
                    title: '类型名称',
                    key: 'paramTypeName'
                },
                {
                    title: '类型编码',
                    key: 'paramTypeCode'
                },
                {
                    title: '最后修改时间',
                    key: 'updateTime'
                },
                {
                    title: '操作',
                    key: 'action',
                    width: 180,
                    render: (h, params) => {
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
                                    on: {
                                        click: () => {
                                            this.handleAddEdit(params.row, 'detail')
                                        }
                                    }
                                },
                                '查看'
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
                                            value: this.$API.systemParamType.update
                                        }
                                    ],
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.handleAddEdit(params.row, 'edit')
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
                                    style: {
                                        marginRight: '5px'
                                    },
                                    directives: [
                                        {
                                            name: 'permission',
                                            value: this.$API.systemParamType.delete
                                        }
                                    ],
                                    on: {
                                        click: () => {
                                            this.handleDelete(params.row.paramTypeId)
                                        }
                                    }
                                },
                                '删除'
                            )
                        ])
                    }
                }
            ]
        }
    },
    methods: {
        async handleQuery () {
        	this.tableParams.isLoading = true
            const res = await this.$API.systemParamType.list(this.searchParams).catch(e => {
                this.tableParams.isLoading = false
            })
            this.tableParams.isLoading = false
            this.tableParams.data = res.data
            this.tableParams.total = res.total
        },
        handleAddEdit (rowData, type) {
            rowData = rowData || baseForm
            this.isDrawerShow = true
            this.formData = JSON.parse(JSON.stringify(rowData))
            this.drawerType = type // add/edit/detail
        },
        handlePage (pager) {
            this.searchParams.pager = pager
            this.handleQuery()
        },
        handleSave () {
            this.$refs.form.validate(async (valid) => {
                if (valid) {
                    const funcName = this.formData.paramTypeId ? 'update' : 'add'
                    await this.$API.systemParamType[funcName](this.formData)
                    this.isDrawerShow = false
                    if (!this.formData.paramTypeId) {
                        this.searchParams.pager = 1
                    }
                    this.handleQuery()
                }
            })
        },
        handleDelete (delId) {
            this.$Modal.confirm({
                title: '删除提示',
                content: '确定要删除该条系统参数类型吗?',
                onOk: async () => {
                    await this.$API.systemParamType.delete({ ids: delId })
                    this.isDrawerShow = false
                    handleDeleteRefresh('searchParams', 'tableParams', 'handleQuery', this)
                }
            })
        },
        resetForm () {
            this.$refs.form.resetFields()
        }
    },
    mounted () {
        this.handleQuery()
    }
}
</script>
