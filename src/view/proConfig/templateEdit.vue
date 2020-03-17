<template>
	<div class="template-edit">
		<Card>
			<p slot="title">随访模板信息</p>
			<Form :model="baseForm" :rules="validate.templateEdit" ref="form" class="template-form" :label-width="120">
				<FormItem label="模板名称" prop="templateName" style="display: block">
					<Input v-model.trim="baseForm.templateName" />
				</FormItem>
				<FormItem label="分类" :label-width="110" required>
					<disease-type-select ref="drawerDiseaseSelect" :is-change="diseaseTypeSelectTrigger" :first-value="baseForm.firstProp" :second-value="baseForm.secondProp"></disease-type-select>
				</FormItem>
				<FormItem label="静默时间（秒）" prop="silentTime">
					<InputNumber :min="1" v-model.trim="baseForm.silentTime" />
				</FormItem>
				<FormItem label="无匹配重复次数" prop="noMatchRepeat">
					<InputNumber :min="1" v-model.trim="baseForm.noMatchRepeat" />
				</FormItem>
				<FormItem label="无声音重复次数" prop="noSoundRepeat">
					<InputNumber :min="1" v-model.trim="baseForm.noSoundRepeat" />
				</FormItem>
				<FormItem label="起始问题编号" prop="startNumber">
					<InputNumber v-model.trim="baseForm.startNumber" />
				</FormItem>
				<FormItem label="合成声音" prop="person">
					<RadioGroup v-model="baseForm.person">
						<Radio :label="0">女声</Radio>
						<Radio :label="1">男声</Radio>
					</RadioGroup>
				</FormItem>
				<FormItem label="选择通用库">
					<Select
						ref="remoteSelect"
						v-model="libSelectValue"
						multiple
						filterable
						remote
						:remote-method="remoteMethodLib"
						:loading="remoteLoading">
						<Option v-for="option in libOptions" :value="option.libId" :key="option.libId">{{option.name}}</Option>
					</Select>
				</FormItem>
			</Form>
		</Card>
		<Card>
			<p slot="title">第一步：选择随访问题</p>
			<span class="title-tip">双击问题标题或者直接点击添加，进行问题选择</span>
			<Row class="user_main_search common_search" :gutter="20">
				<Col span="5">
					<span>问题名称</span>
					<Input v-model="searchParams.questionName" placeholder="问题名称"></Input>
				</Col>
				<Col span="9">
					<span>问题分类</span>
					<disease-type-select ref="disSelect" :is-multiple="false"></disease-type-select>
				</Col>
				<Col span="2">
					<Button @click="handleQuery" type="primary">查询</Button>
				</Col>
			</Row>
			<Scroll :on-reach-bottom="handleReachBottom" class="scroll-wrap" :loading-text="hasMoreData ? '加载中':'没有更多了'">
				<Card dis-hover :bordered="false" v-for="(item, index) in tableData" :key="index" :class="{'card-chosen': item.isChosen}" v-on:dblclick.native="handleAddQues(item,index)">
					{{item.questionName}}
					<Button type="text" v-if="!item.isChosen" @click="handleAddQues(item,index)">添加</Button>
					<Button type="text" v-else :disabled="true">已添加</Button>
				</Card>
			</Scroll>
		</Card>
		<Card>
			<p slot="title">第二步：模板配置</p>
			<span class="title-tip">如问题跳转勾选为结束，则结束当前通话，且问题跳转设置无效</span>
			<el-collapse class="template-set">
				<draggable
					tag="el-collapse"
					handle=".handle"
					:list="chosenQuestion">
				<el-collapse-item v-for="(item, index) in chosenQuestion" :name="item[0].questionId" :key="item[0].questionId">
					<template slot="title">
						<span class="template-set-number">{{item[0].questionIdXml}}</span> {{item[0].questionName}}
						<div class="template-set-btns">
							<Button icon="md-refresh" shape="circle" @click.stop="handleBtns('refresh',index)"></Button>
							<Button icon="md-remove" shape="circle" @click.stop="handleBtns('delete',index)"></Button>
							<Button icon="md-arrow-up" shape="circle" :disabled="index === 0" @click.stop="handleBtns('up',index)"></Button>
							<Button icon="md-arrow-down" shape="circle" :disabled="index === (chosenQuestion.length-1)" @click.stop="handleBtns('down',index)"></Button>
							<Button icon="md-menu" shape="circle" class="handle" @click.stop></Button>
						</div>
					</template>

					<ul class="operation-ul">
						<li v-for="(op, opIndex) in item" :key="opIndex">
							<div class="title">处理：{{op.operationName}}</div>
							<div v-if="opIndex!==0 && opIndex !== 1 && opIndex !== 2" class="option-block">
								<div>
									<label>话术名称</label>
									{{op.switchText}}
								</div>
								<div>
									<label>指标名称/值</label>
									{{op.keyName}}/{{op.keyValue}}
								</div>
							</div>
							<Row :gutter="10" class="input-block">
								<Col span="10">
									<span>跳转问题编号</span>
									<Input v-model="op.nextQuestionId" placeholder="请填写跳转问题编号" :disabled="op.isEndBoolean"/>
								</Col>
								<Col span="10">
									<span>处理项</span>
									<Input v-model="op.outRptSwitchId" placeholder="请填写跳转问题下的处理项编号" :disabled="op.isEndBoolean"/>
								</Col>
								<Col span="4" style="margin-top: 5px;">
									<Checkbox v-model="op.isEndBoolean">结束对话</Checkbox>
								</Col>
							</Row>
						</li>
					</ul>
				</el-collapse-item>
				</draggable>
			</el-collapse>

		</Card>
		<div class="save-btns">
			<Button @click="handleSave('new')">模板另存为</Button>
			<Button type="primary" @click="handleSave">保存模板</Button>
		</div>
	</div>
