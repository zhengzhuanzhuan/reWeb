<style lang="less">
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
			width: 68%;
			margin-right: 8px;
		}
		.ivu-select{
			width: 90px;
			margin-right: 8px;
		}
	}
</style>

<template>
  <div class="user">
    <div class="user_main">
      <Row class="user_main_search common_search" :gutter="20">
        <Col span="5">
          <span>指标名称</span>
          <Input v-model="searchParams.targetName" placeholder="指标名称"></Input>
        </Col>
		  <Col span="9">
			  <span>分类</span>
			  <disease-type-select ref="disSelect" :is-multiple="false"></disease-type-select>
		  </Col>
		  <Col span="5">
			  <span>指标类型</span>
			  <Select v-model="searchParams.targetType" clearable>
				  <Option v-for="(item, index) in indexTypeOps" :value="item.paramId" :key="index">{{ item.paramName }}</Option>
			  </Select>
		  </Col>
        <Col span="2">
          <Button @click="handlePage(1)" type="primary" :loading="tableParams.isLoading">查询</Button>
			<Button @click="handleAddEdit('','add')" v-permission="this.$API.indexManage.add">添加指标</Button>
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
            :title="drawerType==='add'?'添加指标':drawerType==='edit'?'编辑指标':'查看指标'"
            v-model="isDrawerShow"
            width="40"
            :mask-closable="false"
            @on-close="resetForm"
    >
      <Form :model="formData" :rules="validate.indexManage" ref="form" class="drawer-form" :label-width="80">
        <FormItem label="指标名称" prop="targetName">
          <Input v-model="formData.targetName" :disabled="drawerType==='detail'" />
        </FormItem>
        <FormItem label="指标类型" prop="oType">
			<Select v-model="formData.oType" label-in-value :disabled="drawerType==='detail'" @on-change="handleTypeSelect">
				<Option v-for="(item, index) in indexTypeOps" :value="item.paramId" :key="index">{{ item.paramName }}</Option>
			</Select>
        </FormItem>
        <FormItem label="分类" :label-width="70" required>
			<disease-type-select ref="drawerDiseaseSelect" :is-change="isDrawerShow" :first-value="formData.firstProp" :second-value="formData.secondProp"></disease-type-select>
        </FormItem>
		  <FormItem label="结果类型" prop="paramCode" v-if="drawerType!=='detail'">
			  <RadioGroup v-model="formData.optionName">
				  <Radio label="string">文本</Radio>
				  <Radio label="select">选项</Radio>
				  <Radio label="digit">数值</Radio>
				  <Radio label="datetime">时间</Radio>
			  </RadioGroup>
		  </FormItem>
		  <div class="form-wrap">
			  <span class="form-wrap-tip" v-if="formData.optionName === 'string'">指标采集结果以文本形式展现</span>
			  <template v-else-if="formData.optionName === 'select'">
				  <span class="form-wrap-tip">指标结果将归类到以下某一项中，请添加选项。预警阀值内的为异常数据</span>
				  <div class="form-wrap-label">指标选项</div>
				  <FormItem v-for="(item, index) in formData.targetOptionsSelect" :label-width="0" :key="index">
					  <Input type="text" v-model="item.optionValues"></Input>
					  <Checkbox v-model="item.thresholdValue">预警阀值</Checkbox>
					  <Button icon="ios-close" shape="circle" @click="handleDeleteItem(index, 'Select')"></Button>
				  </FormItem>
				  <Button type="primary" @click="handleAddItem('select')">添加选项</Button>
			  </template>
			  <template v-else-if="formData.optionName === 'digit'">
				  <span class="form-wrap-tip">指标结果将以数值形式呈现。在预警阀值范围内的为异常数据</span>
				  <div class="form-wrap-label">预警阀值</div>
				  <FormItem v-for="(item, index) in formData.targetOptionsDigit" :label-width="0" :key="index">
					  <Select v-model="item.thresholdStart">
						  <Option v-for="(op, opIndex) in drawerSelectOps" :value="op.paramCode" :key="opIndex">{{ op.paramName }}</Option>
					  </Select>
					  <Input type="text" v-model="item.thresholdValueStart"></Input>
					  <Button icon="ios-close" shape="circle" @click="handleDeleteItem(index, 'Digit')"></Button>
				  </FormItem>
				  <Button type="primary" @click="handleAddItem('digit')">添加条件</Button>
			  </template>
			  <span class="form-wrap-tip" v-else>指标采集结果将自动转化为时间格式（例：2018年01月01日）</span>
		  </div>
        <FormItem label="备注">
          <Input v-model="formData.remark" type="textarea" :disabled="drawerType==='detail'" />
        </FormItem>
      </Form>
      <div style="text-align: center;"  v-if="drawerType!=='detail'">
        <Button type="primary" @click="handleSave">保存</Button>
      </div>
      <!--<div v-else style="padding: 0 80px;">-->
        <!--<Button type="primary" @click="handleAddEdit(formData, 'edit')">编辑</Button>-->
        <!--<Button type="error" @click="handleDelete(formData.targetId)" style="float: right;">删除</Button>-->
      <!--</div>-->
    </Drawer>
  </div>
