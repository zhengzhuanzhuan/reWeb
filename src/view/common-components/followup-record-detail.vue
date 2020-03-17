<template>
	<Modal
		v-model="isModalShow"
		title="随访详情"
		:mask-closable="false"
		:loading="true"
		width="70"
		@on-cancel="isModalShow=false"
		class-name="followup-detail-dialog">
		<Collapse :value="[1,2]">
			<Panel name="1">
				随访结果
				<p slot="content">
					<Col span="12">
						<span>患者姓名：</span>
						<span>{{allData.visitFollowupRecordVo.brxm}}</span>
					</Col>
					<Col span="12">
						<span>采用随访方案：</span>
						<span>{{allData.visitFollowupRecordVo.schemeName}}</span>
					</Col>
					<Col span="12">
						<span>预计执行时间：</span>
						<span>{{allData.visitFollowupRecordVo.dateEnd}}</span>
					</Col>
					<Col span="12">
						<span>呼叫状态：</span>
						<span>{{allData.visitFollowupRecordVo.callStatusName}}</span>
					</Col>
					<Col span="12">
						<span>实际完成时间：</span>
						<span>{{allData.visitFollowupRecordVo.dateEnd}}</span>
					</Col>
					<Col span="12">
						<span>联系电话：</span>
						<span>{{allData.visitFollowupRecordVo.mobile}}</span>
					</Col>
					<!--可编辑时-->
					<template v-if="canEdit">
						<Form :model="resultForm" :label-width="110" :rules="validate.followupDetailResult" ref="stopForm" label-position="left">
							<FormItem label="AI随访审核意见" prop="vetRemark">
								<Input v-model="resultForm.vetRemark" type="textarea"></Input>
							</FormItem>
							<FormItem label="人工外呼" prop="isArtificialCall" v-show="showArtificialCall">
								<RadioGroup v-model="resultForm.isArtificialCall" @on-change="handleIsArtificialCallChange">
									<Radio label="1">需要</Radio>
									<Radio label="0">不需要</Radio>
								</RadioGroup>
								<Divider type="vertical" />
								<Checkbox v-model="resultForm.isArtificialUrgent" :disabled="resultForm.isArtificialCall === '0'">外呼加急</Checkbox>
							</FormItem>
							<FormItem label="终止随访" prop="isStop">
								<RadioGroup v-model="resultForm.isStop" @on-change="handleIsStopFollow">
									<Radio label="1">是</Radio>
									<Radio label="0">否</Radio>
								</RadioGroup>
							</FormItem>
							<template v-if="resultForm.isStop === '1'">
								<FormItem label="原因" prop="cancleReason">
									<Select v-model="resultForm.cancleReason" class="form-item" transfer>
										<Option v-for="(item, index) in reasonDataOptions" :value="index" :key="index">{{item}}</Option>
									</Select>
									<span class="form-item-tip">注意：患者已死亡、患者拒绝随访则终止该患者的所有计划。随访方案重复、方案不匹配、其他则终止该任务所对应的计划。</span>
								</FormItem>
								<FormItem label="详情" prop="cancleRemark">
									<Input v-model="resultForm.cancleRemark" type="textarea" :autosize="{minRows: 2,maxRows: 5}"></Input>
								</FormItem>
							</template>
						</Form>
					</template>
					<!--不可编辑，已终止状态时-->
					<template v-else>
						<Col span="24">
							<span>AI随访审核意见：</span>
							<span>{{allData.visitFollowupRecordVo.vetRemark}}</span>
						</Col>
						<Col span="12">
							<span>终止人：</span>
							<span>{{allData.visitFollowupRecordVo.vetUser}}</span>
						</Col>
						<Col span="12">
							<span>终止时间：</span>
							<span>{{allData.visitFollowupRecordVo.vetDate}}</span>
						</Col>
						<Col span="24">
							<span>终止原因：</span>
							<span>
								{{allData.visitFollowupRecordVo.cancleReasonName}}
							</span>
						</Col>
						<Col span="24">
							<span>终止详情：</span>
							<span>{{allData.visitFollowupRecordVo.cancleRemark}}</span>
						</Col>
						<!--已终止的戳记-->
						<div class="stop-stamp">
							<div class="stop-stamp-wrap">
								<span>已终止</span>
							</div>
						</div>
					</template>
				</p>
			</Panel>
			<Panel name="2">
				记录详情
				<div slot="content">
					<div v-if="allData.visitFollowupRecordVo.mergePath && allData.visitFollowupRecordReplyVos[0]" class="integrated-audio">
						<span>完整录音</span>
						<audio :src="allData.visitFollowupRecordReplyVos[0].aiAudio.split(';')[0]" controls="controls" @play="handleMergeAudio" ref="mergeAudio"></audio>
			        </div>
					<ul class="record">
						<li class="record-li" v-for="(item, index) in allData.visitFollowupRecordReplyVos" :key="index">
							<div class="record-li-left">
								<img src="../../assets/images/doctor.png" alt="认识AI">
								<div class="record-li-left-wrap">
									<span class="record-li-left-wrap-index">{{item.question}}</span>
									<span class="record-li-left-wrap-ques">{{item.questionContent}}</span>
								</div>
							</div>
							<div class="record-li-right">
								<Tag color="error" v-if="item.isNormal == 0">指标异常</Tag>
								<Tag color="warning" v-if="item.fieldValue === '' && item.fieldName">结果未采集</Tag>
								<div class="record-li-right-main">
									<audio :src="item.audio" controls="controls">browser not support</audio>
									<Input v-model="item.asr" :disabled="!canEdit"></Input>
									<ul v-if="item.fieldName">
										<li>
											<label>指标:</label>
											<span>{{item.fieldName}}</span>
										</li>
										<li>
											<label>采集结果:</label>
											<div class="result-wrap">
												<Input v-if="item.targetInfo === 'string'" v-model="item.fieldValue" :disabled="!canEdit"></Input>
												<InputNumber v-else-if="item.targetInfo === 'digit'" :min="1" v-model="item.fieldValue" :disabled="!canEdit"></InputNumber>
												<DatePicker v-else-if="item.targetInfo === 'datetime'" v-model="item.fieldValue" transfer format="yyyy-MM-dd HH:mm" type="datetime" confirm :disabled="!canEdit"></DatePicker>
												<RadioGroup v-else v-model="item.fieldValue" :disabled="!canEdit" class="result-wrap-radio-group" @on-change="handleRadioChange(item)">
													<Radio v-for="opt in item.targetInfo" :label="opt" :key="opt">
														{{opt}}
													</Radio>
												</RadioGroup>
											</div>
										</li>
										<li>
											<label>指标是否正常</label>
											<RadioGroup v-model="item.isNormal" :disabled="!canEdit" class="result-wrap-radio-group">
												<Radio :label="1">是</Radio>
												<Radio :label="0">否</Radio>
											</RadioGroup>
										</li>
									</ul>
								</div>
								<img src="../../assets/images/patient.png" alt="患者">
							</div>
						</li>
					</ul>
				</div>
			</Panel>
		</Collapse>
		<div slot="footer">
			<Button type="primary" @click="handlePost" v-if="canEdit">提交</Button>
			<Button type="primary" @click="isModalShow = false" v-else>返回</Button>
		</div>
	</Modal>
