<template>
	<div class="scheme-edit">
		<Card>
			<p slot="title">方案信息</p>
			<Form :model="baseForm" :rules="validate.schemeEdit" ref="form" class="scheme-form" :label-width="100">
				<FormItem label="方案名称" prop="schemeName">
					<Input v-model.trim="baseForm.schemeName" />
				</FormItem>
				<FormItem label="组织" required>
					<Cascader :data="orgOptions" change-on-select v-model="editOrgArray" filterable></Cascader>
					<Button @click="handleAddOrg">添加组织</Button>
					<Tag type="border"
						 color="primary"
						 closable
						 v-for="(item, index) in followupSchemeOrganizations"
						 :key="item.organizationId"
						 @on-close="handleOrgDelete(index)">
						{{item.organizationName}}
					</Tag>
				</FormItem>
				<FormItem label="方案类型" prop="activeType" style="width: 100%;">
					<RadioGroup v-model="baseForm.activeType">
						<Radio v-for="item in followupTypeOptions" :label="`${item.planTypeId}_${item.planTypeName}`" :key="item.planTypeId">{{item.planTypeName}}</Radio>
					</RadioGroup>
				</FormItem>
				<FormItem label="分类" :label-width="90" style="width: 100%;">
					<disease-type-select ref="drawerDiseaseSelect" :is-change="diseaseTypeSelectTrigger" :first-value="baseForm.firstProp" :second-value="baseForm.secondProp"></disease-type-select>
				</FormItem>
			</Form>
		</Card>
		<div class="main">
			<Card class="main-left">
				<p slot="title">第一步：选择模板</p>
				<Row class="user_main_search common_search" :gutter="20">
					<Col span="20">
						<span>模板名称</span>
						<Input v-model="searchParams.templateName"></Input>
					</Col>
					<Col span="4">
						<Button @click="handleQueryTemplate" type="primary">查询</Button>
					</Col>
					<Col span="24">
						<span>模板分类</span>
						<disease-type-select ref="disSelect" :is-multiple="false"></disease-type-select>
					</Col>
				</Row>
				<Scroll :on-reach-bottom="handleReachBottom" class="scroll-wrap-scheme" :loading-text="hasMoreData ? '加载中':'没有更多了'">
					<Card dis-hover :bordered="false" v-for="(item, index) in templateTableData" :key="index">
						<span class="template-name">{{item.templateName}}</span>
						<Button type="text" @click="handleAddTemplate(item.templateId,item.templateName)">添加</Button>
					</Card>
				</Scroll>
			</Card>
			<Card class="main-right">
				<p slot="title">
					第二步：方案配置
					<Button @click="handlePreview" class="preview-btn" :disabled="!chosenTemplateArr.length">预览方案</Button>
				</p>
				<Collapse>
					<Panel v-for="(item, index) in chosenTemplateArr" :name="index+''" :key="index">
						<span class="collapse-number">{{index + 1}}</span> 模板名称：{{item.baseInfo.templateName}}
						<div class="btns">
							<Button icon="md-refresh" shape="circle" @click.stop="handleBtns('refresh',index)"></Button>
							<Button icon="md-close" shape="circle" :disabled="item.isTrue === 0" @click.stop="handleBtns('delete',index)"></Button>
						</div>
						<div slot="content">
							<div>
								<div class="margin-bottom-10">
									<strong>随访周期：</strong>
									随访次数<InputNumber :min="0" v-model="item.Frequence.number"></InputNumber>次,
									<span v-show="index === 0">
										<Select v-model="item.Frequence.type" style="width: 70px;">
											<Option :value="0">提前</Option>
											<Option :value="1">延后</Option>
										</Select>
										<InputNumber :min="0" v-model="item.Frequence.firstday"></InputNumber>
										天第一次随访，
									</span>
									每隔
									<InputNumber :min="0" v-model="item.Frequence.intervalDays"></InputNumber>天，随访一次。
								</div>
								<div class="margin-bottom-10">
									<strong>随访时间段：</strong>
									<TimePicker
										confirm
										v-model="item.timePickerValueArr"
										format="HH:mm:ss"
										type="timerange"
										placement="bottom-end">
									</TimePicker>
									<Button @click="handleTimeSelect(index)" class="m-lf-rt-8">新增</Button>
									<Tag type="border"
										 color="primary"
										 closable
										 v-for="(time, timeIndex) in item.Ranges"
										 :key="timeIndex"
										 @on-close="handleTimeDelete(timeIndex, index)">
										{{time.beginTime}}-{{time.endTime}}
									</Tag>
								</div>
								<div class="margin-bottom-10" v-show="index === 0">
									<strong>未接重拨：</strong>
									<Checkbox v-model="item.RecallsObj.shouldRecall">需要重拨</Checkbox>
									<Select v-model="item.RecallsObj.callStatus" multiple style="width: 12vw" :disabled="!item.RecallsObj.shouldRecall">
										<Option v-for="item in recallOptions" :value="item.paramCode" :key="item.paramId">{{ item.paramName }}</Option>
									</Select>
									<Divider type="vertical" />
									重拨次数
									<InputNumber :min="0" v-model="item.RecallsObj.recallTime" :disabled="!item.RecallsObj.shouldRecall"></InputNumber>
									次
									<Divider type="vertical" />
									重拨间隔
									<InputNumber :min="0" v-model="item.RecallsObj.recallInterval" :disabled="!item.RecallsObj.shouldRecall"></InputNumber>
									小时
								</div>
								<div class="sms-block" v-show="index === 0">
									<strong>短信模板</strong>
									<div v-for="(sms, smsIndex) in item.Sms" :key='smsIndex'>
										{{smsTextArr[smsIndex]}}发送短信：{{smsIndex === 0 ? '提前':'延后'}}
										<InputNumber :min="0" v-model="sms.typeHour"></InputNumber>
										小时发送短信
										<span class="margin-left-10 margin-right-10">短信模板：{{smsTempTextArr[smsIndex]}}通知</span>
										<Tag
											type="border"
											color="primary"
											closable
											v-if="sms.smsTemplateId"
											@on-close="handleSmsTemplateDelete(smsIndex, index)">
											{{sms.templateName}}</Tag>
										<Button @click="handleSmsTemplateChoose(smsIndex, index)">{{sms.smsTemplateId ? '修改':'选择'}}短信模板</Button>
									</div>
								</div>
								<div class="sms-block margin-bottom-10">
									<strong>语音配置</strong>
								</div>
								<Collapse>
									<Panel v-for="(ques, quesIndex) in item.WavQueries" :name="quesIndex + ''" :key="quesIndex">
										<span class="collapse-number">{{ques[0].questionIdXml}}</span>
										 {{ques[1].questionName}}
										<div class="fn-fr" @click.stop="">
											<Checkbox v-model="ques[0].isImportantBoolean">重要</Checkbox>
										</div>
										<div slot="content">
											<div v-for="(op, opIndex) in ques" :key="opIndex" class="per-operation">
												<div v-if="opIndex !== 0" class="per-operation-title">
													<strong>处理：{{op.operationName}}</strong>
													<span class="fn-fr">
														跳转问题编号
														<template v-if="op.isEnd === 1 || (op.nextQuestionId==-10 && op.outRptSwitchId==-10)">
															结束通话
														</template>
														<template v-else>
															<span class="m-lf-rt-8">{{op.nextQuestionId}}</span>
															处理项
															<span class="m-lf-rt-8">{{op.outRptSwitchId}}</span>
														</template>
													</span>
												</div>
												<div class="per-operation-content">
													<div v-if="opIndex!==0 && opIndex !== 1 && opIndex !== 2 && opIndex !== 3" class="option-block">
														<div>
															<label class="margin-right-10">话术名称</label>
															{{op.switchText}}
														</div>
														<div class="margin-top-8">
															<label class="margin-right-10 fn-fl">判别规则</label>
															<div class="margin-left-70">{{op.switchRegexText}}</div>
														</div>
														<div class="option-block-right">
															<label class="margin-right-10">指标名称/值</label>
															{{op.keyName}}/{{op.keyValue}}
														</div>
													</div>
													<span class="content-label margin-right-10">{{opIndex === 0 ? '问题':''}}AI语音</span>
													<Tag type="border"
														 color="primary"
														 closable
														 v-for="(audio, audioIndex) in op.wavArr"
														 :key="audioIndex"
														 @on-close="handleAudioDelete(audioIndex, opIndex, quesIndex, index)">
														{{audioIndex + 1}}<Divider type="vertical" />{{audio.name}}
													</Tag>
													<Button class="fn-fr" @click="handleAudioChoose(opIndex, quesIndex, index)">添加语音</Button>
												</div>
											</div>
										</div>
									</Panel>
								</Collapse>
							</div>
						</div>
					</Panel>
				</Collapse>
			</Card>
		</div>
		<div class="save-btns margin-bottom-10">
			<Button @click="handleSave('new')">方案另存为</Button>
			<Button type="primary" @click="handleSave">保存方案</Button>
		</div>
		<!--选择短信模板 弹框-->
		<Drawer title="选择短信模板" v-model="showSms" :width="45" :mask-closable="false">
			<sms-list :show-choose="true" v-on:chosen="handleSmsChosenData" :reset-params="showSms"></sms-list>
		</Drawer>
		<!--选择语音文件 弹框-->
		<Drawer title="选择语音文件" v-model="showAudio" :width="45" :mask-closable="false">
			<audio-list :show-choose="true" v-on:chosen="handleAudioChosenData" :reset-params="showAudio"></audio-list>
		</Drawer>
		<!--预览弹框-->
		<Drawer title="预览方案" v-model="showPreview" :width="45" :mask-closable="false">
			<Row class="user_main_search common_search" :gutter="20">
				<Col span="18">
					<span style="width:130px;">模拟计划执行时间</span>
					<DatePicker type="datetime" v-model="previewDate" format="yyyy-MM-dd HH:mm:ss"></DatePicker>
				</Col>
				<Col span="4">
					<Button @click="getPreviewData" type="primary" :loading="previewTableParams.isLoading">预览方案</Button>
				</Col>
			</Row>
			<h2 class="margin-bottom-10">方案名称：{{baseForm.schemeName}}</h2>
			<Table :columns="previewTableConfig" :data="previewTableParams.data" :loading="previewTableParams.isLoading"></Table>
		</Drawer>
	</div>