</template>

<script>
import { handleDeleteRefresh } from '@/libs/businessUtil'
import diseaseTypeSelect from '../common-components/disease-types-select'
const baseForm = {
    targetId: '',
    targetName: '',
    oType: '',
    oName: '',
    optionName: 'string',
    remark: '',
    targetOptions: [],
    targetOptionsDigit: [],
    targetOptionsSelect: []
}
export default {
    name: 'indexManage',
    components: {
        diseaseTypeSelect
    },
    data () {
        return {
            isDrawerShow: false,
            drawerType: 'add', // add/edit/detail
            indexTypeOps: [], // 系统类型下拉框选项数据
            formData: baseForm,
            tableParams: {
                data: [],
                total: 0,
                isLoading: false
            },
            searchParams: {
                title: '',
                pager: 1,
                limit: 10,
                sort: '', // 排序字段
                order: '' // 排序方式:降序 DESC 升序 ASC
            },
            resultTypeMap: {
                'digit': '数值',
                'select': '选项',
                'string': '文本',
                'datetime': '时间'
            },
            // 数值-大于等于
            drawerSelectOps: [],
            config: [
                {
                    title: '指标名称',
                    key: 'targetName'
                },
                {
                    title: '分类',
                    key: '',
                    render: (h, params) => {
                    	return h('span', `${params.row.diseaseTypeName}-${params.row.diseaseName}`)
                    }
                },
                {
                    title: '指标类型',
                    key: 'oName'
                },
                {
                    title: '结果类型',
                    key: '',
                    render: (h, params) => {
                        return h('span', this.resultTypeMap[params.row.optionName])
                    }
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
                                            value: this.$API.indexManage.update
                                        }
                                    ],
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.handleAddEdit(params.row.targetId, 'edit')
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
                                            value: this.$API.indexManage.delete
                                        }
                                    ],
                                    on: {
                                        click: () => {
                                            this.handleDelete(params.row.targetId)
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
    	async getIndexTypeOps () {
    		const res = await this.$API.systemParamManage.list({ limit: 9999, pager: 1, paramTypeCode: 'targetType' })
            this.indexTypeOps = res.data
            const res2 = await this.$API.systemParamManage.list({ limit: 9999, pager: 1, paramTypeCode: 'warningCondition' })
            this.drawerSelectOps = res2.data
        },
        async handleQuery () {
    		this.tableParams.isLoading = true
            const disSelectRes = this.$refs.disSelect.getSelectedData()
            this.searchParams.diseaseType = disSelectRes.firstData ? disSelectRes.firstData.paramId : ''
            this.searchParams.diseaseIds = disSelectRes.secondData ? disSelectRes.secondData.paramId : ''
            const res = await this.$API.indexManage.list(this.searchParams).catch(e => {
                this.tableParams.isLoading = false
            })
            this.tableParams.data = res.data
            this.tableParams.total = res.total
            this.tableParams.isLoading = false
        },
        async handleAddEdit (id, type) {
            this.drawerType = type // add/edit/detail
            if (type === 'add') {
            	this.resetForm()
                this.formData = JSON.parse(JSON.stringify(baseForm))
            } else {
            	const res = await this.$API.indexManage.info({ id: id })
                const diseaseArr = res.data.FollowupTargetDisease
                this.formData = JSON.parse(JSON.stringify(res.data.followupTarget))
                // 分类数据
                this.formData.targetDiseases = JSON.parse(JSON.stringify(diseaseArr))
                this.formData.firstProp = diseaseArr[0].diseaseType
                const secondPropArr = []
                diseaseArr.forEach(item => {
                    secondPropArr.push({
                        paramId: item.diseaseId,
                        paramName: item.diseaseName
                    })
                })
                this.formData.secondProp = secondPropArr
                // 选项、数值时的选项数据
                const optionArr = res.data.FollowupTargetOption
                if (this.formData.optionName === 'select') {
            		optionArr.forEach(item => {
            			item.thresholdValue = item.thresholdValue == 1
                    })
                }
                this.formData.targetOptions = optionArr
                this.$set(this.formData, 'targetOptionsSelect', JSON.parse(JSON.stringify(optionArr)))
                this.$set(this.formData, 'targetOptionsDigit', JSON.parse(JSON.stringify(optionArr)))
            }
            this.isDrawerShow = true
        },
        handlePage (pager) {
            this.searchParams.pager = pager
            this.handleQuery()
        },
        handleSave () {
            this.$refs.form.validate(async (valid) => {
                if (valid) {
                    const funcName = this.formData.targetId ? 'update' : 'add'
                    const postData = JSON.parse(JSON.stringify(this.formData))
                    // 疾病分类块的处理
                    postData.targetDiseases = postData.targetDiseases || []
                    const disSelectedData = this.$refs.drawerDiseaseSelect.getSelectedData()
                    // console.log(disSelectedData)
                    if (!disSelectedData.secondData.length) {
                    	this.$Message.warning('请选择分类！')
                        return false
                    }
                    disSelectedData.secondData.forEach(item => {
                    	if (item.paramId) {
                            postData.targetDiseases.push({
                                targetId: postData.targetId || '',
                                diseaseType: disSelectedData.firstData.paramId,
                                diseaseTypeName: disSelectedData.firstData.paramName,
                                diseaseId: item.paramId,
                                diseaseName: item.paramName,
                                isNewAdd: true // 用来标记是新增的选择，防止被删掉
                            })
                        }
                    })
                    // 处理 分类 被删掉的情况
                    postData.targetDiseases = postData.targetDiseases.filter(item => (disSelectedData.secondData.indexOf(item.diseaseName) !== -1 || item.isNewAdd))
                    // 选项块的数据处理
                    if (postData.optionName === 'select') {
                    	for (let i = 0; i < postData.targetOptionsSelect.length; i++) {
                    		if (!postData.targetOptionsSelect[i].optionValues) {
                    			this.$Message.warning('所添加的选项内容不能为空！')
                                return false
                            }
                        }
                    	postData.targetOptionsSelect.forEach(item => {
                    		item.thresholdValue = item.thresholdValue ? 1 : ''
                        })
                        postData.targetOptions = postData.targetOptionsSelect
                    } else if (postData.optionName === 'digit') {
                        for (let i = 0; i < postData.targetOptionsDigit.length; i++) {
                            if (!postData.targetOptionsDigit[i].thresholdStart || !postData.targetOptionsDigit[i].thresholdValueStart) {
                                this.$Message.warning('所添加的条件的类型及内容都不能为空！')
                                return false
                            }
                        }
                        postData.targetOptions = postData.targetOptionsDigit
                    } else {
                    	if (!postData.targetOptions.length) {
                            postData.targetOptions = [{
                                optionName: postData.optionName,
                                targetId: this.formData.targetId
                            }]
                        }
                    }
                    delete postData.targetOptionsSelect
                    delete postData.targetOptionsDigit
                    delete postData.secondProp
                    // console.log(postData)
                    // return false
                    await this.$API.indexManage[funcName](postData)
                    this.isDrawerShow = false
                    if (!this.formData.targetId) {
                        this.searchParams.pager = 1
                    }
                    this.handleQuery()
                }
            })
        },
        handleDelete (delId) {
            this.$Modal.confirm({
                title: '删除提示',
                content: '确定要删除该条指标吗?',
                onOk: async () => {
                    await this.$API.indexManage.delete({ id: delId })
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
        handleAddItem (type) {
            if (type === 'select') {
                this.formData.targetOptionsSelect.push({
                    optionValues: '',
                    thresholdValue: false
                })
            } else if (type === 'digit') {
                this.formData.targetOptionsDigit.push({
                    thresholdStart: '',
                    thresholdValueStart: ''
                })
            }
        },
        handleDeleteItem (index, name) {
    		const optionName = `targetOptions${name}`
    		this.formData[optionName].splice(index, 1)
        },
        handleTypeSelect (value) {
    		if (value) {
                this.formData.oName = value.label
            }
        }
    },
    mounted () {
        this.handleQuery()
        this.getIndexTypeOps()
    }
}
</script>