</template>

<script>
export default {
    name: 'followup-record-detail',
    props: {
        id: {
            type: String,
            default: '0'
        }
    },
    data () {
    	return {
            isModalShow: false,
            allData: {
                visitFollowupRecordCall: {},
                visitFollowupRecordReplies: [],
                visitFollowupRecordResults: [],
                visitFollowupRecordVo: {}
            },
            resultForm: {},
            reasonDataOptions: {},
            canEdit: false,
            showArtificialCall: false // 是否展示 人工外呼 那一行的选项
        }
    },
    methods: {
    	toggleModalShow () {
    		this.isModalShow = !this.isModalShow
            if (this.isModalShow) {
    			this.$nextTick(() => {
                    this.getAllInfo()
                })
            }
        },
        /**
		 * @description 获取随访详情数据
		 */
        async getAllInfo () {
            this.$Spin.show()
        	const res = await this.$API.followupRecord.allInfo({ id: this.id })
            // 整理 targetId对应的数据类型
            const typeMapArr = {}
            const thresholdArr = {} // 预警阀值
            const followupTargetOptionVos = res.data.followupTargetOptionVos || []
            followupTargetOptionVos.forEach(item => {
                if (item.optionName === 'select') {
                    if (typeMapArr[item.targetId]) {
                        typeMapArr[item.targetId].push(item.optionValues)
                    } else {
                        typeMapArr[item.targetId] = [item.optionValues]
                    }
					// 预警阀值
                    if (item.thresholdValue) {
						thresholdArr[item.targetId] ? thresholdArr[item.targetId].push(item.optionValues) : thresholdArr[item.targetId] = [item.optionValues]
					}
                } else {
                    typeMapArr[item.targetId] = item.optionName
                }
            })
            // 处理visitFollowupRecordResults数据
            res.data.visitFollowupRecordReplyVos.forEach(item => {
                item.targetInfo = typeMapArr[item.targetId]
				item.thresholdInfo = thresholdArr[item.targetId]
                if (item.targetInfo === 'digit') {
                	item.fieldValue = item.fieldValue - 0 || 0
                }
            })
            const cancelReasonVal = res.data.visitFollowupRecordVo.cancleReason
            if (cancelReasonVal === -1 || cancelReasonVal === '') {
        		this.canEdit = true
            } else {
        		this.canEdit = false
            }
            this.allData = res.data
            this.resultForm = {
                vetRemark: res.data.visitFollowupRecordVo.vetRemark,
                isArtificialCall: res.data.visitFollowupRecordVo.isArtificialCall ? (res.data.visitFollowupRecordVo.isArtificialCall + '') : '0',
                isArtificialUrgent: res.data.visitFollowupRecordVo.isArtificialUrgent != 0,
                cancleReason: res.data.visitFollowupRecordVo.cancleReason + '',
                cancleRemark: res.data.visitFollowupRecordVo.cancleRemark,
                isStop: res.data.visitFollowupRecordVo.cancleRemark === '' ? '0' : '1',
                recordId: res.data.visitFollowupRecordVo.recordId,
                vetUser: sessionStorage.getItem('rsysUserId')
            }
            const cancelReason = this.resultForm.cancleReason
            if (cancelReason === '-1' || cancelReason === '') {
                this.allData.visitFollowupRecordVo.cancleReasonName = '暂无'
                this.resultForm.cancleReason = ''
            } else {
                this.allData.visitFollowupRecordVo.cancleReasonName = this.reasonDataOptions[this.allData.visitFollowupRecordVo.cancleReason]
            }
            // 是否展示 人工外呼 选项块
            const resArti = await this.$API.planManage.planTypeInfo({ id: res.data.visitFollowupRecordVo.followupType })
            this.showArtificialCall = resArti.data.isOutCall === 1
            if (!this.showArtificialCall) {
                this.resultForm.isArtificialCall = '0'
                this.resultForm.isArtificialUrgent = false
            }
            this.$Spin.hide()
        },
        /**
		 * @description 获取 终止原因下拉框数据
		 * @return {Promise<void>}
		 */
        async getReasonData () {
            const res = await this.$API.systemParamManage.list({ limit: 9999, pager: 1, paramTypeCode: 'planStopReasons' })
            res.data.forEach(item => {
                this.reasonDataOptions[item.paramCode] = item.paramName
            })
        },
        /**
		 *@description 切换 终止随访radio
		 */
        handleIsStopFollow (value) {
            if (value === '0') {
                this.resultForm.cancleReason = ''
                this.resultForm.cancleRemark = ''
            } else if (value === '1' && this.showArtificialCall) {
            	this.$Message.warning('终止随访选择“是”时，人工外呼选择必为“否”')
                this.resultForm.isArtificialCall = '0'
                this.resultForm.isArtificialUrgent = false
            }
        },
        /**
		 *@description 提交按钮方法
		 */
        handlePost () {
        	if (this.resultForm.isStop === '1' && this.resultForm.isArtificialCall === '1') {
                this.$Message.warning('终止随访选择“是”时，人工外呼选择必为“否”')
                return false
            }
            this.$refs.stopForm.validate(async (valid) => {
                if (valid) {
                	const cancelReason = this.resultForm.cancleReason
                    if (cancelReason) {
                        const cancelReasonText = this.reasonDataOptions[cancelReason]
                        let contentText = ''
                        if (cancelReason === '1' || cancelReason === '2') {
                            contentText = `您选择的终止原因为’${cancelReasonText}’，将终止该患者的所有随访计划`
                        } else {
                            contentText = `您选择的终止原因为’${cancelReasonText}’，将终止当前随访计划`
                        }
                        this.$Modal.confirm({
                            title: '提交',
                            content: contentText,
                            cancelText: '选错了',
                            onOk: () => {
                                this.postData()
                            }
                        })
                    } else {
                		this.postData()
                    }
                }
            })
        },
        async postData () {
            const postData = JSON.parse(JSON.stringify(this.resultForm))
            postData.isArtificialUrgent = postData.isArtificialUrgent ? 1 : 0
            postData.visitFollowupRecordReplies = this.allData.visitFollowupRecordReplyVos
            // console.log(postData)
            // return false
            await this.$API.followupRecord.recordVet(postData)
            this.$Message.success('提交成功！')
            this.$emit('refresh')
            this.isModalShow = false
        },
        handleIsArtificialCallChange (value) {
        	if (value === '0') {
        		this.resultForm.isArtificialUrgent = false
            }
        },
        /**
		 * @description 完整录音播放，循环详情数组
		 */
        handleMergeAudio () {
        	const audioObj = this.$refs['mergeAudio']
            let currentSrc = audioObj.currentSrc
            const recordsArr = this.allData.visitFollowupRecordReplyVos
            let allAudioSrc = []
            recordsArr.forEach(item => {
                allAudioSrc = allAudioSrc.concat(item.aiAudio.split(';'))
                if (item.audio) {
                    allAudioSrc.push(item.audio)
                }
            })
            let currentIndex = 0
            allAudioSrc.forEach((i, index) => {
                if (currentSrc.indexOf(i) > -1) {
                    currentIndex = index
                }
            })
            let timer = setInterval(() => {
                try {
                    if (audioObj.ended) {
                        if (allAudioSrc[currentIndex + 1]) {
                            this.$refs['mergeAudio'].src = allAudioSrc[currentIndex + 1]
                            currentIndex++
                            audioObj.play()
                        } else {
                            currentIndex = 0
                            audioObj.src = allAudioSrc[0]
                            audioObj.load()
                        }
                    }
                    if (audioObj.paused) {
                        clearInterval(timer)
                    }
                } catch (error) {
                	console.log(error)
                    clearInterval(timer)
                }
            }, 500)
        },
		/**
		 * @description 采集结果  选项改变时，自动改变 指标是否正常
		 */
		handleRadioChange (item) {
			if (item.thresholdInfo.includes(item.fieldValue)) {
				item.isNormal = 0
			} else {
				item.isNormal = 1
			}
		}
    },
    mounted () {
    	this.getReasonData()
    }
}
</script>

