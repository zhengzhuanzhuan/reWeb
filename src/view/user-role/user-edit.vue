<style lang="less">
.user-edit {
  height: 100%;
  .ivu-tabs {
    height: 100%;
    background-color: white;
    padding: 10px 0;
    .ivu-tabs-content {
      height: ~"calc(100% - 52px)";
    }
    .ivu-tabs-tabpane {
      padding: 0 20px;
      max-height: 100%;
      overflow: auto;
    }
    .tabOneContent {
      height: 75vh;
      overflow-y: auto;
    }
    .ivu-tree {
      height: ~"calc(100% - 80px)";
      overflow: auto;
    }
    .base-form {
      .ivu-form-item {
        width: 520px;
        position: relative;
      }
      .user-logo {
        width: 60px;
        height: 60px;
        position: absolute;
        left: 120px;
        top: 0;
      }
    }
    .save-wrapper {
      margin-top: 10px;
      border-top: 1px solid #dcdee2;
      text-align: center;
      .save-btn {
        margin-top: 10px;
      }
    }
    .ivu-tabs-tabpane {
      h3 {
        padding-bottom: 10px;
      }
      .tab-tags-wrapper {
        border-bottom: 1px solid #dcdee2;
        margin-bottom: 15px;
        padding-bottom: 15px;
      }
    }
  }
}
.update-psd-item {
  .ivu-form-item-label:before {
    content: "";
  }
}
</style>
<template>
  <div class="user-edit">
    <Tabs value="1" @on-click="handleTabClick">
      <TabPane label="基本信息" name="1">
        <div class="tabOneContent">
          <Form
            class="base-form"
            ref="baseForm"
            :model="baseInfo"
            :rules="validate.userEdit"
            :label-width="120"
          >
            <FormItem label="用户名" prop="userName">
              <Input v-model.trim="baseInfo.userName"></Input>
            </FormItem>
            <FormItem label="密码" prop="password" v-if="!baseInfo.userId">
              <Input v-model.trim="baseInfo.password"></Input>
            </FormItem>
            <FormItem label="密码" prop="updatePassword" class="update-psd-item" v-else>
              <Input v-model.trim="baseInfo.updatePassword" placeholder="原密码已加密保存，如需修改请输入新密码"></Input>
            </FormItem>
            <FormItem label="真实姓名">
              <Input v-model.trim="baseInfo.realName"></Input>
            </FormItem>
            <FormItem label="联系电话" prop="phone">
              <Input v-model.trim="baseInfo.phone"></Input>
            </FormItem>
            <FormItem label="专属号码" prop="exclusiveNumber">
              <Input v-model.trim="baseInfo.exclusiveNumber"></Input>
            </FormItem>
            <FormItem label="头像">
              <Upload
                action="/temp/posts/"
                :max-size="100"
                :format="['jpg','jpeg','png']"
                :before-upload="handleImgUpload"
                :on-format-error="handleImgFormatError"
              >
                <Button icon="ios-cloud-upload-outline">上传图片</Button>
              </Upload>
              <img :src="baseInfoLogoImg" v-show="baseInfoLogoImg" class="user-logo" />
            </FormItem>
            <FormItem label="职位">
              <Input v-model.trim="baseInfo.position"></Input>
            </FormItem>
            <FormItem label="职称">
              <Input v-model.trim="baseInfo.professionalTitle"></Input>
            </FormItem>
            <FormItem label="简介">
              <Input type="textarea" :autosize="true" v-model.trim="baseInfo.introduce"></Input>
            </FormItem>
            <!-- <FormItem label="主要科室" prop="organizationId">
              <Cascader
                :data="orgOptions"
                change-on-select
                @on-change="handleOrgSelect"
                :value="editOrgArray"
                filterable
              ></Cascader>
            </FormItem> -->
            <FormItem label="主要科室">
              <Cascader
							 @on-change="handleOrgSelect"
							 :data='orgListNumber'
								v-model="editOrgArray"
              ></Cascader>
            </FormItem>
            <!-- <FormItem label="医疗机构" prop="medicalId">
							<Select v-model="baseInfo.medicalId" label-in-value @on-change="handleMedicalSelect">
								<Option v-for="item in medicalOptions" :value="item.id" :key="item.id">{{ item.medicalName }}</Option>
							</Select>
            </FormItem>-->
            <FormItem label="是否禁用">
              <RadioGroup v-model="baseInfo.isLocked">
                <Radio :label="0">启用</Radio>
                <Radio :label="1">禁用</Radio>
              </RadioGroup>
            </FormItem>
          </Form>
          <customize-params ref="customParams" :base-params-array="editCustomParamsArray"></customize-params>
        </div>
        <div class="save-wrapper">
          <Button type="primary" class="save-btn" @click="handleSaveFirst">保存</Button>
        </div>
      </TabPane>
      <TabPane label="角色" name="2">
        <div class="base-form">
          <CheckboxGroup v-model="chosenRoleArray">
            <Checkbox v-for="item in roleArray" :label="item.id" :key="item.id">
              <span>{{item.roleName}}</span>
            </Checkbox>
          </CheckboxGroup>
        </div>
        <div class="save-wrapper">
          <Button type="primary" class="save-btn" @click="handleSave('roleList')">保存</Button>
        </div>
      </TabPane>
      <TabPane label="组织数据权限" name="3">
        <!-- <Tree :data="treeDataTabThree" show-checkbox multiple class="base-form" ref="orgTree"></Tree> -->
        <Tree :data="orgTreeNumner" show-checkbox multiple class="base-form" ref="orgTree"></Tree>
        <div class="save-wrapper">
          <Button type="primary" class="save-btn" @click="handleSave('orgList')">保存</Button>
        </div>
      </TabPane>
      <TabPane label="关联用户数据" name="4">
        <Row class="user_main_search common_search" :gutter="20">
          <Col span="5">
            <span>真实姓名</span>
            <Input v-model="searchParamsTabFour.realName"></Input>
          </Col>
          <Col span="5">
            <span>联系电话</span>
            <Input v-model="searchParamsTabFour.mobile"></Input>
          </Col>
          <Col span="6">
            <span>所属组织</span>
            <!-- <Cascader :data="orgOptions" change-on-select @on-change="handleOrgSelectTabFour"></Cascader> -->
						  <Cascader
							 @on-change="handleOrgSelect"
							 :data='orgListNumber'
								v-model="editOrgArray"
              ></Cascader>
          </Col>
          <Col span="6">
            <span>状态</span>
            <Select v-model="searchParamsTabFour.isRelated">
              <Option value>全部</Option>
              <Option value="1">已关联</Option>
              <Option value="0">未关联</Option>
            </Select>
          </Col>
          <Col span="2">
            <Button @click="handlePage('Four', 1)" type="primary">查询</Button>
          </Col>
        </Row>
        <div class="user_main_list">
          <Table :columns="configFour" :data="tableParamsFour.data" :loading="tableParamsFour.isLoading"></Table>
        </div>
        <Row class="user_main_page">
          <Page
            :total="tableParamsFour.total"
            :page-size="searchParamsTabFour.limit"
            show-total
            :current="searchParamsTabFour.pager"
            @on-change="handlePage('Four', $event)"
          ></Page>
        </Row>
      </TabPane>
      <!-- <TabPane label="方案" name="5">
        <div>
          <h3>已选择方案</h3>
          <div class="tab-tags-wrapper">
            <Tag
              type="border"
              color="primary"
              closable
              v-for="(item, index) in chosenPlanArr"
              :key="item.schemeId"
              @on-close="handleTagDelete(index, 'chosenPlanArr')"
            >{{item.schemeName}}</Tag>
            <Tag type="border" color="warning" v-if="!chosenPlanArr.length">暂无</Tag>
          </div>
        </div>
        <Row class="user_main_search common_search" :gutter="20">
          <Col span="6">
            <span>方案名称</span>
            <Input v-model="searchParamsTabFive.schemeName"></Input>
          </Col>
          <Col span="6">
            <span>所属组织</span>
            <Cascader :data="orgOptions" change-on-select @on-change="handleOrgSelectTabFive"></Cascader>
          </Col>
          <Col span="6">
            <span>疾病类型</span>
            <disease-type-select ref="disSelect" :is-multiple="false"></disease-type-select>
          </Col>
          <Col span="2">
            <Button @click="handlePage('Five', 1)" type="primary">查询</Button>
          </Col>
        </Row>
        <div class="user_main_list">
          <Table
            :columns="configFive"
            :data="tableParamsFive.data"
            :loading="tableParamsFive.isLoading"
          ></Table>
        </div>
        <Row class="user_main_page">
          <Page
            :total="tableParamsFive.total"
            :page-size="searchParamsTabFive.limit"
            show-total
            :current="searchParamsTabFive.pager"
            @on-change="handlePage('Five', $event)"
          ></Page>
        </Row>
        <div class="save-wrapper">
          <Button type="primary" class="save-btn" @click="handleSave('schemeList')">保存</Button>
        </div>
      </TabPane>
      <TabPane label="疾病" name="6">
        <div>
          <h3>已选择疾病</h3>
          <div class="tab-tags-wrapper">
            <Tag
              type="border"
              color="primary"
              closable
              v-for="(item, index) in chosenDiseaseArr"
              :key="item.diseaseId"
              @on-close="handleTagDelete(index, 'chosenDiseaseArr')"
            >{{item.icdName}}</Tag>
            <Tag type="border" color="warning" v-if="!chosenDiseaseArr.length">暂无</Tag>
          </div>
        </div>
        <Row class="user_main_search common_search" :gutter="20">
          <Col span="6">
            <span>类型</span>
            <Select v-model="searchParamsTabSix.typeCode" clearable>
              <Option
                v-for="item in searchTypeOptions"
                :value="item.paramCode"
                :key="item.paramId"
              >{{ item.paramName }}</Option>
            </Select>
          </Col>
          <Col span="6">
            <span>名称</span>
            <Input v-model="searchParamsTabSix.icdName"></Input>
          </Col>
          <Col span="2">
            <Button @click="handlePage('Six', 1)" type="primary">查询</Button>
          </Col>
        </Row>
        <div class="user_main_list">
          <Table
            :columns="configSix"
            :data="tableParamsSix.data"
            :loading="tableParamsSix.isLoading"
          ></Table>
        </div>
        <Row class="user_main_page">
          <Page
            :total="tableParamsSix.total"
            :page-size="searchParamsTabSix.limit"
            show-total
            :current="searchParamsTabSix.pager"
            @on-change="handlePage('Six', $event)"
          ></Page>
        </Row>
        <div class="save-wrapper">
          <Button type="primary" class="save-btn" @click="handleSave('diseaseList')">保存</Button>
        </div>
      </TabPane> -->
    </Tabs>
  </div>