</template>

<script>
import { parseTime } from '@/libs/tools.js'
import smsList from '../mesManage/mesTemplate'
import audioList from '../common-components/audio-choose'
import diseaseTypeSelect from '../common-components/disease-types-select'
import { formatToTreeData } from '@/libs/businessUtil'
const defaultItemMap = {
    '-1': '无匹配',
    '-2': '无声音',
    '-3': '通用处理'
}
export default {
    name: 'schemeEdit',
    components: {
        diseaseTypeSelect,
        smsList,
        audioList
    },
    data () {
    	return {
    		id: '',
            baseForm: {
    			schemeName: '',
                activeType: '',
                activeTypeName: '',
                firstProp: '',
                secondProp: []
            },
            followupTypeOptions: [],
            orgOptions: [],
            diseaseTypeSelectTrigger: false,
            editOrgArray: [], // 选中的组织数据
            followupSchemeOrganizations: [], // 选中的组织数组
            // 模板搜索参数
            searchParams: {
                templateName: '',
                diseaseType: '',
                diseaseId: '',
                pager: 1,
                limit: 50,
                sort: '', // 排序字段
                order: '' // 排序方式:降序 DESC 升序 ASC
            },
            templateTableData: [],
            hasMoreData: true,
            chosenTemplateArr: [], // 第二部的方案配置块数组数据
            recallOptions: [], // 重拨通话状态
            showSms: false,
            currentSmsIndex: 0, // 模板的当前短信项
            currentIndex: 0, // 当前模板
            currentXmlIndex: 0, // 模板的当前话术
            currentOpIndex: 0, // 模板的话术的当前第几条
            showAudio: false,
            followupSchemeDiseases: [], // 编辑时存储分类信息
            smsTextArr: ['拨打前', '拨打后', '未接通'],
            smsTempTextArr: ['通话前', '通话后', '未接通'],
            showPreview: false,
            previewTableParams: {
    			data: [],
                isLoading: false
            },
            previewDate: new Date(),
            previewTableConfig: [
                {
                    title: '计划序号',
                    key: '',
                    render: (h, params) => {
                        return h('span', params.index + 1)
                    }
                },
                {
                    title: '模板名称',
                    key: 'templateName'
                },
                {
                    title: '随访时间',
                    key: 'dateBegin'
                }
            ]
        }
    },
    methods: {
        /**
		 * @description 方案信息块的数据获取
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
                        value: `${item.organizationId}_${item.name}`,
                        organizationId: item.organizationId,
                        label: item.name,
                        children: []
                    }
                }
            })
            // 重拨通话状态select
            const resRecall = await this.$API.systemParamManage.list({ pager: 1, limit: 9999, paramTypeCode: 'reCallStatus' })
            this.recallOptions = resRecall.data
        },
        /**
		 * @description 添加组织
		 */
        handleAddOrg () {
        	const arrLength = this.editOrgArray.length
        	if (arrLength) {
        		const item = this.editOrgArray[arrLength - 1].split('_')
                const temp = {
                    organizationId: item[0],
                    organizationName: item[1]
                }
                const chosenOrgs = JSON.stringify(this.followupSchemeOrganizations)
                if (chosenOrgs.indexOf(temp.organizationId) === -1) {
                    this.followupSchemeOrganizations.push(temp)
                } else {
        			this.$Message.warning('该组织已添加！')
                }
            } else {
        		this.$Message.warning('请先选择组织后再添加！')
            }
            this.editOrgArray = []
        },
        /**
		 * @description 删除组织
		 */
        handleOrgDelete (index) {
            this.followupSchemeOrganizations.splice(index, 1)
        },
        // 第一步，选择模板块
        /**
		 * @description 获取模板列表
		 */
        async handleQueryTemplate (shouldClear = true) {
            const disSelectRes = this.$refs.disSelect.getSelectedData()
            this.searchParams.diseaseType = disSelectRes.firstData ? disSelectRes.firstData.paramId : ''
            this.searchParams.diseaseIds = disSelectRes.secondData ? disSelectRes.secondData.paramId : ''
            const res = await this.$API.templateManage.list(this.searchParams)
            if (res.data.length === res.total || res.data.length === 0) {
                this.hasMoreData = false
            }
            if (shouldClear) {
                this.templateTableData = res.data
            } else {
                this.templateTableData.push(res.data)
            }
        },
        /**
		 * @description 模板块滚动加载下一页
		 */
        handleReachBottom () {
            if (!this.hasMoreData) {
                return false
            }
            return new Promise(resolve => {
                this.searchParams.pager += 1
                this.handleQueryTemplate(false).then(res => {
                    resolve()
                })
            })
        },
        /**
		 * @description 格式化模板接口allinfo的数据
		 */
        async formatTemplateAllInfoData (templateId) {
            const res = await this.$API.templateManage.allInfo({ id: templateId })
            const allData = res.data
            // 处理项块数据整理
            const formatScripts = {}
            allData.followupQuestionCallScripts.forEach(item => {
                formatScripts[`${item.questionId}_${item.switchId}`] = {
                    keyName: item.keyName,
                    keyValue: item.keyValue,
                    switchText: item.switchText,
                    switchRegexText: item.switchRegexText
                }
            })
            // 问题名称块数据处理
            const formatQuestionName = {}
            allData.followupQuestions.forEach(item => {
                formatQuestionName[item.questionId] = item.questionName
            })
            const resChoseArr = []
            allData.followupTemplateQuestionQueries.forEach(item => {
                const tempArr = []
                // 问题的语音块
                tempArr.push({
                    isImportantBoolean: false,
                    switchWav: '',
                    switchWavExtend: '',
                    wavArr: [],
                    ...item.followupTemplateQuestion
                })
                // 问题下的 处理项
                item.followupTemplateQuestionJumps.forEach(ju => {
                    let tempObj = JSON.parse(JSON.stringify(ju))
                    tempObj.targetId = item.followupTemplateQuestion.targetId
                    tempObj.questionName = formatQuestionName[ju.questionId]
                    if (ju.switchId < 0) {
                        tempObj.operationName = defaultItemMap[ju.switchId]
                    } else {
                        tempObj.operationName = ju.switchId
                        tempObj = Object.assign(tempObj, formatScripts[`${ju.questionId}_${ju.switchId}`])
                    }
                    tempObj.switchWav = ''
                    tempObj.switchWavExtend = ''
                    tempObj.wavArr = []
                    tempArr.push(tempObj)
                })
                resChoseArr.push(tempArr)
            })
            return resChoseArr
        },
        /**
		 * @description 点击  模板中 的添加按钮
		 */
        async handleAddTemplate (templateId, templateName) {
            const resTemp = {}
            // 模板名称、id
            resTemp.baseInfo = {
        		templateName: templateName,
                templateId: templateId
            }
            // 1.随访时间块数据
            // 1-1 随访周期
            resTemp.Frequence = {
                firstday: 0,
                intervalDays: 0,
                number: 0,
                templateId: templateId,
                type: 0,
                id: ''
            }
            resTemp.timePickerValueArr = []
            // 1-2 随访时间断
            resTemp.Ranges = []
            // 1-3 未接重拨
            resTemp.RecallsObj = {
            	shouldRecall: true,
                callStatus: [],
                recallInterval: 0,
                recallTime: 0,
                templateId: templateId,
                id: ''
            }
            // 2. 短信模板块
            resTemp.Sms = [
            	// callType: 类型：0，提前；1，延后；2，未接通
                {
                    id: '',
                    templateId: templateId,
                    smsTemplateId: '',
                    type: 0,
                    typeHour: 0,
                    callType: 0
                },
                {
                    id: '',
                    templateId: templateId,
                    smsTemplateId: '',
                    type: 1,
                    typeHour: 0,
                    callType: 1
                },
                {
                    id: '',
                    templateId: templateId,
                    smsTemplateId: '',
                    type: 1,
                    typeHour: 0,
                    callType: 2
                }
            ]
            // 3.模板信息处理块
            const res = await this.formatTemplateAllInfoData(templateId)
            resTemp.WavQueries = res
            this.chosenTemplateArr.push(resTemp)
            // console.log(this.chosenTemplateArr)
        },
        /**
		 * @description 保存
		 */
        handleSave (type = 'update') {
        	if (!this.followupSchemeOrganizations.length) {
        		this.$Message.warning('请添加至少一个组织！')
                return false
            }
        	// console.log(this.chosenTemplateArr)
            const schemeId = type === 'new' ? '' : this.id
            this.$refs.form.validate(async (valid) => {
                if (valid) {
                    let isRecallStatusNullFlag = 0
                    const funcName = schemeId ? 'update' : 'add'
                    const postData = {}
                    // 1.基本信息
                    const activeTypeArr = this.baseForm.activeType.split('_')
                    postData.followupScheme = {
                        activeType: activeTypeArr[0],
                        activeTypeName: activeTypeArr[1],
                        schemeId: schemeId,
                        schemeName: this.baseForm.schemeName
                    }
                    // 2.疾病分类
                    postData.followupSchemeDiseases = JSON.parse(JSON.stringify(this.followupSchemeDiseases))
                    const disSelectedData = this.$refs.drawerDiseaseSelect.getSelectedData()
                    disSelectedData.secondData.forEach(item => {
                        if (item.paramId) {
                            postData.followupSchemeDiseases.push({
                                schemeId: schemeId,
                                diseaseType: disSelectedData.firstData.paramId,
                                diseaseTypeName: disSelectedData.firstData.paramName,
                                diseaseId: item.paramId,
                                diseaseName: item.paramName,
                                isNewAdd: true // 用来标记是新增的选择，防止被删掉
                            })
                        }
                    })
                    // 处理 分类 被删掉的情况
                    postData.followupSchemeDiseases = postData.followupSchemeDiseases.filter(item => (disSelectedData.secondData.indexOf(item.diseaseName) !== -1 || item.isNewAdd))
                    // 处理 另存为的情况
                    postData.followupSchemeDiseases.forEach((item, index) => {
                        item.schemeId = schemeId
                    })
                    // 3.组织块处理
                    this.followupSchemeOrganizations.forEach(item => {
                        item.schemeId = schemeId
                    })
                    postData.followupSchemeOrganizations = this.followupSchemeOrganizations
                    // 4.模板信息块处理
                    const resArr = []
                    this.chosenTemplateArr.forEach((item, index) => {
                        const temp = {}
                        const frequencySort = index
                        // console.warn(frequencySort)
                        // 4-1 Frequence
                        delete item.Frequence.schemeId
                        delete item.Frequence.frequencySort
                        temp.followupSchemeTemplateFrequence = {
                            frequencySort: frequencySort,
                            schemeId: schemeId,
                            ...item.Frequence
                        }
                        // 4-2 Questions
                        const tempQues = []
                        item.WavQueries.forEach(que => {
                            tempQues.push({
                                frequencySort: frequencySort,
                                id: que[0].id || '',
                                isImportant: que[0].isImportantBoolean ? 1 : 0,
                                questionId: que[0].questionId,
                                schemeId: schemeId,
                                targetId: que[0].targetId,
                                templateId: que[0].templateId
                            })
                        })
                        temp.followupSchemeTemplateQuestions = tempQues
                        // 4-3 Ranges
                        item.Ranges.forEach(rangeItem => {
                            rangeItem.frequencySort = frequencySort
                            rangeItem.schemeId = schemeId
                            rangeItem.templateId = item.WavQueries[0][0].templateId
                        })
                        temp.followupSchemeTemplateRanges = item.Ranges
                        // 4-4 Recalls
                        const recallArr = []
                        if (item.RecallsObj.shouldRecall) {
                        	if (item.RecallsObj.callStatus.length) {
                                item.RecallsObj.callStatus.forEach(recallStatuaItem => {
                                    recallArr.push({
                                        callStatus: recallStatuaItem,
                                        frequencySort: frequencySort,
                                        id: item.RecallsObj.id,
                                        recallInterval: item.RecallsObj.recallInterval,
                                        recallTime: item.RecallsObj.recallTime,
                                        schemeId: schemeId,
                                        templateId: item.WavQueries[0].templateId
                                    })
                                })
                            } else {
                        		if (index === 0) {
                                    this.$Message.warning(`第${index + 1}个模板的重拨通话状态不能为空！`)
                                    isRecallStatusNullFlag++
                                }
                            }
                        }
                        temp.followupSchemeTemplateRecalls = recallArr
                        // 4-5 sms
                        temp.followupSchemeTemplateSms = item.Sms
                        temp.followupSchemeTemplateSms.forEach(smsItem => {
                            smsItem.schemeId = schemeId
                            smsItem.frequencySort = frequencySort
                        })
                        // 4-6 wavs
                        const resWavsArr = []
                        item.WavQueries.forEach(queWav => {
                        	// queWav 每个问题及其处理项 数组
                            queWav.forEach(quePerWav => {
                                const tempWav = {}
                                const wavExtendArr = []
                                let switchWav = ''
                                let switchWavExtend = ''
                                let switchWavName = ''
                                quePerWav.wavArr.forEach(perWav => {
                                    wavExtendArr.push({
                                        extendId: perWav.id,
                                        type: perWav.type,
                                        wavId: perWav.wavId || ''
                                    })
                                    switchWav = `${switchWav}${perWav.value};`
                                    switchWavExtend = `${switchWavExtend}${perWav.type}|${perWav.id};`
                                    switchWavName = `${switchWavName}${perWav.name};`
                                })
                                quePerWav.switchWav = switchWav
                                quePerWav.switchWavExtend = switchWavExtend
                                quePerWav.frequencySort = frequencySort
                                quePerWav.schemeId = schemeId
                                tempWav.followupSchemeWav = quePerWav
                                tempWav.followupSchemeWavExtends = wavExtendArr
                                tempWav.switchWavName = switchWavName
                                if (quePerWav.isEnd === 1) {
                                	quePerWav.outRptSwitchId = -10
                                    quePerWav.nextQuestionId = -10
                                }
                                resWavsArr.push(tempWav)
                            })
                        })
                        temp.followupSchemeWavQueries = resWavsArr
                        // last
                        resArr.push(temp)
                    })
                    postData.followupSchemeTemplateQuestionQueries = resArr
                    if (isRecallStatusNullFlag === 0) {
                    	// break point
                        // console.log(postData)
                        // return false
                        await this.$API.schemeManage[funcName](postData)
                        this.$Message.success('保存成功！')
                        this.$router.push({
                            path: '/proConfig/schemeManage'
                        })
                    }
                } else {
                    this.$Message.warning('请先填写全方案信息块的必填信息！')
                }
            })
        },
        /**
		 * @description 每个模板的更新、删除按钮
		 */
        async handleBtns (type, index) {
        	if (type === 'refresh') {
                const tempNew = JSON.parse(JSON.stringify(await this.formatTemplateAllInfoData(this.chosenTemplateArr[index].baseInfo.templateId)))
                const tempOld = this.chosenTemplateArr[index].WavQueries
                tempNew.forEach((ques, quesIndex) => {
                    for (let i = 0; i < tempOld.length; i++) {
                		if (tempOld[i][0].questionId === ques[0].questionId) {
                            tempNew[quesIndex].forEach((xml, xmlIndex) => {
                                tempNew[quesIndex][xmlIndex].wavArr = tempOld[i][xmlIndex] ? tempOld[i][xmlIndex].wavArr : []
                            })
                        }
                    }
                })
                this.chosenTemplateArr[index].WavQueries = tempNew
            } else {
                this.$Modal.confirm({
                    title: '删除提示',
                    content: '是否确定移除该模板?',
                    onOk: () => {
                        this.chosenTemplateArr.splice(index, 1)
                    }
                })
            }
        },
        /**
		 * @description 随访时间段的选择
		 */
        handleTimeSelect (index) {
        	const array = this.chosenTemplateArr[index].timePickerValueArr
        	if (array.length && array[0]) {
        		this.chosenTemplateArr[index].Ranges.push({
                    beginTime: array[0],
                    endTime: array[1]
                })
                this.chosenTemplateArr[index].timePickerValueArr = []
            } else {
        		this.$Message.warning('请先选择时间区间后再新增！')
            }
        },
        handleTimeDelete (timeIndex, index) {
        	this.chosenTemplateArr[index].Ranges.splice(timeIndex, 1)
        },
        /**
		 * @description 短信模板的选择
		 */
        handleSmsTemplateChoose (smsIndex, index) {
        	this.showSms = true
            this.currentSmsIndex = smsIndex
            this.currentIndex = index
        },
        /**
		 * @description 短信模板的删除
		 */
        handleSmsTemplateDelete (smsIndex, index) {
        	const smsObj = JSON.parse(JSON.stringify(this.chosenTemplateArr[index].Sms[smsIndex]))
            smsObj.smsTemplateId = ''
            smsObj.templateName = ''
            this.$set(this.chosenTemplateArr[index].Sms, smsIndex, smsObj)
        },
        /**
		 * @description 短信模板的选择
		 * @param rowData
		 */
        handleSmsChosenData (rowData) {
        	this.showSms = false
            const smsObj = JSON.parse(JSON.stringify(this.chosenTemplateArr[this.currentIndex].Sms[this.currentSmsIndex]))
            smsObj.smsTemplateId = rowData.smsTid
            smsObj.templateName = rowData.templateName
            this.$set(this.chosenTemplateArr[this.currentIndex].Sms, this.currentSmsIndex, smsObj)
        },
        /**
		 * @description 语音文件的选择
		 */
        handleAudioChoose (opIndex, xmlIndex, index) {
            this.showAudio = true
            this.currentOpIndex = opIndex
            this.currentXmlIndex = xmlIndex
            this.currentIndex = index
        },
        /**
		 * @description 语音文件的删除
		 */
        handleAudioDelete (audioIndex, opIndex, quesIndex, index) {
            this.chosenTemplateArr[index].WavQueries[quesIndex][opIndex].wavArr.splice(audioIndex, 1)
        },
        /**
		 * @description 语音文件的删除
		 */
        handleAudioChosenData (rowData) {
            this.showAudio = false
            this.chosenTemplateArr[this.currentIndex].WavQueries[this.currentXmlIndex][this.currentOpIndex].wavArr.push(rowData)
        },
        /**
		 * @description 编辑时 allInfo
		 */
        async getAllInfo () {
            const res = await this.$API.schemeManage.allInfo({ id: this.id })
            const resAllData = res.data
            // 1.基本信息
            this.baseForm = {
                schemeName: resAllData.schemeName,
                activeType: `${resAllData.activeType}_${resAllData.activeTypeName}`,
                activeTypeName: resAllData.activeTypeName,
                firstProp: '',
                secondProp: []
            }
            // 2.分类块数据
            const diseaseData = resAllData.followupSchemeDiseases
            if (diseaseData.length) {
                this.followupSchemeDiseases = JSON.parse(JSON.stringify(diseaseData))
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
            }
            // 3.组织
            this.followupSchemeOrganizations = resAllData.followupSchemeOrganizations
            // 4.模板块 chosenTemplateArr
            const dbData = resAllData.followupSchemeTemplateQuestionQueries
            const resChosen = []
            dbData.forEach((item, index) => {
            	const temp = {}
            	// 模板名称、id
                temp.baseInfo = {
            		templateId: item.followupTemplates[0].templateId,
                    templateName: item.followupTemplates[0].templateName
                }
                // 能否删除 0是不能删除
            	temp.isTrue = item.isTrue
            	// 4-1followupSchemeTemplateFrequence
                temp.Frequence = item.followupSchemeTemplateFrequence
                // 4-2 Ranges
                temp.Ranges = item.followupSchemeTemplateRanges
                // 4-3 未接重拨
                const callStatus = []
                let shouldRecall = false
                if (item.followupSchemeTemplateRecalls.length) {
                    shouldRecall = true
                    item.followupSchemeTemplateRecalls.forEach(perCall => {
                        callStatus.push(perCall.callStatus)
                    })
                }
                temp.RecallsObj = item.followupSchemeTemplateRecalls[0] || {}
                temp.RecallsObj.shouldRecall = shouldRecall
                temp.RecallsObj.callStatus = callStatus
                // 4-4 短信模板
                temp.Sms = item.followupSchemeTemplateSms
                // 4-5 问题及其处理项
                const resWav = []
                const dbWavs = item.followupSchemeWavQueries
                item.followupSchemeTemplateQuestions.forEach(perQues => {
                    const perArr = []
                    dbWavs.forEach(perWav => {
                    	const wavMain = perWav.followupSchemeWav
                        if (perQues.questionId === wavMain.questionId) {
                            wavMain.isImportantBoolean = perQues.isImportant === 1
                            const resWavArr = []
                            const idTypeArr = wavMain.switchWavExtend.split(';')
                            const valueArr = wavMain.switchWav.split(';')
                            const nameArr = perWav.switchWavName.split(';')
                            valueArr.forEach((wavVal, wavValIndex) => {
                            	if (wavVal) {
                            		resWavArr.push({
                                        id: idTypeArr[wavValIndex].split('|')[1],
                                        type: idTypeArr[wavValIndex].split('|')[0],
                                        name: nameArr[wavValIndex],
                                        value: wavVal,
                                        wavId: wavMain.wavId
                                    })
                                }
                            })
                            wavMain.wavArr = resWavArr
                            wavMain.operationName = defaultItemMap[wavMain.switchId] || wavMain.switchId
                            perArr.push(wavMain)
                        }
                    })
                    resWav.push(perArr)
                })
                temp.WavQueries = resWav
                resChosen.push(temp)
            })
            this.chosenTemplateArr = resChosen
            // console.log(resChosen)
        },
        /**
		 * @description 预览方案
		 */
        async handlePreview () {
        	this.showPreview = true
            this.getPreviewData()
        },
        /**
		 * @description 获取预览数据
		 */
        async getPreviewData () {
        	if (!this.previewDate) {
        		this.$Message.warning('请先选择时间！')
                return false
            }
            this.previewTableParams.isLoading = true
            const followupSchemeTemplateFrequences = []
            this.chosenTemplateArr.forEach((item, index) => {
                const frequencySort = index
                delete item.Frequence.schemeId
                delete item.Frequence.frequencySort
                followupSchemeTemplateFrequences.push({
                    frequencySort: frequencySort,
                    schemeId: this.id,
                    ...item.Frequence
                })
            })
            const postData = {
                dateBegin: parseTime(this.previewDate),
                followupSchemeTemplateFrequences
            }
            const res = await this.$API.schemeManage.preview(postData).catch(e => {
                this.previewTableParams.isLoading = false
            })
            this.previewTableParams.data = res.data
            this.previewTableParams.isLoading = false
        }
    },
    mounted () {
    	this.getSearchParamsData().then(res => {
            if (this.id) {
                this.getAllInfo()
            }
        })
        this.handleQueryTemplate()
        this.id = this.$route.query.id
    }
}
</script>