<style lang="less">
	.followup-detail-dialog{
		.ivu-modal{
			top: 50px;
		}
		.ivu-collapse-content-box{
			overflow: auto;
			position: relative;
		}
		.ivu-col{
			margin-bottom: 8px;
		}
		.form-item{
			width: 200px;
			position: relative;
			&-tip{
				position: absolute;
				left: 230px;
				top: 7px;
				line-height: 20px;
			}
		}
		.stop-stamp{
			width: 80px;
			height: 80px;
			color: red;
			text-align: center;
			position: absolute;
			right: 20px;
			bottom: 20px;
			border: 2px solid red;
			border-radius: 50%;
			&-wrap{
				width: 70px;
				height: 70px;
				line-height: 70px;
				border: 2px solid red;
				border-radius: 50%;
				position: relative;
				top: 2.5px;
				left: 3px;
				transform: rotate(-30deg);
			}
		}
		.integrated-audio{
			position: relative;
			height: 71px;
			line-height: 55px;
			border-bottom: 1px solid #dcdee2;
			audio {
				position: absolute;
				left: 65px;
			}
		}
		.record{
			margin-top: 8px;
			max-height: 500px;
			overflow-y: auto;
			img{
				height: 45px;
				width: 45px;
			}
			&-li{
				overflow: auto;
				&-left{
					width: 50%;
					margin: 8px 0;
					position: relative;
					img{
						position: absolute;
						top: 0;
					}
					&-wrap{
						width: calc(~"100% - 58px");
						display: inline-block;
						padding: 8px;
						box-sizing: border-box;
						margin-left: 53px;
						background-color: #f7f7f7;
						span{
							display: block;
						}
						&-ques{
							margin-top: 8px;
							color: #999;
						}
					}
				}
				&-right{
					width: 50%;
					float: right;
					position: relative;
					.ivu-tag{
						position: absolute;
						right: 100%;
						bottom: 8px;
						margin: 0;
					}
					.ivu-tag-error{
						width: 65px;
					}
					.ivu-tag-warning{
						width: 77px;
					}
					img{
						position: absolute;
						top: 0;
					}
					&-main{
						width: calc(~"100% - 58px");
						display: inline-block;
						ul{
							margin-top: 4px;
							border: 1px solid #d7d7d7;
							border-bottom-width: 0;
							background-color: #f7f7f7;
							li{
								list-style: none;
								padding: 8px 4px;
								border-bottom: 1px solid #d7d7d7;
								label{
									margin-right: 3px;
								}
								.result-wrap{
									width: calc(~"100% - 62px");
									display: inline-block;
									.ivu-radio{
										margin-right: 0;
									}
								}
								.result-wrap-radio-group {
									label{
										margin-right: 10px;
									}
								}
							}
						}
					}
				}
			}
		}
	}
</style>
