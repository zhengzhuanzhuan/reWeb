<style lang="less" scoped>
</style>

<template>
  <div class="user">
    <div class="user_main">
      <Row class="user_main_search common_search" :gutter="20">
		  <Col span="5">
			  <span>分类类型</span>
			  <Select v-model="searchParams.typeCode" clearable>
				  <Option v-for="(item, index) in diseaseTypeOptions" :value="item.paramCode" :key="index">{{ item.paramName }}</Option>
			  </Select>
		  </Col>
        <Col span="5">
          <span>疾病名称</span>
          <Input v-model="searchParams.icdName"></Input>
        </Col>
		  <Col span="5">
			  <span>助记码</span>
			  <Input v-model="searchParams.zjm"></Input>
		  </Col>
		  <Col span="5">
			  <span>编码</span>
			  <Input v-model="searchParams.icd"></Input>
		  </Col>
        <Col span="4">
          <Button @click="handlePage(1)" type="primary" :loading="tableParams.isLoading">查询</Button>
			<Button @click="handleAddEdit('','add')" v-permission="this.$API.diseaseManage.add">新增</Button>
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
            :title="drawerType==='add'?'添加疾病':drawerType==='edit'?'编辑疾病':'查看疾病'"
            v-model="isDrawerShow"
            width="30"
            :mask-closable="false"
            @on-close="resetForm"
    >
      <Form :model="formData" :rules="validate.diseaseManage" ref="form" class="drawer-form" :label-width="80">
        <FormItem label="分类" prop="typeId">
			<Select v-model="formData.typeId" :disabled="drawerType==='detail'">
				<Option v-for="(item, index) in diseaseTypeOptions" :value="item.paramId" :key="index">{{ item.paramName }}</Option>
			</Select>
        </FormItem>
        <FormItem label="名称" prop="icdName">
          <Input v-model.trim="formData.icdName" :disabled="drawerType==='detail'" />
        </FormItem>
		  <FormItem label="编码" prop="icd">
			  <Input v-model.trim="formData.icd" :disabled="drawerType==='detail'" />
		  </FormItem>
		  <FormItem label="助记码" prop="zjm">
			  <Input v-model.trim="formData.zjm" :disabled="drawerType==='detail'" />
		  </FormItem>
		  <FormItem label="备注">
			  <Input v-model="formData.remark" type="textarea" :disabled="drawerType==='detail'" />
		  </FormItem>
      </Form>
      <div style="text-align: center;"  v-if="drawerType!=='detail'">
        <Button type="primary" @click="handleSave">保存</Button>
      </div>
      <div v-else style="padding: 0 80px;">
        <Button type="primary" @click="handleAddEdit(formData, 'edit')" v-permission="this.$API.diseaseManage.update">编辑</Button>
        <Button type="error" @click="handleDelete(formData.diseaseId)" style="float: right;" v-permission="this.$API.diseaseManage.delete">删除</Button>
      </div>
    </Drawer>
  </div>
</template>

<script>
import { handleDeleteRefresh } from '@/libs/businessUtil'
const baseForm = {
    typeId: '',
    typeCode: '',
    typeName: '',
    icdName: '',
    zjm: '',
    icd: '',
    remark: ''
    // isFree: 2 // 体检套餐是否免费：1是；2否--不做
}
export default {
    name: 'diseaseManage',
    data () {
        return {
            diseaseTypeOptions: [],
            diseaseTypeOptionsObj: {},
            isDrawerShow: false,
            drawerType: 'add', // add/edit/detail
            formData: baseForm,
            tableParams: {
                data: [],
                total: 0,
                isLoading: false
            },
            searchParams: {
                typeCode: '',
                icdName: '',
                zjm: '',
                icd: '',
                pager: 1,
                limit: 10,
                sort: '', // 排序字段
                order: '' // 排序方式:降序 DESC 升序 ASC
            },
            config: [
                {
                    title: '助记码',
                    key: 'zjm'
                },
                {
                    title: '编码',
                    key: 'icd'
                },
                {
                    title: '名称',
                    key: 'icdName'
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
                                            value: this.$API.diseaseManage.update
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
                                            value: this.$API.diseaseManage.delete
                                        }
                                    ],
                                    on: {
                                        click: () => {
                                            this.handleDelete(params.row.diseaseId)
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
        /**
		 * @description 获取分类
		 * @return {Promise<void>}
		 */
        async getTypeOptionsData () {
            this.diseaseTypeOptions = []
            this.diseaseTypeOptionsObj = {}
            const res = await this.$API.systemParamManage.list({ limit: 10000, pager: 1, paramTypeCode: 'followUpType' })
            this.diseaseTypeOptions = res.data
            res.data.forEach(item => {
                this.diseaseTypeOptionsObj[item.paramId] = item
            })
        },
        async handleQuery () {
        	this.tableParams.isLoading = true
            const res = await this.$API.diseaseManage.list(this.searchParams).catch(e => {
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
                    const funcName = this.formData.diseaseId ? 'update' : 'add'
                    this.formData.typeCode = this.diseaseTypeOptionsObj[this.formData.typeId].paramCode
                    this.formData.typeName = this.diseaseTypeOptionsObj[this.formData.typeId].paramName
                    // console.log(this.formData)
                    // return false
                    await this.$API.diseaseManage[funcName](this.formData)
                    this.isDrawerShow = false
                    if (!this.formData.diseaseId) {
                        this.searchParams.pager = 1
                    }
                    this.handleQuery()
                }
            })
        },
        handleDelete (delId) {
            this.$Modal.confirm({
                title: '删除提示',
                content: '确定要删除该条疾病吗?',
                onOk: async () => {
                    await this.$API.diseaseManage.delete({ ids: delId })
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
        this.getTypeOptionsData()
    }
}
</script>