<style lang="less">
	.scheme-edit{
		height: 100%;
		.scheme-form{
			.ivu-form-item{
				display: inline-block;
				width: 50%;
				.ivu-cascader{
					width: ~"calc(100% - 100px)";
					display: inline-block;
					margin-right: 8px;
				}
			}
		}
		.save-btns{
			margin-top: 8px;
			.ivu-btn{
				margin-right: 8px;
			}
		}
		.main{
			margin-top: 8px;
			height: 100%;
			overflow: auto;
			.ivu-card{
				height: 100%;
			}
			&-left{
				width: 30vw;
				float: left;
			}
			&-right{
				margin-left: ~"calc(30vw + 8px)";
				.preview-btn{
					position: absolute;
					right: 16px;
					top: 9px;
				}
				.m-lf-rt-8{
					margin: 0 8px;
				}
				.btns {
					position: absolute;
					right: 0;
					top: -1px;
					.ivu-btn {
						margin-right: 8px;
						background-color: #d8d8d8;
						border: 0;
						color: white;
					}
				}
				.ivu-input-number{
					margin: 0 8px;
				}
				.sms-block{
					border-top: 1px solid #dcdee2;
					padding-top: 8px;
					>div{
						background-color: #f7f7f7;
						margin: 8px 0;
						padding: 8px 3px;
						.ivu-btn{
							float: right;
						}
					}
				}
				.ivu-collapse{
					max-height: 100%;
					overflow: auto;
					.ivu-icon-ios-arrow-forward{
						position: absolute;
						left: 16px;
						top: 12px;
						z-index: 1;
					}
					.collapse-number{
						font-weight: 700;
						background-color: #d2d7dd;
						position: relative;
						padding-left: 40px;
						padding-right: 24px;
						display: inline-block;
						margin-left: -16px;
						margin-right: 8px;
						width: 100px;
						text-align: center;
					}
					.per-operation{
						overflow: auto;
						border: 1px solid #dcdee2;
						margin-bottom: 8px;
						&-title{
							background-color: #f7f7f7;
							padding: 16px 8px;
						}
						&-content{
							overflow: auto;
							padding: 16px 8px;
							width: 100%;
							.margin-left-70{
								margin-left: 70px;
							}
							&-label{
								margin-top: 8px;
								display: inline-block;
								margin-right: 8px;
							}
							.option-block{
								position: relative;
								overflow: auto;
								margin-bottom: 8px;
								&-right{
									position: absolute;
									right: 0;
									top: 0;
								}
							}
						}
					}
				}
			}
		}
		.ivu-card-body{
			height: ~"calc(100% - 51px)";
			position: relative;
			.template-name{
				display: inline-block;
				width: ~"calc(100% - 50px)";
				word-break: break-all;
			}
			.scroll-wrap-scheme{
				height: ~"calc(100% - 115px)";
				.ivu-scroll-container{
					height: 100% !important;
				}
				.ivu-card{
					background-color: #f2f2f2;
					margin-right: 8px;
					margin-bottom: 8px;
					color: #686868;
					.ivu-btn{
						position: absolute;
						top: 50%;
						right: 20px;
						margin: -15px;
					}
				}
			}
		}
	}
</style>
