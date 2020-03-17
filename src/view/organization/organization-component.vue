<template>
    <div class="main">
        <Card class="main-content">
            <Row>
                <h3>{{baseInfo.title}}</h3>
            </Row>
            <Row>
                <Col span="8">描述：{{baseInfo.description}}</Col>
                <Col span="13">上级组织：{{baseInfo.parentNameArr ? baseInfo.parentNameArr.join('-') : ''}}</Col>
                <Col span="3">排序:{{baseInfo.sort}}</Col>
            </Row>
            <Divider/>
            <Row>
                <h3>{{baseInfo.title}}-下级组织</h3>
            </Row>
			<Row class="user_main_search common_search" :gutter="20">
				<Col span="6">
					<span>组织名称</span>
					<Input
						clearable
						placeholder="组织名称"
						class="search-input"
						v-model="searchParams.organizationName"
					/>
				</Col>
				<Col span="6" v-show="baseInfo.organizationId">
					<Button @click="handleChangePage(1)" class="search-btn" type="primary" :loading="tableParams.loading">
						<Icon type="search"/>查询
					</Button>
					<Button @click="handleDrawer('create')" class="search-btn" type="default">
						<Icon type="search"/>+ 添加子组织
					</Button>
				</Col>
			</Row>
            <Table :columns="config" :data="tableParams.data" :loading="tableParams.loading"></Table>
			<Page :total="tableParams.total" :page-size="searchParams.limit" show-total :current="searchParams.pager" @on-change="handleChangePage"></Page>
        </Card>

        <!-- 弹出窗口&添加组织 -->
        <Drawer
			:title="drawerType==='create'?'添加组织':drawerType==='update'?'编辑组织':'查看组织'"
			v-model="showOrgEditDrawer"
            width="570"
			:mask-closable="false"
        >
            <Form :model="formData" :label-width="120" ref="form" :rules="validate.orgEdit">
                <Row :gutter="32">
                    <Col>
                        <FormItem label="组织名称" label-position="top" prop="name">
                            <Input v-model.trim="formData.name" placeholder="请输入组织名称" :disabled="drawerType === 'detail'"/>
                        </FormItem>
                    </Col>
                    <Col>
                        <FormItem label="上级组织" label-position="top">
                            <span>{{baseInfo.parentNameArr ? baseInfo.parentNameArr.join('-') + '-' + baseInfo.title : baseInfo.title}}</span>
                        </FormItem>
                    </Col>

                    <Col>
                        <FormItem label="描述" label-position="top" prop="description">
                            <Input v-model.trim="formData.description" :disabled="drawerType === 'detail'"/>
                        </FormItem>
                    </Col>
					<Col>
						<FormItem label="排序" label-position="top" prop="sort">
							<Input v-model.trim="formData.sort" :disabled="drawerType === 'detail'"/>
						</FormItem>
					</Col>
					<customize-params ref="customParams" :base-params-array="editCustomParamsArray" :show-delete="drawerType!=='detail'" style="padding: 0 16px;"></customize-params>
                    <Col style="text-align:center;">
                        <template v-if="drawerType!=='detail'">
                            <Button type="default" style="margin-right: 8px" @click="showOrgEditDrawer = false">取消</Button>
                            <Button type="primary" @click="handleSave">保存</Button>
                        </template>
                        <template v-else>
                            <Button type="primary" style="margin-right: 8px" @click="handleDrawer('update', formData.organizationId)">编辑</Button>
                            <Button type="error" @click="handleDelete(formData.organizationId)">删除</Button>
                        </template>
                    </Col>
                </Row>
            </Form>
        </Drawer>
    </div>
</template>

