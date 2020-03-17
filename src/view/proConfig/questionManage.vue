<style lang="less">
	.question-manage{
		.form-wrap{
			background-color: #f8f8f9;
			padding: 8px;
			height: 300px;
			overflow: auto;
			margin-bottom: 24px;
			&-tip{
				color: #c3c3c3;
			}
			&-label{
				font-size: 14px;
				margin: 8px 0;
			}
			.ivu-input-wrapper{
				width: 70%;
				margin-right: 8px;
			}
			.ivu-select{
				width: 90%;
				margin-right: 8px;
			}
		}
	}
</style>

<template>
  <div class="user">
    <div class="user_main">
      <Row class="user_main_search common_search" :gutter="20">
        <Col span="5">
          <span>问题名称</span>
          <Input v-model="searchParams.questionName" placeholder="问题名称"></Input>
        </Col>
		  <Col span="9">
			  <span>分类</span>
			  <disease-type-select ref="disSelect" :is-multiple="false"></disease-type-select>
		  </Col>
		  <Col span="5">
			  <span>关联指标名称</span>
			  <Input v-model="searchParams.targetName"></Input>
		  </Col>
        <Col span="2">
          <Button @click="handlePage(1)" type="primary" :loading="tableParams.isLoading">查询</Button>
			<Button @click="handleAddEdit('','add')" v-permission="this.$API.questionManage.add">添加问题</Button>
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
            :title="drawerType==='add'?'添加问题':drawerType==='edit'?'编辑问题':'查看问题'"
            v-model="isDrawerShow"
            width="40"
            :mask-closable="false"
            @on-close="resetForm"
    >
      <Form :model="formData" :rules="validate.questionManage" ref="form" class="drawer-form question-manage" :label-width="100">
        <FormItem label="问题名称" prop="questionName">
          <Input v-model="formData.questionName" :disabled="drawerType==='detail'" />
        </FormItem>
        <FormItem label="问题内容" prop="questionContent">
			<Input v-model="formData.questionContent" :disabled="drawerType==='detail'" />
        </FormItem>
        <FormItem label="分类" :label-width="90" required>
			<disease-type-select ref="drawerDiseaseSelect" :is-change="isDrawerShow" :first-value="formData.firstProp" :second-value="formData.secondProp"></disease-type-select>
        </FormItem>
		  <FormItem label="是否采集指标" prop="paramCode" v-if="drawerType!=='detail'">
			  <RadioGroup v-model="formData.isTarget">
				  <Radio :label="1">是</Radio>
				  <Radio :label="0">否</Radio>
			  </RadioGroup>
		  </FormItem>
		  <div class="form-wrap">
			  <span class="form-wrap-tip" v-if="formData.isTarget !== 1">请选择关联的指标</span>
			  <template v-else>
				  <span class="form-wrap-tip">该问题未设置关联指标</span>
				  <div class="form-wrap-label">指标名称</div>
				  <Select
					  v-model="formData.targetId"
					  filterable
					  remote
					  :remote-method="remoteMethodTarget"
					  :loading="remoteLoading">
					  <Option v-for="(option, index) in targetOptions" :value="option.targetId" :key="index">{{option.targetName}}</Option>
				  </Select>
			  </template>
		  </div>
        <FormItem label="对话是否可打断">
			<RadioGroup v-model="formData.playWavOnly">
				<Radio :label="0">是</Radio>
				<Radio :label="1">否</Radio>
			</RadioGroup>
		</FormItem>
		  <FormItem label="备注">
			  <Input v-model="formData.remark" type="textarea" :disabled="drawerType==='detail'" />
		  </FormItem>
      </Form>
      <div style="text-align: center;"  v-if="drawerType!=='detail'">
        <Button type="primary" @click="handleSave">保存</Button>
      </div>
      <!--<div v-else style="padding: 0 80px;">-->
        <!--<Button type="primary" @click="handleAddEdit(formData, 'edit')">编辑</Button>-->
        <!--<Button type="error" @click="handleDelete(formData.questionId)" style="float: right;">删除</Button>-->
      <!--</div>-->
    </Drawer>
  </div>
</template>

