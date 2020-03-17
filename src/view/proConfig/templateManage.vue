<style lang="less" scoped>
</style>

<template>
	<div class="user">
		<div class="user_main">
			<Row class="user_main_search common_search" :gutter="20">
				<Col span="6">
					<span>模板名称</span>
					<Input v-model="searchParams.templateName"></Input>
				</Col>
				<Col span="10">
					<span>分类</span>
					<disease-type-select ref="disSelect" :is-multiple="false"></disease-type-select>
				</Col>
				<Col span="8">
					<Button @click="handlePage(1)" type="primary" :loading="tableParams.isLoading">查询</Button>
					<Button @click="handleAddEdit('')" v-permission="this.$API.templateManage.add">添加模板</Button>
					<Upload action="/manage/followupTemplate/import"
							name="xmlFile"
							:data="{isTrue: false}"
							:on-success="handleImportSuccess"
							:on-error="handleImportError"
							:before-upload="handleBeforeUpload"
							:show-upload-list="false">
						<Button icon="ios-cloud-upload-outline" v-permission="this.$API.templateManage.import">导入模板</Button>
					</Upload>
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
	</div>
</template>

<script>
import { handleDeleteRefresh } from '@/libs/businessUtil'
import diseaseTypeSelect from '../common-components/disease-types-select'
export default {
    name: 'user-manage',
    components: {
        diseaseTypeSelect
    },
    data () {
        return {
            tableParams: {
                data: [],
                total: 0,
                isLoading: false
            },
            searchParams: {
                templateName: '',
                diseaseType: '',
                diseaseId: '',
                pager: 1,
                limit: 10,
                sort: '', // 排序字段
                order: '' // 排序方式:降序 DESC 升序 ASC
            },
            config: [
                {
                    title: '模板名称',
                    key: 'templateName'
                },
                {
                    title: '分类',
                    key: 'diseaseName'
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
                                    directives: [
                                        {
                                            name: 'permission',
                                            value: this.$API.templateManage.update
                                        }
                                    ],
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.handleAddEdit(params.row.templateId)
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
                                            value: this.$API.templateManage.download
                                        }
                                    ],
                                    on: {
                                        click: () => {
                                            window.open(`/manage/followupTemplate/export/${params.row.templateId}`)
                                        }
                                    }
                                },
                                '下载'
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
                                            value: this.$API.templateManage.delete
                                        }
                                    ],
                                    on: {
                                        click: () => {
                                            this.handleDelete(params.row.templateId)
                                        }
                                    }
                                },
                                '删除'
                            )
                        ])
                    }
                }
            ],
            uploadFile: null
        }
    },
    methods: {
        async handleQuery () {
        	this.tableParams.isLoading = true
            const disSelectRes = this.$refs.disSelect.getSelectedData()
            this.searchParams.diseaseType = disSelectRes.firstData ? disSelectRes.firstData.paramId : ''
            this.searchParams.diseaseId = disSelectRes.secondData ? disSelectRes.secondData.paramId : ''
            const res = await this.$API.templateManage.list(this.searchParams).catch(e => {
                this.tableParams.isLoading = false
            })
            this.tableParams.data = res.data
            this.tableParams.total = res.total
            this.tableParams.isLoading = false
        },
        handlePage (pager) {
            this.searchParams.pager = pager
            this.handleQuery()
        },
        /**
		 * @description 添加、编辑按钮调用方法
		 * @param rowData
		 * @param type
		 */
        handleAddEdit (templateId) {
            this.$router.push({
                path: '/proConfig/templateEdit',
                query: { id: templateId }
            })
        },
        /**
		 * @description 删除 操作
		 * @param delId
		 */
        handleDelete (delId) {
            this.$Modal.confirm({
                title: '删除提示',
                content: '确定要删除该模板吗?',
                onOk: async () => {
                    await this.$API.templateManage.delete({ id: delId })
                    handleDeleteRefresh('searchParams', 'tableParams', 'handleQuery', this)
                }
            })
        },
        /**
		 * @description 导入模板 成功
		 */
        handleImportSuccess (response) {
            // console.log(response)
            if (response.code !== 0 && response.code !== 100) {
            	this.$Message.error(response.message)
            } else if (response.code === 100) {
                this.$Modal.confirm({
                    title: '提示',
                    content: '模板已存在，是否覆盖原有模板文件？',
                    onOk: () => {
                        const formData = new FormData()
                        formData.append('xmlFile', this.uploadFile)
                        formData.append('isTrue', true)
                        this.$API.templateManage.import(formData).then((res) => {
                            this.$Message.success('导入成功')
                            this.handleQuery()
                        }).catch((err) => {
                            console.error(err)
                        })
                    }
                })
            } else {
            	this.$Message.success('导入模板成功！')
                this.handleQuery()
            }
        },
        /**
		 * @description 导入模板 失败
		 */
        handleImportError (error) {
            // console.log(error)
            this.$Message.warning('导入模板失败')
        },
        handleBeforeUpload (file) {
        	this.uploadFile = file
        }
    },
    mounted () {
        this.handleQuery()
    }
}
</script>
