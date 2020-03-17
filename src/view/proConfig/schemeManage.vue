<style lang="less" scoped>
</style>

<template>
	<div class="user">
		<div class="user_main">
			<Row class="user_main_search common_search" :gutter="20">
				<Col span="5">
					<span>方案名称</span>
					<Input v-model="searchParams.schemeName"></Input>
				</Col>
				<Col span="5">
					<span>分类</span>
					<disease-type-select ref="disSelect" :is-multiple="false"></disease-type-select>
				</Col>
				<Col span="5">
					<span>组织</span>
					<Cascader :data="orgOptions" change-on-select v-model="editOrgArray" filterable></Cascader>
				</Col>
				<Col span="5">
					<span>随访类型</span>
					<Select v-model="searchParams.activeTypes" clearable>
						<Option v-for="item in followupTypeOptions" :value="item.planTypeId" :key="item.planTypeId">{{ item.planTypeName }}</Option>
					</Select>
				</Col>
				<Col span="4">
					<Button @click="handlePage(1)" type="primary" :loading="tableParams.isLoading">查询</Button>
					<Button @click="handleAddEdit('')" v-permission="this.$API.schemeManage.add">添加方案</Button>
				</Col>
			</Row>
			<Card>
				<div class="user_main_list">
					<Table :columns="config" :data="tableParams.data" :loading="tableParams.isLoading" @on-selection-change="handleTableChoose"></Table>
				</div>
				<Row class="user_main_page">
					<Col span="6" style="margin-top: 16px;">
						<Button class="margin-right-20" :disabled="!tableParams.total" @click="handleAuth('all')">全选所有页</Button>
						<Button type="primary" @click="handleAuth('ids')" :disabled="!chosenTableData.length">授权</Button>
					</Col>
					<Page :total="tableParams.total" :page-size="searchParams.limit" show-total :current="searchParams.pager" @on-change="handlePage"></Page>
				</Row>
			</Card>
		</div>
		<!--授权弹框-->
		<Drawer title="选择授权组织" v-model="showAuth" :width="45" :mask-closable="false">
			<div class="margin-bottom-10">请选择需要授权内容</div>
			<CheckboxGroup v-model="authContentChosenArr">
				<Checkbox v-for="(item, index) in authContentArr" :label="item.param" :key="index" class="margin-right-10">
					{{item.name}}
				</Checkbox>
			</CheckboxGroup>
			<Divider/>
			<div class="margin-bottom-10">请勾选医疗机构进行数据授权，授权的医疗机构将获取相关数据</div>
			<CheckboxGroup v-model="medicalChosenArr">
				<Checkbox v-for="(item, index) in medicalArr" :label="item.id" :key="index" style="display: block" class="margin-bottom-10">
					{{item.medicalName}}
				</Checkbox>
			</CheckboxGroup>
			<Divider/>
			<div class="text-center">
				<Button type="primary" @click="handleAuthPost" :disabled="!medicalChosenArr.length || !authContentChosenArr.length">授权</Button>
			</div>
		</Drawer>
	</div>
</template>

