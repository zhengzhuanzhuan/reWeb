<template>
	<div class="temporary-followup">
		<Steps :current="currentStep">
			<Step title="选择患者"></Step>
			<Step title="选择方案"></Step>
			<Step title="选择时间"></Step>
		</Steps>
		<Divider />
		<!--1.选择患者-->
		<div v-show="currentStep === 0">
			<Row class="user_main_search common_search" :gutter="20">
				<Col span="6">
					<span>名称</span>
					<Input v-model="patientSearchParams.hzxm"></Input>
				</Col>
				<Col span="6">
					<span>分类</span>
					<disease-type-select ref="disSelect" :is-multiple="false"></disease-type-select>
				</Col>
				<Col span="6">
					<span>所属组织</span>
					<Cascader :data="orgOptions" change-on-select v-model="editOrgArray" filterable></Cascader>
				</Col>
				<Col span="6">
					<span>所属医生</span>
					<Select v-model="patientSearchParams.userId" clearable>
						<Option v-for="item in doctorList" :value="item.userId" :key="item.userId">{{ item.userName }}</Option>
					</Select>
				</Col>
			</Row>
			<Row class="user_main_search common_search" :gutter="20" style="padding-top: 0;">
				<Col span="6">
					<span>导入时间</span>
					<date-time-picker :timeBegin.sync="patientSearchParams.sourceTimeBegin" :timeEnd.sync="patientSearchParams.sourceTimeEnd" :is-default-today="false"></date-time-picker>
				</Col>
				<Col span="6">
					<span>就诊时间</span>
					<date-time-picker :timeBegin.sync="patientSearchParams.orderTimeBegin" :timeEnd.sync="patientSearchParams.orderTimeEnd" :is-default-today="false"></date-time-picker>
				</Col>
				<Col span="6">
					<span>更新时间</span>
					<date-time-picker :timeBegin.sync="patientSearchParams.creatTimeBegin" :timeEnd.sync="patientSearchParams.creatTimeEnd" :is-default-today="false"></date-time-picker>
				</Col>
				<Col span="2">
					<Button @click="handlePatientPage(1)" type="primary" :loading="patientTableParams.isLoading">查询</Button>
				</Col>
			</Row>
			<div>
				<Table :columns="patientTableConfig" :data="patientTableParams.data" :loading="patientTableParams.isLoading" class="table"></Table>
			</div>
			<Row>
				<Col span="12" class="margin-top-20">
					<Button class="margin-right-20" :disabled="!patientTableParams.data.length" @click="handleAddCurrentPage">添加当前页</Button>
					<Button class="margin-right-20" :disabled="!patientTableParams.total" @click="handleChooseAll">添加所有页</Button>
					<Button class="margin-right-20" @click="showImport=true">批量选择</Button>
					<Button type="primary" @click="showChosenTable=true">已选中（{{chosenTableData.length}}人）</Button>
				</Col>
				<Page :total="patientTableParams.total" :page-size="patientSearchParams.limit" show-total :current="patientSearchParams.pager" @on-change="handlePatientPage"></Page>
			</Row>
		</div>
		<!--2.选择方案-->
		<div v-show="currentStep === 1">
			<h2>选择方案</h2>
			<Row class="user_main_search common_search">
				<Col span="24">
					<span>数据归属</span>
					<Select v-model="userSelectData">
						<Option v-for="(item, index) in userSelectOptions" :value="item.value" :key="index">{{ item.label }}</Option>
					</Select>
				</Col>
			</Row>
			<Divider />
			<Row class="user_main_search common_search" :gutter="20">
				<Col span="5">
					<span>计划类型</span>
					<Select v-model="schemeSearchParams.activeTypes" clearable>
						<Option v-for="item in followupTypeOptions" :value="item.activeId" :key="item.activeId">{{ item.activeName }}</Option>
					</Select>
				</Col>
				<Col span="5">
					<span>方案名称</span>
					<Input v-model="schemeSearchParams.schemeName"></Input>
				</Col>
				<Col span="2">
					<Button type="primary" @click="handleSchemePage(1)">查询</Button>
				</Col>
			</Row>
			<Table :columns="schemeConfig" :data="schemeTableParams.data" :loading="schemeTableParams.isLoading"></Table>
			<Page style="margin-bottom: 16px;" :total="schemeTableParams.total" :page-size="schemeSearchParams.limit" show-total :current="schemeSearchParams.pager" @on-change="handleSchemePage"></Page>
		</div>
		<!--3.选择时间-->
		<div v-show="currentStep === 2">
			<h2 class="margin-bottom-18">填写随访信息</h2>
			<Form :label-width="80" style="width: 60vw">
				<FormItem v-for="(item, index) in followupVariables" :label="item.extendName" required :key="index">
					<Input v-model="item.value"></Input>
				</FormItem>
			</Form>
			<Divider />
			<h2 class="margin-bottom-18">选择通知时间</h2>
			<div>
				<span class="margin-right-10">通知时间</span>
				<DatePicker type="datetime" v-model="noticeTime" format="yyyy-MM-dd HH:mm:ss"></DatePicker>
				<span class="margin-left-10">未选择时间时，系统将马上执行计划</span>
			</div>
		</div>
		<Divider />
		<div class="text-center">
			<Button v-if="currentStep!==0" @click="handleBackStep" class="margin-right-20">上一步</Button>
			<Button v-if="currentStep===0" type="primary" @click="currentStep++" :disabled="!chosenTableData.length && !isAddAll">下一步</Button>
			<Button v-if="currentStep===1" type="primary" @click="currentStep++" :disabled="!chosenSchemeId">下一步</Button>
			<Button v-if="currentStep===2" type="primary" @click="handlePost">发起计划</Button>
		</div>
		<!--已选中患者弹框-->
		<Drawer
			title="已选中患者"
			v-model="showChosenTable"
			width="60"
			:mask-closable="false"
		>
			<span>已选中{{chosenTableData.length}}人</span>
			<Table :columns="configChosen" :data="chosenTableData"></Table>
		</Drawer>
		<!--批量选择-导入患者-->
		<Modal
			v-model="showImport"
			title="选择导入的组织"
			:mask-closable="false"
			>
			<span>所属组织</span>
			<Cascader :data="orgOptionsWithName" change-on-select v-model="editOrgArrayModal" filterable class="modal-cascader"></Cascader>
			<span>导入文件</span>
			<Upload
				action="/posts/"
				class="margin-top-10 margin-bottom-10 modal-cascader"
				:format="['xls','xlsx']"
				:before-upload="handleFileUpload"
				:on-format-error="handleFileFormatError"
			>
				<Button icon="ios-cloud-upload-outline">选择文件</Button>
				<span v-if="patientFile" class="margin-left-10">{{patientFile.name}}</span>
			</Upload>
			<div slot="footer">
				<Button type="primary" @click="postFile">批量导入</Button>
			</div>
		</Modal>
	</div>