<script>
import diseaseTypeSelect from '../common-components/disease-types-select'
import { debounce, handleDeleteRefresh } from '@/libs/businessUtil'
const baseForm = {
    questionId: '',
    questionName: '',
    questionContent: '',
    isTarget: 1,
    playWavOnly: 1,
    targetId: '',
    targetName: '',
    questionDiseases: []
}
export default {
    name: 'questionManage',
    components: {
        diseaseTypeSelect
    },
    data () {
        return {
        	remoteLoading: false,
            targetOptions: [],
            targetOptionsObj: {},
            isDrawerShow: false,
            drawerType: 'add', // add/edit/detail
            formData: baseForm,
            tableParams: {
                data: [],
                total: 0,
                isLoading: false
            },
            searchParams: {
                questionName: '',
                targetName: '',
                pager: 1,
                limit: 10,
                sort: '', // 排序字段
                order: '' // 排序方式:降序 DESC 升序 ASC
            },
            config: [
                {
                    title: '问题名称',
                    key: 'questionName'
                },
                {
                    title: '分类',
                    key: '',
                    render: (h, params) => {
                    	return h('span', `${params.row.diseaseTypeName}-${params.row.diseaseName}`)
                    }
                },
                {
                    title: '问题内容',
                    key: 'questionContent'
                },
                {
                    title: '关联指标',
                    key: 'targetName'
                },
                {
                    title: '操作',
                    key: 'action',
                    width: 220,
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
                                            value: this.$API.questionManage.update
                                        }
                                    ],
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.handleAddEdit(params.row.questionId, 'edit', params.row.targetName)
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
                                            value: this.$API.questionEdit.add
                                        }
                                    ],
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.$router.push({
                                                path: '/proConfig/questionEdit',
                                                query: {
                                                	questionId: params.row.questionId,
                                                    diseaseTypeName: params.row.diseaseTypeName,
                                                    diseaseName: params.row.diseaseName,
                                                    targetName: params.row.targetName
                                                }
                                            })
                                        }
                                    }
                                },
                                '编辑话术'
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
                                            value: this.$API.questionManage.delete
                                        }
                                    ],
                                    on: {
                                        click: () => {
                                            this.handleDelete(params.row.questionId)
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
            const disSelectRes = this.$refs.disSelect.getSelectedData()
            this.searchParams.diseaseType = disSelectRes.firstData ? disSelectRes.firstData.paramId : ''
            this.searchParams.diseaseIds = disSelectRes.secondData ? disSelectRes.secondData.paramId : ''
            const res = await this.$API.questionManage.list(this.searchParams).catch(e => {
                this.tableParams.isLoading = false
            })
            this.tableParams.data = res.data
            this.tableParams.total = res.total
            this.tableParams.isLoading = false
        },
        async handleAddEdit (id, type, targetName = '') {
        	this.targetOptions = []
            this.targetOptionsObj = {}
            this.isDrawerShow = true
            this.drawerType = type // add/edit/detail
            if (type === 'add') {
                this.formData = JSON.parse(JSON.stringify(baseForm))
            } else {
            	const res = await this.$API.questionManage.info({ id: id })
                const diseaseArr = res.data.questionDisease
                this.formData = JSON.parse(JSON.stringify(res.data.questions))
                // 分类数据
                this.formData.questionDiseases = JSON.parse(JSON.stringify(diseaseArr))
                this.formData.firstProp = diseaseArr[0].diseaseType
                const secondPropArr = []
                diseaseArr.forEach(item => {
                    secondPropArr.push({
                        paramId: item.diseaseId,
                        paramName: item.diseaseName
                    })
                })
                this.formData.secondProp = secondPropArr
                this.formData.targetName = targetName
                // 指标名称select
                if (this.formData.targetId) {
            		this.targetOptions = [{
            			targetId: this.formData.targetId,
                        targetName: this.formData.targetName
                    }]
                    this.targetOptionsObj[this.formData.targetId] = this.formData.targetName
                }
            }
        },
        handlePage (pager) {
            this.searchParams.pager = pager
            this.handleQuery()
        },
        handleSave () {
        	if (this.formData.isTarget === 1 && !this.formData.targetId) {
        		this.$Message.warning('请选择指标名称！')
                return false
            }
            this.$refs.form.validate(async (valid) => {
                if (valid) {
                    const funcName = this.formData.questionId ? 'update' : 'add'
                    const postData = JSON.parse(JSON.stringify(this.formData))
                    // 疾病分类块的处理
                    postData.questionDiseases = postData.questionDiseases || []
                    const disSelectedData = this.$refs.drawerDiseaseSelect.getSelectedData()
                    // console.log(disSelectedData)
                    // console.log(this.formData.secondProp)
                    if (!disSelectedData.secondData.length) {
                    	this.$Message.warning('请选择分类！')
                        return false
                    }
                    disSelectedData.secondData.forEach(item => {
                    	if (item.paramId) {
                            postData.questionDiseases.push({
                                questionId: postData.questionId || '',
                                diseaseType: disSelectedData.firstData.paramId,
                                diseaseTypeName: disSelectedData.firstData.paramName,
                                diseaseId: item.paramId,
                                diseaseName: item.paramName,
                                isNewAdd: true // 用来标记是新增的选择，防止被删掉
                            })
                        }
                    })
                    // 处理 分类 被删掉的情况
                    postData.questionDiseases = postData.questionDiseases.filter(item => (disSelectedData.secondData.indexOf(item.diseaseName) !== -1 || item.isNewAdd))
                    if (postData.isTarget === 0) {
                    	postData.targetName = ''
                        postData.targetId = ''
                    }
                    postData.targetName = this.targetOptionsObj[postData.targetId]
                    delete postData.secondProp
                    // console.log(postData)
                    // return false
                    await this.$API.questionManage[funcName](postData)
                    this.isDrawerShow = false
                    if (!this.formData.questionId) {
                        this.searchParams.pager = 1
                    }
                    this.handleQuery()
                }
            })
        },
        handleDelete (delId) {
            this.$Modal.confirm({
                title: '删除提示',
                content: '确定要删除该问题吗?',
                onOk: async () => {
                    await this.$API.questionManage.delete({ id: delId })
                    this.isDrawerShow = false
                    handleDeleteRefresh('searchParams', 'tableParams', 'handleQuery', this)
                }
            })
        },
        resetForm () {
            if (this.drawerType !== 'detail') {
                this.$refs.form.resetFields()
            }
        },
        /**
		 * @description 指标remote func
		 * @param query
		 */
        remoteMethodTarget (query) {
            if (query !== '') {
                let queryMethod = async () => {
                    this.remoteLoading = true
                    const res = await this.$API.indexManage.list({ limit: 10000, pager: 1, targetName: query }).catch(e => {
                        this.remoteLoading = false
                    })
                    this.targetOptions = []
                    this.targetOptions = res.data
                    res.data.forEach(item => {
                        this.targetOptionsObj[item.targetId] = item.targetName
                    })
                    this.remoteLoading = false
                }
                debounce(queryMethod, 200)()
            } else {
                this.targetOptions = []
            }
        }
    },
    mounted () {
        this.handleQuery()
    }
}
</script>
