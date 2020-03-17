<style lang="less" scoped>
</style>

<template>
  <div class="user">
    <div class="user_main">
      <Row class="user_main_search common_search" :gutter="20">
		  <Col span="5">
			  <span>参数名称</span>
			  <Input v-model="searchParams.paramName"></Input>
		  </Col>
		  <Col span="5">
			  <span>参数编码</span>
			  <Input v-model="searchParams.paramCode"></Input>
		  </Col>
        <Col span="5">
          <span>类型名称</span>
          <Input v-model="searchParams.paramTypeName"></Input>
        </Col>
		  <Col span="5">
			  <span>类型编码</span>
			  <Input v-model="searchParams.paramTypeCode"></Input>
		  </Col>
        <Col span="4">
          <Button @click="handlePage(1)" type="primary" :loading="tableParams.isLoading">查询</Button>
			<Button @click="handleAddEdit('','add')" v-permission="this.$API.systemParamManage.add">添加参数</Button>
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
            :title="drawerType==='add'?'添加参数':drawerType==='edit'?'编辑参数':'查看参数'"
            v-model="isDrawerShow"
            width="30"
            :mask-closable="false"
			@on-close="resetForm"
    >
      <Form :model="formData" :rules="validate.systemParamManage" ref="form" class="drawer-form" :label-width="80">
		  <FormItem label="参数类型" prop="paramTypeSelect" v-if="drawerType==='add'">
			  <Select
				  ref="typeSelect"
				  v-model="paramTypeSelectData"
				  filterable
				  remote
				  clearable
				  @on-change="handleTypeSelect"
				  :remote-method="remoteMethodSelect"
				  :loading="selectLoading">
				  <Option v-for="option in typeOptions" :value="option.value" :key="option.value">{{option.label}}</Option>
			  </Select>
		  </FormItem>
		  <FormItem label="参数类型" prop="paramTypeSelect" v-else>
			  <Input v-model.trim="formData.paramTypeName" disabled />
		  </FormItem>
        <FormItem label="参数名称" prop="paramName">
          <Input v-model.trim="formData.paramName" :disabled="drawerType==='detail'" />
        </FormItem>
        <FormItem label="参数编码" prop="paramCode">
          <Input v-model.trim="formData.paramCode" :disabled="drawerType!=='add'" />
        </FormItem>
      </Form>
      <div style="text-align: center;"  v-if="drawerType!=='detail'">
        <Button type="primary" @click="handleSave">保存</Button>
      </div>
      <div v-else style="padding: 0 80px;">
        <Button type="primary" @click="handleAddEdit(formData, 'edit')" v-permission="this.$API.systemParamManage.update">编辑</Button>
        <Button type="error" @click="handleDelete(formData.paramId)" style="float: right;" v-permission="this.$API.systemParamManage.delete">删除</Button>
      </div>
    </Drawer>
  </div>
</template>

<script>
import { handleDeleteRefresh } from '@/libs/businessUtil'
const baseForm = {
    paramTypeSelect: '',
    paramTypeId: '',
    paramTypeCode: '',
    paramTypeName: '',
    paramId: '',
    paramName: '',
    paramCode: ''
}
export default {
    name: 'system-set',
    data () {
        return {
            paramTypeSelectData: '',
            isDrawerShow: false,
            drawerType: 'add', // add/edit/detail
            formData: baseForm,
            tableParams: {
                data: [],
                total: 0,
                isLoading: false
            },
            searchParams: {
                paramName: '',
                paramCode: '',
                paramTypeName: '',
                paramTypeCode: '',
                pager: 1,
                limit: 10,
                sort: '', // 排序字段
                order: '' // 排序方式:降序 DESC 升序 ASC
            },
            selectLoading: false,
            typeOptions: [],
            config: [
                {
                    title: '参数名称',
                    key: 'paramName'
                },
                {
                    title: '参数编码',
                    key: 'paramCode'
                },
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
                                            value: this.$API.systemParamManage.update
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
                                            value: this.$API.systemParamManage.delete
                                        }
                                    ],
                                    on: {
                                        click: () => {
                                            this.handleDelete(params.row.paramId)
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
        handleTypeSelect (value) {
            this.formData.paramTypeSelect = value
        },
        async remoteMethodSelect (query) {
            if (!query) {
                return false
            }
            const res = await this.$API.systemParamType.list({ paramTypeName: query, limit: 9999 })
            const optionArr = []
            res.data.forEach(item => {
                optionArr.push({
                    value: `${item.paramTypeId}&${item.paramTypeName}&${item.paramTypeCode}`,
                    label: item.paramTypeName
                })
            })
            this.typeOptions = optionArr
        },
        async handleQuery () {
        	this.tableParams.isLoading = true
            const res = await this.$API.systemParamManage.list(this.searchParams).catch(e => {
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
            if (type === 'add') {
                this.formData.handleTypeSelect = ''
                this.$refs.typeSelect.setQuery(null)
                this.typeOptions = []
                this.resetForm()
            } else {
                this.formData.paramTypeSelect = `${rowData.paramTypeId}&${rowData.paramTypeName}&${rowData.paramTypeCode}`
            }
        },
        handlePage (pager) {
            this.searchParams.pager = pager
            this.handleQuery()
        },
        handleSave () {
            this.$refs.form.validate(async (valid) => {
                if (valid) {
                    const funcName = this.formData.paramId ? 'update' : 'add'
                    const selectedItem = this.formData.paramTypeSelect.split('&')
                    // console.log(this.formData.paramTypeSelect)
                    this.formData.paramTypeId = selectedItem[0]
                    this.formData.paramTypeName = selectedItem[1]
                    this.formData.paramTypeCode = selectedItem[2]
                    // console.log(this.formData)
                    // return false
                    await this.$API.systemParamManage[funcName](this.formData)
                    this.isDrawerShow = false
                    if (!this.formData.paramId) {
                        this.searchParams.pager = 1
                    }
                    this.handleQuery()
                }
            })
        },
        handleDelete (delId) {
            this.$Modal.confirm({
                title: '删除提示',
                content: '确定要删除该条系统参数吗?',
                onOk: async () => {
                    await this.$API.systemParamManage.delete({ ids: delId })
                    this.isDrawerShow = false
                    handleDeleteRefresh('searchParams', 'tableParams', 'handleQuery', this)
                }
            })
        },
        resetForm () {
        	this.paramTypeSelectData = ''
            try {
                this.$refs.form.resetFields()
                if (this.$refs.typeSelect) {
                    this.$refs.typeSelect.clearSingleSelect()
                    this.typeOptions = []
                }
            } catch (e) {
                console.log(e)
            }
        }
    },
    mounted () {
        this.handleQuery()
    }
}
</script>