<script>
import { handleDeleteRefresh } from '@/libs/businessUtil'
import customizeParams from '../common-components/customize-params'
export default {
    name: 'organization-component',
    components: {
        customizeParams
    },
    props: {
        baseInfo: { // 左侧选中的组织信息
            type: Object,
            default: function () {
                return {
                    title: '',
                    description: '',
                    organizationId: '',
                    parentId: '',
                    sort: '',
                    parentNameArr: ''
                }
            }
        }
    },
    data () {
        return {
        	drawerType: 'create', // 弹框类型 ,create, update, detail
            editCustomParamsArray: [],
            tableParams: {
            	data: [],
                total: 0,
                loading: false
            },
            searchParams: {
                limit: 10,
                pager: 1,
                organizationName: '',
                parentId: this.baseInfo.organizationId
            },
            config: [
                {
                    title: '组织名称',
                    key: 'name'
                },
                {
                    title: '描述',
                    key: 'description'
                },
                {
                    title: '操作',
                    key: 'action',
                    width: 250,
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
                                            this.handleDrawer('detail', params.row.organizationId)
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
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.handleDrawer('update', params.row.organizationId)
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
                                    on: {
                                        click: () => {
                                            this.handleDelete(params.row.organizationId)
                                        }
                                    }
                                },
                                '删除'
                            )
                        ])
                    }
                }
            ],
            showOrgEditDrawer: false, // 弹出添加子组织窗口
            // 弹出窗口表单信息
            formData: {
                organizationId: '',
                name: '',
                description: '',
                parentId: this.baseInfo.organizationId
            }
        }
    },
    methods: {
        /**
         * @description:子组织列表信息
         * @parmas:null
         */
        async getTableData (parentId = '') {
            if (parentId) {
                this.searchParams.parentId = parentId
            }
        	this.tableParams.loading = true
            const res = await this.$API.organizeManage.list(this.searchParams).catch(e => {
                this.tableParams.loading = false
            })
            this.tableParams.data = res.data
            this.tableParams.total = res.total
            this.tableParams.loading = false
        },
        /**
         * @description 分页
         * @param 当前页码 currentPage
         */
        async handleChangePage (currentPage) {
            this.searchParams.pager = currentPage
            this.getTableData()
        },
        /**
		 * @description 新增、修改、查看
		 */
        async handleDrawer (type, id = '') {
        	this.$refs.form.resetFields()
        	this.drawerType = type
        	this.showOrgEditDrawer = true
            if (type === 'create') {
        		this.formData.name = ''
        		this.formData.organizationId = ''
                this.editCustomParamsArray = []
            } else {
        		const res = await this.$API.organizeManage.show({ id: id })
                this.formData = {
        			name: res.data.name,
                    description: res.data.description,
                    organizationId: res.data.organizationId,
                    parentId: res.data.parentId,
                    sort: res.data.sort
                }
                this.editCustomParamsArray = res.data.upmsFieldDynamic
            }
        },
        /**
         * @description 保存
         * @param null
         */
        async handleSave () {
        	this.formData.parentId = this.baseInfo.organizationId
            // console.log(this.formData)
            const childData = this.$refs.customParams.returnData()
            if (!childData) return false
            // 处理子组件块，删除后，由于图片数组的顺序问题，删除只能置为null而不能删掉，因此在此遍历去掉空值，否则上传时数组顺序不对会导致出错
            const resultCustomParamsArray = []
            childData.paramArray.forEach(item => {
                if (item) {
                    resultCustomParamsArray.push(item)
                }
            })
            const customParamsFiles = childData.fileArray
            // console.log(customParamsFiles)
            // return false
            // console.log(resultCustomParamsArray)
            const formData = new FormData()
            // 处理  添加字段  块的数据
            for (let i = 0; i < resultCustomParamsArray.length; i++) {
                const item = resultCustomParamsArray[i]
                if (item) {
                    if (item.value === '' && item.type !== 'image' && item.required === 1) {
                        // console.log(item)
                        this.$Message.warning('添加的必填字段值不能为空！')
                        return false
                    } else {
                        formData.append(`upmsFieldDynamic[${i}].fieldDynamicId`, item.fieldDynamicId || '')
                        formData.append(`upmsFieldDynamic[${i}].extendObjectId`, item.extendObjectId || '')
                        formData.append(`upmsFieldDynamic[${i}].fieldId`, item.fieldId)
                        formData.append(`upmsFieldDynamic[${i}].fieldName`, item.fieldName)
                        formData.append(`upmsFieldDynamic[${i}].fieldCode`, item.code)
                        formData.append(`upmsFieldDynamic[${i}].fieldSort`, item.sort)
                        formData.append(`upmsFieldDynamic[${i}].fieldType`, item.type)
                        formData.append(`upmsFieldDynamic[${i}].fieldValue`, item.value)
                    }
                }
            }
            this.$refs.form.validate(async (valid) => {
                if (valid) {
                    // form 块数据formData化
                    for (let key in this.formData) {
                        formData.append(`${key}`, this.formData[key] || '')
                    }
                    // 自定义添加的图片
                    for (let file in customParamsFiles) {
                        formData.append('dynamicImage', customParamsFiles[file])
                    }
                    // return false
                    let tipName = '添加'
                    if (!this.formData.organizationId) {
                        await this.$API.organizeManage.create(formData)
                    } else {
                        tipName = '修改'
                        await this.$API.organizeManage.update(formData)
                    }
                    this.$Message.success(`${tipName}成功！`)
                    this.showOrgEditDrawer = false
                    this.getTableData()
                    this.$emit('update')
                }
            })
        },
        /**
         * @description 表格中的删除
         * @param id
         */
        handleDelete (id) {
            this.$Modal.confirm({
                title: '提示',
                content: '确定删除该组织吗？',
                onOk: async () => {
                    await this.$API.organizeManage.delete({ id: id })
                    this.$Message.success('删除成功！')
                    this.showOrgEditDrawer = false
                    handleDeleteRefresh('searchParams', 'tableParams', 'getTableData', this)
                    this.$emit('update')
                }
            })
        }
    },
    mounted () {
    }
}
</script>

<style lang="less" scoped>
	.main{
		height: 100%;
		&-content{
			overflow-y: auto;
			padding-bottom: 10px;
			height: 100%;
		}
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
.sf-row {
    padding: 10px;
}
.rs-tag{
    line-height: 30px;
    height: auto;
    font-size: 14px;
}
</style>