</template>

<script>
import { parseTime } from '@/libs/tools.js'
import diseaseTypeSelect from '../common-components/disease-types-select'
import dateTimePicker from '../common-components/date-time-picker'
import { formatToTreeData } from '@/libs/businessUtil'
export default {
    name: 'temporaryFollowup',
    components: {
        diseaseTypeSelect,
        dateTimePicker
    },
    data () {
    	return {
    		currentStep: 0,
            patientSearchParams: {
                hzxm: '',
                icd: '',
                orgId: '',
                userId: '', // 医生id
                sourceTimeBegin: '',
                sourceTimeEnd: '',
                orderTimeBegin: '',
                orderTimeEnd: '',
                creatTimeBegin: '',
                creatTimeEnd: '',
                typeCode: '',
                pager: 1,
                limit: 10
            },
            orgOptions: [],
            editOrgArray: [],
            doctorList: [],
            patientTableParams: {
    			isLoading: false,
                data: [],
                total: 0
            },
            patientTableConfig: [
                {
                    title: '姓名',
                    key: 'hzxm'
                },
                {
                    title: '联系电话',
                    key: 'jtdh'
                },
                {
                    title: '组织',
                    key: 'organizationName'
                },
                {
                    title: '医生',
                    key: 'userName'
                },
                {
                    title: '分类',
                    key: 'icdName'
                },
                {
                    title: '导入时间',
                    key: 'sourceTime'
                },
                {
                    title: '就诊时间',
                    key: 'orderTime'
                },
                {
                    title: '更新时间',
                    key: 'createTime'
                },
                {
                    title: '操作',
                    key: 'action',
                    width: 100,
                    align: 'center',
                    render: (h, params) => {
                        return h('div', [
                            h(
                                'Button',
                                {
                                    props: {
                                        size: 'small',
                                        type: params.row.isChosen ? 'default' : 'primary',
                                        disabled: params.row.isChosen
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.handleAdd(params.row, params.index)
                                        }
                                    }
                                },
                                params.row.isChosen ? '已添加' : '添加'
                            )
                        ])
                    }
                }
            ],
            configChosen: [
                {
                    title: '姓名',
                    key: 'hzxm'
                },
                {
                    title: '联系电话',
                    key: 'jtdh'
                },
                {
                    title: '分类',
                    key: 'icdName'
                },
                {
                    title: '操作',
                    key: 'action',
                    width: 100,
                    align: 'center',
                    render: (h, params) => {
                        return h('div', [
                            h(
                                'Button',
                                {
                                    props: {
                                        size: 'small',
                                        type: 'primary'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.handleRemove(params.row.patientId, params.index)
                                        }
                                    }
                                },
                                '移除'
                            )
                        ])
                    }
                }
            ],
            chosenTableData: [],
            showChosenTable: false,
            isAddAll: false, // 是否 点击了 添加所有页
            // step2 data
            userSelectOptions: [], // 数据归属
            userSelectData: '',
            followupTypeOptions: [], // 计划类型options
            chosenSchemeId: '',
            chosenSchemeObj: {},
            schemeSearchParams: {
                schemeName: '',
                activeTypes: '',
                pager: 1,
                limit: 10
            },
            schemeTableParams: {
                isLoading: false,
                data: [],
                total: 0
            },
            schemeConfig: [
                {
                    title: '方案名称',
                    key: 'schemeName'
                },
                {
                    title: '计划类型',
                    key: 'activeTypeName'
                },
                {
                    title: '操作',
                    key: 'action',
                    width: 100,
                    align: 'center',
                    render: (h, params) => {
                        return h('div', [
                            h(
                                'Button',
                                {
                                    props: {
                                        size: 'small',
                                        type: params.row.schemeId === this.chosenSchemeId ? 'default' : 'primary',
                                        disabled: params.row.schemeId === this.chosenSchemeId
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                        	this.chosenSchemeId = params.row.schemeId
                                            this.chosenSchemeObj = params.row
                                            this.getSchemeVariables()
                                            this.currentStep++
                                        }
                                    }
                                },
                                params.row.schemeId === this.chosenSchemeId ? '已选择' : '选择'
                            )
                        ])
                    }
                }
            ],
            // step3 data
            followupVariables: [],
            noticeTime: '',
            showImport: false,
            editOrgArrayModal: [],
            patientFile: null,
            orgOptionsWithName: [],
            allActiveTypes: ''
        }
    },
    methods: {
    	/**
		 * @description 获取搜索块及其他select 数据
		 */
    	async getSearchParamsData () {
    		// 第一步
    		// 所属医生
            const resDoctor = await this.$API.userManage.userUserList({ userId: sessionStorage.getItem('rsysUserId'), limit: 10000 })
            this.doctorList = resDoctor.data.filter(item => item.isRelation === 1)
            // 组织select
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
            this.orgOptionsWithName = formatToTreeData({
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
            // 第二步
            // 数据归属选择
            const users = await this.$API.followupTemporary.userList({ userName: sessionStorage.getItem('rsysUserName') })
            users.data.forEach(item => {
                const roleIdsArr = []
                const roleNameArr = []
                item.roleList.forEach(role => {
                    roleIdsArr.push(role.roleId)
                    roleNameArr.push(role.roleName)
                })
                this.userSelectOptions.push({
                    label: `${item.upmsUser.realName}(${roleNameArr.join(',')})`,
                    value: roleIdsArr.join(',')
                })
                if (item.upmsUser.userName === sessionStorage.getItem('rsysUserName')) {
                	this.userSelectData = roleIdsArr.join(',')
                }
            })
        },
        /**
		 * @description 查询患者列表
		 */
        async handlePatientQuery () {
        	this.patientTableParams.isLoading = true
            if (this.editOrgArray.length) {
                this.patientSearchParams.orgId = this.editOrgArray[this.editOrgArray.length - 1]
            } else {
                this.patientSearchParams.orgId = ''
            }
            const disSelectRes = this.$refs.disSelect.getSelectedData()
            this.patientSearchParams.typeCode = disSelectRes.firstData ? disSelectRes.firstData.paramCode : ''
            this.patientSearchParams.icd = disSelectRes.secondData ? disSelectRes.secondData.icd : ''
            const res = await this.$API.followupTemporary.temporaryPatient(this.patientSearchParams).catch(e => {
                this.patientTableParams.isLoading = false
            })
            this.patientTableParams.data = res.data
            this.patientTableParams.total = res.total
            this.formatPatientTableData()
            this.patientTableParams.isLoading = false
        },
        handlePatientPage (page) {
        	this.patientSearchParams.pager = page
            this.handlePatientQuery()
        },
        /**
		 * @description 表格按钮方法 --添加
		 * @param rowData
		 * @param index
		 */
        handleAdd (rowData, index) {
            let copyData = JSON.parse(JSON.stringify(rowData))
            copyData.isChosen = true
            this.patientTableParams.data.splice(index, 1, copyData)
            this.chosenTableData.push(copyData)
            this.formatPatientTableData()
        },
        /**
		 * @description 处理 列表中患者id重复的情况
		 */
        formatPatientTableData () {
            const idParamName = 'patientId'
            const chosenParamName = 'isChosen'
            for (let item of this.patientTableParams.data) {
                for (let ite of this.chosenTableData) {
                    if (item[idParamName] === ite[idParamName]) {
                        item[chosenParamName] = true
                    }
                }
            }
        },
        /**
		 * @description 添加当前页
		 */
        handleAddCurrentPage () {
            this.patientTableParams.data.forEach((item, index) => {
                if (!item.isChosen) {
                    this.handleAdd(item, index)
                }
            })
        },
        /**
		 * @description 返回上一步
		 */
        handleBackStep () {
            if (this.currentStep === 1) {
                this.isAddAll = false
            }
            this.currentStep--
        },
        /**
		 * @description 添加所有页
		 */
        handleChooseAll () {
            this.isAddAll = true
            this.currentStep++
        },
        /**
		 * @description 选中draswer中的移除按钮
		 */
        handleRemove (id, index) {
            this.chosenTableData.splice(index, 1)
            this.patientTableParams.data.forEach((item, itemIndex) => {
                if (item.patientId === id) {
                    item.isChosen = false
                    this.$set(this.patientTableParams.data, itemIndex, item)
                }
            })
        },
        // 第二步
        /**
		 * @description 根据角色获取计划类型下拉框数据
		 */
        async getActiveList (roleIds) {
            const res = await this.$API.followupTemporary.activeList({ roleIds: roleIds })
            this.followupTypeOptions = res.data
            let activeIds = []
            res.data.forEach(item => {
                activeIds.push(item.activeId)
            })
            this.allActiveTypes = activeIds.join(',')

            this.handleSchemeList()
        },
        /**
		 * @description 方案列表
		 */
        async handleSchemeList () {
            if (!this.schemeSearchParams.activeTypes) {
                this.schemeSearchParams.activeTypes = this.allActiveTypes
            }
            if (!this.schemeSearchParams.activeTypes) { // 不传会查出所以的方案
        		return false
            }
            this.schemeTableParams.isLoading = true
            const res = await this.$API.schemeManage.list(this.schemeSearchParams).catch(e => {
                this.schemeTableParams.isLoading = false
            })
            this.schemeTableParams.data = res.data
            this.schemeTableParams.total = res.total
            this.schemeTableParams.isLoading = false
        },
        handleSchemePage (page) {
            this.schemeSearchParams.pager = page
            this.handleSchemeList()
        },
        // step 3
        /**
		 * @description 获取 随访信息 块
		 */
        async getSchemeVariables () {
            const res = await this.$API.followupTemporary.listById({ schemeId: this.chosenSchemeId })
            this.followupVariables = res.data
        },
        /**
		 * @description 发起计划
		 */
        async handlePost () {
        	let postData = {}
        	const followupInfo = {}
        	followupInfo.schemeId = this.chosenSchemeId
            followupInfo.schemeName = this.chosenSchemeObj.schemeName
            followupInfo.followupType = this.chosenSchemeObj.activeType
            followupInfo.followupTypeName = this.chosenSchemeObj.activeTypeName
        	let validate = true
        	this.followupVariables.forEach(item => {
        		followupInfo[item.extendField] = item.value
        		if (!item.value) {
        			validate = false
                }
            })
            if (!validate) {
        		this.$Message.warning('随访信息的每一项都不能为空！')
                return false
            }
            if (!this.isAddAll) {
        		const patientIds = []
                this.chosenTableData.forEach(item => {
                    // 传到接口的id是patientDiagnoseId，判断 是否已添加  是根据patientId
                    patientIds.push(item.patientDiagnoseId)
                })
                postData.patientDiagnoseIds = patientIds
                postData.isAll = 0
            } else {
        		postData.isAll = 1
                postData = Object.assign(postData, this.patientSearchParams)
            }
            postData.followupDate = this.noticeTime ? parseTime(this.noticeTime) : ''
            postData.followupInfo = followupInfo
            // console.log(postData)
            // return false
            await this.$API.followupTemporary.add(postData)
            this.$router.push({
                path: '/planManage/planList'
            })
        },
        // 导入患者弹框
        /**
		 * @description 上传文件 格式错误提醒
		 */
        handleFileFormatError () {
            this.$Message.warning('请上传 .xls , .xlsx 类型的文件！')
        },
        handleFileUpload (file) {
        	this.patientFile = file
            return false
        },
        async postFile () {
            const formData = new FormData()
        	const orgArr = this.editOrgArrayModal
        	if (!orgArr.length) {
                this.$Message.warning('请选择组织后再导入！')
                return false
            }
            if (!this.patientFile) {
            	this.$Message.warning('请先选择文件！')
                return false
            }
            const orgArrRes = orgArr[orgArr.length - 1].split('_')
            formData.append('upfile', this.patientFile)
            formData.append('orgId', orgArrRes[0])
            formData.append('orgName', orgArrRes[1])
            const res = await this.$API.patientManage.patientImport(formData)
            const succArr = res.data.successList
            if (succArr.length) {
            	this.chosenTableData.push(...succArr)
            }
            this.$Message.success(`导入成功！成功条数：${res.data.successNum}, 失败条数：${res.data.errornum}`)
            this.showImport = false
            this.editOrgArrayModal = []
            this.patientFile = null
            if (res.data.successNum !== 0) {
            	this.handlePatientPage(1)
            }
        }
    },
    watch: {
        userSelectData (val) {
            if (val) {
                this.getActiveList(val)
            }
        }
    },
    mounted () {
    	this.getSearchParamsData()
        this.handlePatientQuery()
    }
}
</script>

<style lang="less">
	.temporary-followup{
		height: 100%;
		background-color: white;
		overflow-x: hidden;
		padding: 8px;
		.ivu-steps{
			padding: 15px 0 15px 0;
			background-color: white;
			margin-left: 14%;
		}
		.ivu-divider-horizontal{
			height: 2px;
			margin: 8px 0;
		}
		.margin-bottom-18{
			margin-bottom: 18px;
		}
	}
	.modal-cascader{
		display: inline-block;
		margin-left: 8px;
		width: ~"calc(100% - 64px)"
	}
</style>