</template>

<script>
import customizeParams from '../common-components/customize-params'
import diseaseTypeSelect from '../common-components/disease-types-select'
import {
  formatToTreeData,
	getCascaderSelectedValue,
	getTree
} from '@/libs/businessUtil'
import { mapActions } from 'vuex'
const LIMIT = 10
export default {
  name: 'user-edit',
  components: {
    customizeParams,
    diseaseTypeSelect
  },
  data () {
    return {
			orgTreeNumner: [],
			orgListNumber: [],
      // tab1 data
      baseInfo: {
        userId: '',
        userName: '',
        password: '',
        updatePassword: '',
        realName: '',
        phone: '',
        exclusiveNumber: '',
        position: '',
        professionalTitle: '',
        introduce: '',
        isLocked: 0,
        organizationId: '',
        orgainzationName: '',
        medicalId: '',
        medicalName: '',
        logo: ''
      },
      baseInfoLogo: null, // file二进制文件
      baseInfoLogoImg: '',
      // medicalOptions: [],
      orgOptions: [],
      orgData: [], // 所以org接口回传的原始数据
      editOrgArray: [],
      editCustomParamsArray: [], // 编辑时传给子组件的自定义添加的字段数组
      // tab2 data
      roleArray: [],
      chosenRoleArray: [],
      treeDataTabThree: [],
      // tab4 data
      searchParamsTabFour: {
        realName: '',
        mobile: '',
        organizationId: '',
        isRelated: '',
        limit: LIMIT,
        pager: 1
      },
      tableParamsFour: {
        data: [],
        total: 0,
        isLoading: false
      },
      configFour: [
        {
          title: '真实姓名',
          key: 'realName'
        },
        {
          title: '联系电话',
          key: 'phone'
        },
        {
          title: '所属组织',
          key: 'orgName'
        },
        {
          title: '操作',
          key: 'action',
          width: 180,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    size: 'small',
                    type: params.row.isRelated == 1 ? 'primary' : 'default'
                  },
                  on: {
                    click: () => {
                      this.handleToggleChoose(params.row)
                    }
                  }
                },
                params.row.isRelated == 1 ? '已关联' : '关联数据'
              )
            ])
          }
        }
      ],
      // tab5 data 方案
      chosenPlanArr: [],
      searchParamsTabFive: {
        schemeName: '',
        organizationId: '',
        diseaseName: '',
        limit: LIMIT,
        pager: 1
      },
      tableParamsFive: {
        data: [],
        total: 0,
        isLoading: false
      },
      configFive: [
        {
          title: '方案名称',
          key: 'schemeName'
        },
        {
          title: '所属组织',
          key: 'organizationName'
        },
        {
          title: '疾病类型',
          key: 'diseaseName'
        },
        {
          title: '操作',
          key: 'action',
          width: 180,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    size: 'small',
                    type: params.row.isChosen ? 'primary' : 'default'
                  },
                  on: {
                    click: () => {
                      if (!params.row.isChosen) {
                        this.tableParamsFive.data[params.index].isChosen = true
                        this.chosenPlanArr.push(params.row)
                      } else {
                        let choseIndex = -1
                        const tableData = this.chosenPlanArr
                        for (let i = 0; i < tableData.length; i++) {
                          if (tableData[i].schemeId === params.row.schemeId) {
                            choseIndex = i
                            break
                          }
                        }
                        this.chosenPlanArr.splice(choseIndex, 1)
                        this.tableParamsFive.data[params.index].isChosen = false
                      }
                    }
                  }
                },
                params.row.isChosen ? '已选择' : '选择'
              )
            ])
          }
        }
      ],
      // tab6 data 疾病
      searchTypeOptions: [], // 类型 选择框的数据
      chosenDiseaseArr: [],
      searchParamsTabSix: {
        icdName: '',
        typeCode: '',
        limit: LIMIT,
        pager: 1
      },
      tableParamsSix: {
        data: [],
        total: 0,
        isLoading: false
      },
      configSix: [
        {
          title: '名称',
          key: 'icdName'
        },
        {
          title: 'ICD',
          key: 'icd'
        },
        {
          title: '类型',
          key: 'typeName'
        },
        {
          title: '操作',
          key: 'action',
          width: 180,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    size: 'small',
                    type: params.row.isChosen ? 'primary' : 'default'
                  },
                  on: {
                    click: () => {
                      if (!params.row.isChosen) {
                        this.tableParamsSix.data[params.index].isChosen = true
                        this.chosenDiseaseArr.push(params.row)
                      } else {
                        let choseIndex = -1
                        const tableData = this.chosenDiseaseArr
                        for (let i = 0; i < tableData.length; i++) {
                          if (tableData[i].diseaseId === params.row.diseaseId) {
                            choseIndex = i
                            break
                          }
                        }
                        this.chosenDiseaseArr.splice(choseIndex, 1)
                        this.tableParamsSix.data[params.index].isChosen = false
                      }
                    }
                  }
                },
                params.row.isChosen ? '已选择' : '选择'
              )
            ])
          }
        }
      ]
    }
  },
  methods: {
    // 组织管理
    async handleOrgTree () {
      const res = await this.$API.organizeManage.newNumberTree({
        pager: 0,
        limit: 99999
			})
			this.orgListNumber = getTree(res.data, 'label')
			this.orgTreeNumner = getTree(res.data, 'title')
    },
    ...mapActions(['setAvator']),
    handleTabClick (name) {
      // if (name !== '1' && !this.baseInfo.userId) {
      //   this.$Message.warning('请先添加用户的基本信息，再完善后续信息！')
      //   return false
      // }
      if (name === '2' && !this.roleArray.length) {
        this.getRoleList()
      } else if (name === '4') {
        this.getTableDataFour()
      } else if (name === '5') {
        this.getTableDataFive()
      } else if (name === '6') {
        this.getTableDataSix()
        this.getDiseaseTypeNameOptions()
      }
    },
    /**
     * @description 编辑时，获取用户所有信息
     */
    async getBaseInfo () {
      const res = await this.$API.userManage.allInfo({
        id: this.baseInfo.userId
      })
      const allTabData = res.data.upmsUser
      // console.log(allTabData)
      // tab1 赋值
      this.baseInfo = allTabData.upmsUser
      this.baseInfoLogoImg = this.baseInfo.logo
      // 添加的字段
      this.editCustomParamsArray = allTabData.upmsFieldDynamicList
      // 处理得到cascader的类型为数组的值
      this.editOrgArray = getCascaderSelectedValue(
        this.orgOptions,
        this.baseInfo.organizationId
      )
      // tab2 赋值
      allTabData.roleList.forEach(item => {
        this.chosenRoleArray.push(item.roleId)
      })
      // tab3 赋值
      const selectedOrgArr = []
      allTabData.organizationList.forEach(item => {
        selectedOrgArr.push(item.organizationId)
        selectedOrgArr.push(item.organizationId)
      })
      this.treeDataTabThree = formatToTreeData({
        baseArr: this.orgData,
        parentIdName: 'parentId',

        idName: 'organizationId',
        sortName: 'sort',
        childrenFn: function (item) {
          return {
            organizationId: item.organizationId,
            title: item.name,
            expand: true,
            children: []
          }
        },
        selectedArray: selectedOrgArr,
        selectJudgeName: 'organizationId'
      })
      // tab5 方案 赋值
      this.chosenPlanArr = allTabData.userSchemeList
      // tab6 疾病 赋值
      allTabData.userDiseaseList.forEach(item => {
        this.chosenDiseaseArr.push({
          icd: item.diseaseCode,
          icdName: item.diseaseName,
          diseaseId: item.diseaseId,
          typeName: item.diseaseTypeName
        })
      })
    },
    // tab1 methods--start
    /**
     * @description tab1 基本信息 所需的动态接口数据--医疗机构，科室信息（组织）
     */
    async getTabOneData () {
      const postData = { pager: 1, limit: 9999 }
      // 1.医疗机构select
      // const medicalData = await this.$API.medicalManage.list(postData)
      // this.medicalOptions = medicalData.data
			// 2.科室select
			// 删除掉的原先的树形数据
      // this.orgOptions = await this.getOrgOptions()
      if (this.baseInfo.userId) {
        this.getBaseInfo()
      }
    },
    /**
     * @description tab1 基本信息 科室信息select data
     */
    async getOrgOptions (parentId = 0) {
      const res = await this.$API.organizeManage.list({
        pager: 1,
        limit: 9999,
        parentId: ''
      })
      this.orgData = res.data
      const resArr = formatToTreeData({
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
      return resArr
    },
    /**
     * @description tab 1 基本信息-选择 主要科室 的处理
     * @param value
     * @param selectData
     */
    handleOrgSelect (value, selectData) {
      if (value.length) {
				const cascaderNumber = selectData[selectData.length - 1]
				this.baseInfo.rootOrgId = cascaderNumber.rootOrgId
				this.baseInfo.conjoinedOrgId = cascaderNumber.conjoinedOrgId
				this.baseInfo.medicalOrgId = cascaderNumber.medicalOrgId
				this.baseInfo.districtOrgId = cascaderNumber.districtOrgId
				this.baseInfo.areaOrgId = cascaderNumber.areaOrgId
				this.baseInfo.orgId = cascaderNumber.value
				this.baseInfo.orgName = cascaderNumber.label
				this.baseInfo.orgType = cascaderNumber.orgType
        // this.baseInfo.organizationId = value[value.length - 1]
        // let orgName = []
        // selectData.forEach(item => {
        //   orgName.push(item.label)
        // })
        // this.baseInfo.orgainzationName = orgName.join('-')
      } else {
        this.baseInfo.orgainzationName = ''
        this.baseInfo.organizationId = ''
      }
    },
    /**
     * @description tab 1 基本信息-选择 医疗机构 的处理
     * @param value
     */
    handleMedicalSelect (value) {
      this.baseInfo.medicalName = value.label
    },
    /** baseInfoLogo
     * @description tab 1 基本信息-上传头像 的处理
     * @param file
     * @return {boolean}
     */
    handleImgUpload (file) {
      // upload 的max-size属性无效
      if (file.size > 1024 * 500) {
        this.$Message.warning('头像文件的大小不能超过500kb，请重新选择图片！')
        return false
      }
      this.baseInfoLogo = file
      // 将文件转成base64预览
      const _this = this
      try {
        let reader = new FileReader()
        reader.onload = function () {
          _this.baseInfoLogoImg = this.result
        }
        reader.readAsDataURL(file)
      } catch (e) {
        console.error(e)
      }
      return false
    },
    /**
     * @description 上传图片 格式错误提醒
     */
    handleImgFormatError () {
      this.$Message.warning(
        '图片文件目前仅支持jpg,jpeg,png格式的图片，请重新选择图片！'
      )
    },
    /**
     * @description tab 1 保存按钮方法
     */
    handleSaveFirst () {
			const childData = this.$refs.customParams.returnData()
			console.log(childData, '图表数据')
      if (!childData) return false
      // 处理子组件块，删除后，由于图片数组的顺序问题，删除只能置为null而不能删掉，因此在此遍历去掉空值，否则上传时数组顺序不对会导致出错
      const resultCustomParamsArray = []
      childData.paramArray.forEach(item => {
        if (item) {
          resultCustomParamsArray.push(item)
        }
      })
      const customParamsFiles = childData.fileArray
      const formData = new FormData()
      // return false
      // 处理  添加字段  块的数据
      for (let i = 0; i < resultCustomParamsArray.length; i++) {
        const item = resultCustomParamsArray[i]
        if (item) {
          if (
            item.value === '' &&
            item.type !== 'image' &&
            item.required === 1
          ) {
            this.$Message.warning('添加的字段值不能为空！')
            return false
          } else {
            // formData.append(
            //   `upmsFieldValueList[${i}].fieldDynamicId`,
            //   item.fieldDynamicId || ''
            // )
            // formData.append(
            //   `upmsFieldValueList[${i}].extendObjectId`,
            //   item.extendObjectId || ''
            // )
            formData.append(`upmsFieldValueList[${i}].fieldId`, item.id)
            formData.append(`upmsFieldValueList[${i}].fieldName`, item.fieldName)
            // formData.append(`upmsFieldValueList[${i}].fieldCode`, item.code)
            // formData.append(`upmsFieldValueList[${i}].fieldSort`, item.sort)
            formData.append(`upmsFieldValueList[${i}].fieldType`, item.type)
            formData.append(
              `upmsFieldValueList[${i}].fieldValue`,
              item.value
            )
          }
        }
      }
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          // upmsUser 块数据formData化
          for (let key in this.baseInfo) {
            // 编辑时，如密码为修改，则password字段传空
            if (key === 'password' && this.baseInfo.userId) {
              formData.append(
                `upmsUserDto.password`,
                this.baseInfo.updatePassword || ''
              )
            } else {
              formData.append(`upmsUserDto.${key}`, this.baseInfo[key])
            }
          }
          formData.append('logoFile', this.baseInfoLogo)
          // 自定义添加的图片
          // for (let file in customParamsFiles) {
          //   formData.append('dynamicImage', customParamsFiles[file])
          // }
          if (!this.baseInfo.userId) {
						// const postRes = await this.$API.userManage.create(formData)
						const postRes = await this.$API.userManage.infoAdd(formData)
            this.baseInfo.userId = postRes.data // 为之后的几个tab存下userId
            this.getBaseInfo()
          } else {
            const postRes = await this.$API.userManage.update(formData)
            if (postRes.data.userId === this.$store.state.user.userId) {
              this.setAvator(postRes.data.logo)
              sessionStorage.setItem('rsysUserAvator', postRes.data.logo)
            }
            this.$Message.success('编辑保存成功！')
          }
        }
      })
    },
    // tab1 methods--end
    // tab2 methods--start
    async getRoleList () {
      // 角色管理
       const res = await this.$API.userManage.upmsRole({ limit: 0, pager: 0 })
      // 用户角色管理
			const userRes = await this.$API.userManage.upmsUserRole({ limit: 0, pager: 0 })
      // console.log(res, '角色管理')
      // console.log(userRes, '用户角色管理')
      this.roleArray = res.data.data
      console.log(this.roleArray, '角色')
    },
    // tab2 methods--end
    // tab 4 关联用户数据-start
    handleOrgSelectTabFour (value, selectData) {
      const userfulData = selectData[selectData.length - 1]
      this.searchParamsTabFour.organizationId = userfulData
        ? userfulData.value
        : ''
    },
    async handleToggleChoose (rowData) {
      console.log(rowData, '关联')
      const postData = {
        // userId: this.baseInfo.userId,
        // userIds: rowData.userId
        userId: rowData.id,
        relationUserId: 2
      }
      // 等于1为已关联
      if (rowData.isRelated == 0) {
        console.log(1)
        // 数据关联
        // postData.relationUserId = 2
        // await this.$API.userManage.updateUserData(postData)
        await this.$API.userManage.upmsUserUserAdd(postData)
        rowData.isRelated = 1
      } else {
        console.log(2)
        // 已关联
        await this.$API.userManage.upmsUserUserDelete(postData)
        rowData.isRelated = 0
      }
    },
    // tab 4 关联用户数据-end
    // tab 5 方案-start
    handleOrgSelectTabFive (value, selectData) {
      const userfulData = selectData[selectData.length - 1]
      this.searchParamsTabFive.organizationId = userfulData
        ? userfulData.value
        : ''
    },
    // tab 5 方案-end
    // tab 6 疾病-start
    async getDiseaseTypeNameOptions () {
      const res = await this.$API.systemParamManage.list({
        limit: 10000,
        pager: 1,
        paramTypeCode: 'followUpType'
      })
      this.searchTypeOptions = res.data
    },
    // tab 6 疾病-end
    // tab 3,5,6公用 保存
    async handleSave (type) {
      if (type === 'roleList') {
        // postData.roleIds = this.chosenRoleArray.join(',')
        // await this.$API.userManage.updateRole(postData)
        // 新角色保存
        let postData = {
          userId: this.baseInfo.userId,
          upmsUserRoleList: this.chosenRoleArray.map(item => ({
            roleId: item
          }))
        }
        await this.$API.userManage.upmsRoleAdd(postData)
      } else if (type === 'orgList') {
        // 该项的allData[]数据无效
				const currentMenuSelected = this.$refs.orgTree.getCheckedNodes()
				// const currentMenuSelected = this.$refs.orgTree.getCheckedAndIndeterminateNodes()
				console.log(currentMenuSelected, '选中和办选的')
        // const resArr = []
      	// currentMenuSelected.forEach(item => {
        //   resArr.push(item.organizationId)
        // })
        // postData.organizationIds = resArr.join(',')
				// await this.$API.userManage.updateOrg(postData)
				const orgData = currentMenuSelected.map(item => ({
					orgType: item.orgType,
					areaOrgId: item.areaOrgId,
					districtOrgId: item.districtOrgId,
					medicalOrgId: item.medicalOrgId,
					conjoinedOrgId: item.conjoinedOrgId,
					rootOrgId: item.rootOrgId,
					orgId: item.value,
					userId: this.baseInfo.userId
				}))
        await this.$API.userManage.addOrg({ upmsUserOrgList: orgData })
      } else if (type === 'schemeList') {
        const resArr = []
        this.chosenPlanArr.forEach(item => {
          resArr.push(item.schemeId)
        })
        await this.$API.userManage.updateScheme({
          userId: this.baseInfo.userId,
          schemeIds: resArr.join(',')
        })
      } else if (type === 'diseaseList') {
        const resArr = []
        this.chosenDiseaseArr.forEach(item => {
          resArr.push(item.diseaseId)
        })
        await this.$API.userManage.updateDisease({
          userId: this.baseInfo.userId,
          diseaseIds: resArr.join(',')
        })
      }
      this.$Message.success('保存成功！')
    },
    handlePage (name, page) {
      this[`searchParamsTab${name}`].pager = page
      this[`getTableData${name}`]()
    },
    getChosenData (array, chosenArray, idName) {
      const resArr = []
      chosenArray.forEach(item => {
        resArr.push(item[idName])
      })
      array.forEach(item => {
        if (resArr.indexOf(item[idName]) !== -1) {
          item.isChosen = true
        } else {
          item.isChosen = false
        }
      })
      return array
    },
    async getTableData (name) {
      const tableName = `tableParams${name}`
      const searchParam = this[`searchParamsTab${name}`]
      this[tableName].isLoading = true
      let res = []
      try {
        if (name === 'Four') {
          searchParam.userId = this.baseInfo.userId
					// res = await this.$API.userManage.userUserList(searchParam)
					res = await this.$API.userManage.relatedUserList(searchParam)
					console.log(res, 'four办表格数据')
        } else if (name === 'Five') {
          const disSelectRes = this.$refs.disSelect.getSelectedData()
          searchParam.diseaseType = disSelectRes.firstData
            ? disSelectRes.firstData.paramId
            : ''
          searchParam.diseaseId = disSelectRes.secondData
            ? disSelectRes.secondData.paramId
            : ''
          res = await this.$API.schemeManage.list(searchParam)
          res.data = this.getChosenData(
            res.data,
            this.chosenPlanArr,
            'schemeId'
          )
        } else if (name === 'Six') {
          res = await this.$API.diseaseManage.list(searchParam)
          res.data = this.getChosenData(
            res.data,
            this.chosenDiseaseArr,
            'diseaseId'
          )
        }
      } catch (e) {
        this[tableName].isLoading = false
      }
      this[tableName].isLoading = false
      this[tableName].data = res.data.data
      this[tableName].total = res.data.total
    },
    getTableDataFour () {
      this.getTableData('Four')
    },
    getTableDataFive () {
      this.getTableData('Five')
    },
    getTableDataSix () {
      this.getTableData('Six')
    },
    handleTagDelete (index, arrName) {
      this[arrName].splice(index, 1)
      if (arrName === 'chosenPlanArr') {
        this.tableParamsFive.data = this.getChosenData(
          this.tableParamsFive.data,
          this.chosenPlanArr,
          'schemeId'
        )
      } else if (arrName === 'chosenDiseaseArr') {
        this.tableParamsSix.data = this.getChosenData(
          this.tableParamsSix.data,
          this.chosenDiseaseArr,
          'diseaseId'
        )
      }
    }
  },
  mounted () {
    this.handleOrgTree()
    this.$refs.baseForm.resetFields()
    this.baseInfo.userId = this.$route.query.userId
    this.getTabOneData()
  }
}
</script>