</template>

<script>
import { debounce } from '@/libs/businessUtil'
import draggable from 'vuedraggable'
import diseaseTypeSelect from '../common-components/disease-types-select'
const defaultItemMap = {
    '-1': '无匹配',
    '-2': '无声音',
    '-3': '通用处理'
}
/**
 * 交换数组中的两个元素--用于上移，下移
 * @param arr
 * @param index1
 * @param index2
 * @returns arr
 */
const swapItems = function (arr, index1, index2) {
    arr[index1] = arr.splice(index2, 1, arr[index1])[0]
    return arr
}
export default {
    name: 'templateEdit',
    components: {
        diseaseTypeSelect,
        draggable
    },
    data () {
    	return {
    		id: '',
            diseaseTypeSelectTrigger: false,
    		baseForm: {
    			templateId: '',
                templateName: '',
                silentTime: 5,
                noMatchRepeat: 0,
                noSoundRepeat: 0,
                startNumber: 1000,
                person: 0,
                firstProp: '',
                secondProp: []
            },
            followupTemplateDiseases: [], // 编辑时存储分类信息
            // 选择通用库块数据
            remoteLoading: false,
            libSelectValue: [],
            libOptions: [],
            libOptionsObj: {}, // 提交时匹配得到除name外的数据
            questions: [],
            // 随访问题块
            tableData: [],
            hasMoreData: true,
            searchParams: {
                questionName: '',
                targetName: '',
                pager: 1,
                limit: 50,
                sort: '', // 排序字段
                order: '' // 排序方式:降序 DESC 升序 ASC
            },
            chosenQuestion: [],
            maxQuesXml: 1000
        }
    },
    methods: {
        /**
		 * @description 通用库 模糊查询方法
		 */
        remoteMethodLib (query) {
            if (query !== '') {
                let queryMethod = async () => {
                    this.remoteLoading = true
                    const res = await this.$API.commonLib.commonList({ limit: 10000, pager: 1, name: query }).catch(e => {
                        this.remoteLoading = false
                    })
                    this.libOptions = res.data
                    res.data.forEach(item => {
                        this.libOptionsObj[item.libId] = {
                            libId: item.libId,
                            libName: item.name,
                            sort: 0,
                            templateId: this.id,
                            xmlUrl: item.xmlUrl
                        }
                    })
                    this.remoteLoading = false
                }
                debounce(queryMethod, 200)()
            } else {
                this.libOptions = []
            }
        },
        /**
		 *@description 处理数据，设置isChosen的值
		 */
        filterTableData (data) {
            const chosenQuesIds = []
            this.chosenQuestion.forEach(item => {
                chosenQuesIds.push(item[0].questionId)
            })
            data.forEach(item => {
                if (chosenQuesIds.indexOf(item.questionId) !== -1) {
                    item.isChosen = true
                } else {
                	item.isChosen = false
                }
            })
            return data
        },
        /**
		 * @description 随访问题列表
		 */
        async handleQuery (shouldClear = true) {
            const disSelectRes = this.$refs.disSelect.getSelectedData()
            this.searchParams.diseaseType = disSelectRes.firstData ? disSelectRes.firstData.paramId : ''
            this.searchParams.diseaseIds = disSelectRes.secondData ? disSelectRes.secondData.paramId : ''
            const res = await this.$API.questionManage.list(this.searchParams)
            if (res.data.length === res.total || res.data.length === 0) {
            	this.hasMoreData = false
            }
            // 编辑时,处理选中的问题
            const dataFormat = this.filterTableData(res.data)
            if (shouldClear) {
            	this.tableData = dataFormat
            } else {
                this.tableData.push(dataFormat)
            }
        },
        /**
		 * @description 随访问题列表--无限滚动
		 */
        handleReachBottom () {
            if (!this.hasMoreData) {
        		return false
            }
            return new Promise(resolve => {
            	this.searchParams.pager += 1
                this.handleQuery(false).then(res => {
                    resolve()
                })
            })
        },
        /**
		 * @description 添加问题
		 */
        async handleAddQues (item, index) {
        	if (item.isChosen) {
        		return false
            }
            item.isChosen = true
        	this.$set(this.tableData, index, item)
        	const questionId = item.questionId
            const questionName = item.questionName
            const targetId = item.targetId
            const baseItem = {
                questionName: questionName,
                isEndBoolean: false,
                nextQuestionId: '',
                outRptSwitchId: '',
                questionId: questionId,
                questionIdXml: this.maxQuesXml,
                sort: 0, // 待提交时遍历处理,从0开始，递增
                targetId: targetId,
                templateId: ''
            }
            const res = []
            for (let i = -3; i < 0; i++) {
            	res.unshift({
                    switchId: i,
                    operationName: defaultItemMap[i],
                    ...baseItem
                })
            }
        	const resDB = await this.$API.questionEdit.info({ id: questionId })
            resDB.data.FollowupQuestionCallScript.forEach((item, index) => {
            	res.push({
                    switchId: index + 1,
                    operationName: index + 1,
                    switchText: item.switchText,
                    keyName: item.keyName,
                    keyValue: item.keyValue,
                    ...baseItem
                })
            })
            this.chosenQuestion.push(res)
            this.maxQuesXml += 1
        },
        /**
		 * @description 编辑时获取
		 */
        async getAllInfo () {
        	const res = await this.$API.templateManage.allInfo({ id: this.id })
            const allData = res.data
            // 分类信息
            this.followupTemplateDiseases = allData.followupTemplateDiseases
            // 基本信息
            this.baseForm = {
                templateId: this.id,
                templateName: allData.templateName,
                silentTime: allData.silentTime,
                noMatchRepeat: allData.noMatchRepeat,
                noSoundRepeat: allData.noSoundRepeat,
                startNumber: allData.startNumber - 0,
                person: allData.person
            }
            // 分类块数据
            const diseaseData = allData.followupTemplateDiseases
            this.baseForm.firstProp = diseaseData[0].diseaseType
            const secondPropArr = []
            diseaseData.forEach(item => {
                secondPropArr.push({
                    paramId: item.diseaseId,
                    paramName: item.diseaseName
                })
            })
            this.baseForm.secondProp = secondPropArr
            this.diseaseTypeSelectTrigger = true
            // 通用库数据
            const libData = allData.followupTemplateLibs
            const libChosen = []
            this.libOptions = libData
            libData.forEach(item => {
                this.libOptionsObj[item.libId] = item
                libChosen.push(item.libId)
            })
            this.libOptions.forEach(item => {
                item.name = item.libName
            })
            this.libSelectValue = libChosen
            // 模板配置块处理--整理出chosenQuestion格式
            // 处理项块数据整理
            const formatScripts = {}
            allData.followupQuestionCallScripts.forEach(item => {
                formatScripts[`${item.questionId}_${item.switchId}`] = {
                    keyName: item.keyName,
                    keyValue: item.keyValue,
                    switchText: item.switchText
                }
            })
            // 问题名称块数据处理
            const formatQuestionName = {}
            allData.followupQuestions.forEach(item => {
                formatQuestionName[item.questionId] = item.questionName
            })
            const resChoseArr = []
            const allXmlNumbers = []
            allData.followupTemplateQuestionQueries.forEach(item => {
                allXmlNumbers.push(item.followupTemplateQuestion.questionIdXml)
                const tempArr = []
                item.followupTemplateQuestionJumps.forEach(ju => {
                    let tempObj = JSON.parse(JSON.stringify(ju))
                    tempObj.isEndBoolean = tempObj.isEnd !== 0
                    tempObj.targetId = item.followupTemplateQuestion.targetId
                    tempObj.questionName = formatQuestionName[ju.questionId]
                    if (ju.switchId < 0) {
                    	tempObj.operationName = defaultItemMap[ju.switchId]
                    } else {
                    	tempObj.operationName = ju.switchId
                        tempObj = Object.assign(tempObj, formatScripts[`${ju.questionId}_${ju.switchId}`])
                    }
                    tempArr.push(tempObj)
                })
                resChoseArr.push(tempArr)
            })
            this.maxQuesXml = Math.max(...allXmlNumbers) + 1
            this.chosenQuestion = resChoseArr
            this.handleQuery()
        },
        /**
		 * 保存模板
		 */
        handleSave (type = 'update') {
        	const templateId = type === 'new' ? '' : this.id
            this.$refs.form.validate(async (valid) => {
                if (valid) {
                    const funcName = templateId ? 'update' : 'add'
                	const postData = {}
                	postData.followupTemplate = this.baseForm
                    postData.followupTemplate.templateId = templateId
                    // 1.分类块的数据处理
                    postData.followupTemplateDiseases = this.followupTemplateDiseases
                    const disSelectedData = this.$refs.drawerDiseaseSelect.getSelectedData()
                    if (!disSelectedData.secondData.length) {
                        this.$Message.warning('请选择分类！')
                        return false
                    }
                    disSelectedData.secondData.forEach(item => {
                        if (item.paramId) {
                            postData.followupTemplateDiseases.push({
                                templateId: templateId,
                                diseaseType: disSelectedData.firstData.paramId,
                                diseaseTypeName: disSelectedData.firstData.paramName,
                                diseaseId: item.paramId,
                                diseaseName: item.paramName,
                                isNewAdd: true // 用来标记是新增的选择，防止被删掉
                            })
                        }
                    })
                    // 处理 分类 被删掉的情况
                    postData.followupTemplateDiseases = postData.followupTemplateDiseases.filter(item => (disSelectedData.secondData.indexOf(item.diseaseName) !== -1 || item.isNewAdd))
                    // 处理 另存为的情况
                    postData.followupTemplateDiseases.forEach((item, index) => {
                        item.templateId = templateId
                    })
                    // 2.通用库块的处理
                    postData.followupTemplateLibs = []
                    for (let i = 0; i < this.libSelectValue.length; i++) {
                    	const item = this.libOptionsObj[this.libSelectValue[i]]
                        item.sort = i
                        item.templateId = templateId
                        postData.followupTemplateLibs.push(item)
                    }
                    // 3.模板配置块处理
                    const tempRes = []
                    this.chosenQuestion.forEach((item, index) => {
                    	const temp = {}
                    	temp.followupTemplateQuestion = {
                            questionId: item[0].questionId,
                            questionIdXml: item[0].questionIdXml,
                            sort: index, // 待提交时遍历处理,从0开始，递增
                            targetId: item[0].targetId,
                            templateId: templateId
                        }
                        temp.followupTemplateQuestionJumps = []
                        for (let i = 0; i < item.length; i++) {
                    		const perItem = JSON.parse(JSON.stringify(item[i]))
                            perItem.sort = i
                            perItem.templateId = templateId
                            perItem.isEnd = perItem.isEndBoolean ? 1 : 0
                    		temp.followupTemplateQuestionJumps.push(perItem)
                        }
                    	tempRes.push(temp)
                    })
                    postData.followupTemplateQuestionQueries = tempRes
                    // console.log(postData)
                    // return false
                    await this.$API.templateManage[funcName](postData)
                    this.$Message.success('保存成功！')
                    this.$router.push({
                        path: '/proConfig/templateManage'
                    })
                } else {
                	this.$Message.warning('请先填写全随访模板信息块的必填信息！')
                }
            })
        },
        /**
		 * @description 处理问题的 删除、上移、下移
		 */
        async handleBtns (type, index, event) {
        	if (type === 'up') {
                if (index === 0) {
                    return false
                }
                this.chosenQuestion = swapItems(this.chosenQuestion, index, index - 1)
            } else if (type === 'down') {
                if (index === this.chosenQuestion.length - 1) {
                    return false
                }
                this.chosenQuestion = swapItems(this.chosenQuestion, index, index + 1)
            } else if (type === 'delete') {
                this.$Modal.confirm({
                    title: '提示',
                    content: '是否确定移除该问题？',
                    onOk: () => {
                        this.chosenQuestion.splice(index, 1)
                        this.tableData = this.filterTableData(this.tableData)
                    }
                })
            } else if (type === 'refresh') {
        		// 获取新的 问题话术
        		const questionInfo = this.chosenQuestion[index][0]
                const questionId = questionInfo.questionId
                const questionName = questionInfo.questionName
                const targetId = questionInfo.targetId
                const quesXml = questionInfo.questionIdXml
                const resDB = await this.$API.questionEdit.info({ id: questionId })
                const baseItem = {
                    questionName: questionName,
                    isEndBoolean: false,
                    nextQuestionId: '',
                    outRptSwitchId: '',
                    questionId: questionId,
                    questionIdXml: quesXml,
                    sort: 0, // 待提交时遍历处理,从0开始，递增
                    targetId: targetId,
                    templateId: ''
                }
                const oldBlockData = this.chosenQuestion[index].splice(3, this.chosenQuestion[index].length - 3)
                const resNew = this.chosenQuestion[index]
                resDB.data.FollowupQuestionCallScript.forEach((item, index) => {
                    resNew.push({
                        switchId: index + 1,
                        operationName: index + 1,
                        switchText: item.switchText,
                        keyName: item.keyName,
                        keyValue: item.keyValue,
                        ...baseItem
                    })
                })
                oldBlockData.forEach(oldItem => {
                	resNew.forEach(newItem => {
                		if (oldItem.switchText === newItem.switchText) {
                			newItem.isEndBoolean = oldItem.isEndBoolean
                            newItem.nextQuestionId = oldItem.nextQuestionId
                            newItem.outRptSwitchId = oldItem.outRptSwitchId
                        }
                    })
                })
                this.$set(this.chosenQuestion, index, resNew)
            }
        }
    },
    mounted () {
    	this.id = this.$route.query.id
        if (this.id) {
    		this.getAllInfo()
        } else {
            this.handleQuery()
        }
    }
}
</script>