<script>
import diseaseTypeSelect from '../common-components/disease-types-select'
import { formatToTreeData, handleDeleteRefresh } from '@/libs/businessUtil'
export default {
    name: 'user-manage',
    components: {
        diseaseTypeSelect
    },
    data () {
        return {
            orgOptions: [], // 组织选项数据
            editOrgArray: [], // 选中的数据
            followupTypeOptions: [], // 随访类型选项
            tableParams: {
                data: [],
                total: 0,
                isLoading: false
            },
            searchParams: {
                schemeName: '',
                diseaseType: '',
                diseaseId: '',
                organizationId: '',
                activeTypes: '',
                pager: 1,
                limit: 10,
                sort: '', // 排序字段
                order: '' // 排序方式:降序 DESC 升序 ASC
            },
            config: [
                {
                    type: 'selection',
                    width: 30,
                    align: 'center'
                },
                {
                    title: '方案名称',
                    key: 'schemeName'
                },
                {
                    title: '分类',
                    key: 'diseaseName'
                },
                {
                    title: '科室',
                    key: 'organizationName'
                },
                {
                    title: '随访类型',
                    key: 'activeTypeName'
                },
                {
                    title: '操作',
                    key: 'action',
                    width: 140,
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
                                            value: this.$API.schemeManage.update
                                        }
                                    ],
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.handleAddEdit(params.row.schemeId)
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
                                        marginRight: '5px',
                                        display: params.row.isTrue === 1 ? 'inline-block' : 'none'
                                    },
                                    directives: [
                                        {
                                            name: 'permission',
                                            value: this.$API.schemeManage.delete
                                        }
                                    ],
                                    on: {
                                        click: () => {
                                            if (params.row.isTrue === 1) {
                                                this.handleDelete(params.row.schemeId)
                                            }
                                        }
                                    }
                                },
                                '删除'
                            )
                        ])
                    }
                }
            ],
            showAuth: false,
            authType: '',
            // 授权弹框
            authContentArr: [
                {
                    param: 'isWav',
                    name: '语音文件'
                },
                {
                    param: 'isLib',
                    name: '通用库'
                },
                {
                    param: 'isTarget',
                    name: '指标'
                },
                {
                    param: 'isQuestion',
                    name: '问题'
                },
                {
                    param: 'isTemplate',
                    name: '模板'
                },
                {
                    param: 'isScheme',
                    name: '方案'
                }
            ],
            authContentChosenArr: [],
            chosenTableData: [],
            isAll: 0, // 是否是全选，0 否，1 是
            medicalArr: [],
            medicalChosenArr: []
        }
    },
    methods: {
        async handleQuery () {
        	if (this.editOrgArray.length) {
        		this.searchParams.organizationId = this.editOrgArray[this.editOrgArray.length - 1]
            } else {
        		this.searchParams.organizationId = ''
            }
        	this.tableParams.isLoading = true
            const disSelectRes = this.$refs.disSelect.getSelectedData()
            this.searchParams.diseaseType = disSelectRes.firstData ? disSelectRes.firstData.paramId : ''
            this.searchParams.diseaseId = disSelectRes.secondData ? disSelectRes.secondData.paramId : ''
            const res = await this.$API.schemeManage.list(this.searchParams).catch(e => {
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
        handleAddEdit (schemeId) {
            this.$router.push({
                path: '/proConfig/schemeEdit',
                query: { id: schemeId }
            })
        },
        /**
		 * @description 删除 操作
		 * @param delId
		 */
        handleDelete (delId) {
            this.$Modal.confirm({
                title: '删除提示',
                content: '确定要删除该方案吗?',
                onOk: async () => {
                    await this.$API.schemeManage.delete({ id: delId })
                    handleDeleteRefresh('searchParams', 'tableParams', 'handleQuery', this)
                }
            })
        },
        /**
		 * @description 搜索项数据获取
		 */
        async getSearchParamsData () {
            // 1.随访类型select
            const resTypes = await this.$API.planManage.planTypeList({ limit: 9999, pager: 1 })
            this.followupTypeOptions = resTypes.data
            // 2.组织select
            const res = await this.$API.organizeManage.orangeList({ userId: sessionStorage.getItem('rsysUserId') })
            this.orgOptions = formatToTreeData({
                baseArr: res.data,
                parentIdName: 'parentId',
                idName: 'organizationId',
                sortName: 'sort',
                childrenFn: function (item) {
                    return {
                        value: item.organizationId,
                        organizationId: item.organizationId,
                        label: item.name,
                        children: []
                    }
                }
            })
        },
        // 授权块处理
        /**
		 * @description 获取医疗机构
		 */
        async getMedicalArr () {
            const res = await this.$API.InstitutionalManage.list({ limit: 10000 })
            this.medicalArr = res.data
        },
        /**
		 * 点击 全选、授权
		 */
        handleAuth (type) {
        	this.showAuth = true
            if (!this.medicalArr.length) {
        		this.getMedicalArr()
            }
            if (type === 'all') {
        		this.isAll = 1
            } else {
        		this.isAll = 0
            }
        },
        handleTableChoose (selection) {
        	this.chosenTableData = selection
        },
        async handleAuthPost () {
            let postData = {}
            if (this.isAll === 1) {
            	postData = JSON.parse(JSON.stringify(this.searchParams))
            }
            postData.isAll = this.isAll
            this.authContentArr.forEach(item => {
                if (this.authContentChosenArr.indexOf(item.param) !== -1) {
                    postData[item.param] = 1
                } else {
                    postData[item.param] = 0
                }
            })
            postData.medicalIds = this.medicalChosenArr
            const chosenTableIds = []
            this.chosenTableData.forEach(item => {
                chosenTableIds.push(item.schemeId)
            })
            postData.schemeIds = chosenTableIds
            postData.isTrue = false
            this.handlePostRequest(postData)
        },
        async handlePostRequest (postData) {
            try {
                await this.$API.schemeManage.authorization(postData)
                this.$Message.success('操作成功！')
                this.showAuth = false
            } catch (e) {
                if (e.data.code === 100) {
                    this.$Modal.confirm({
                        title: '提示',
                        content: '授权的 语音文件 / 通用库  已存在，是否需要覆盖？',
                        onOk: () => {
                        	postData.isTrue = true
                            this.handlePostRequest(postData)
                        }
                    })
                }
            }
        }
    },
    mounted () {
    	this.getSearchParamsData()
        this.handleQuery()
    }
}
</script>