<style lang="less">
	.template-form{
		.ivu-form-item{
			width: 50%;
			display: inline-block;
		}
		.ivu-input-number{
			width: 100%;
		}
	}
	.ivu-card {
		position: relative;
		.title-tip{
			position: absolute;
			left: 300px;
			top: 14px;
			color: #c3c3c3;
		}
	}
	.scroll-wrap{
		.ivu-scroll-container{
			max-height: 300px;
			height: auto !important;
		}
		.ivu-card{
			background-color: #f2f2f2;
			width: ~"calc(50% - 16px)";
			display: inline-block;
			margin-right: 8px;
			margin-bottom: 8px;
			color: #686868;
			.ivu-btn{
				float: right;
				position: relative;
				top: -5px;
			}
		}
		.card-chosen{
			background-color: #e5e5e5;
		}
	}
	.template-set{
		max-height: 100%;
		overflow: auto;
		border: 0;
		.el-collapse-item{
			margin-bottom: 8px;
			border: 2px solid #dcdee2;
		}
		.el-collapse-item__wrap{
			border: 0;
		}
		.el-collapse{
			border: 0;
		}
		&-number{
			font-weight: bold;
			background-color: #d2d7dd;
			padding-left: 40px;
			padding-right: 24px;
			display: inline-block;
			margin-right: 8px;
		}
		&-btns{
			position: absolute;
			right: 0;
			top: -1px;
			.ivu-btn{
				margin-right: 8px;
				background-color: #d8d8d8;
				border: 0;
				color: white;
			}
		}
		.el-collapse-item__header{
			position: relative;
			border: 0;
			.el-collapse-item__arrow{
				position: absolute;
				left: 16px;
				top: 16px;
				z-index: 1;
			}

		}
		.operation-ul{
			padding: 8px 102px 0 94px;
			li{
				list-style: none;
				border: 1px solid #dcdee2;
				margin-bottom: 8px;
				.title{
					font-weight: bold;
					background-color: #f7f7f7;
					padding: 13px 8px;
				}
				.input-block{
					margin: 8px;
					padding-left: 8px;
					.ivu-input-wrapper{
						width: ~"calc(100% - 110px)";
						margin-left: 8px;
					}
				}
				.option-block{
					margin-left: 8px;
					div{
						margin: 8px 0;
					}
					label{
						width: 100px;
						display: inline-block;
					}
				}
			}
		}
	}
	.save-btns{
		margin-top: 8px;
		.ivu-btn{
			margin-right: 8px;
		}
	}
</style>
