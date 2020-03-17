<template>
    <div class='patient'>
			<div class="manSearch">
				<div>
					<span>患者姓名</span>
					<Input v-model="formData.hzxm"  placeholder="请输入患者姓名" style="width: 200px"/>
				</div>
				<div>
					<span>联系电话</span>
					<Input v-model="formData.jtdh"  placeholder="请输入联系电话"  style="width: 200px"/>
				</div>
				<div>
					<span>患者状态</span>
					<Select v-model="formData.status"  style="width: 200px" clearable>
						<Option value="0">正常</Option>
						<Option value="1">死亡</Option>
						<Option value="2">不需要回访</Option>
						<Option value="3">住院</Option>
						<Option value="4">门诊</Option>
					</Select>
				</div>
				<Button type="primary" style="margin: 0 20px" @click='handlePage(1)' v-permission="this.$API.patientManage.patientList">查询</Button>
				<Button type="primary" style='marginRight: 20px' @click="handleAddEdit('','add')" :disabled="btnDisable"  v-permission="this.$API.patientManage.patientAdd">新增</Button>
        <Button type="primary" @click='exportModal= true' :disabled="btnDisable" style="marginRight: 20px" v-permission="this.$API.patientManage.patientImport">批量导入</Button>
        <p @click="handleDownLoad" style='cursor: pointer' v-permission="this.$API.patientManage.patientDownLoad">下载Excel模版</p>
			</div>
      <div class="content">
		    <organization-shrink @chosen="selectTree" :orgScroll='true'></organization-shrink>
        <div class="contentRight">
          <Table :columns="columnsData" :data="tableData"/>
           <Page
              :total="pageData.total"
              :page-size="pageData.pageSize"
              show-total
              show-sizer
              :current="pageData.current"
              @on-page-size-change='handlePageSize'
              @on-change='handlePage'
              style="float: right"/>
        </div>
      </div>
      <!-- 患者详情 -->
      <Drawer
        v-model="detailModel"
        title="患者信息"
        :closable="true"
        width= '500'
        >
        <div>
          <div class='patientMesTitle'>
            <p class='titleP1'>{{baseInfo.hzxm}}</p>
            <p style='marginTop: 3px'>{{`${baseInfo.hzxb=='1'?'男':'女' || '--'}/${ baseInfo.age}`}}</p>
          </div>
          <div class='patientMes'>
            <div style='width: 230px'>
              <p style='marginBottom: 10px'>身份证号: {{baseInfo.sfzh || '--'}}</p>
              <p>联系方式:{{ baseInfo.jtdh || '--'}}</p>
            </div>
            <div>
              <p style='marginBottom: 10px'>出生年月: {{(baseInfo.csny && baseInfo.csny.slice(0,10)) || '--'}}</p>
              <p>地址: {{ baseInfo.csd}}</p>
            </div>
          </div>
          <Tabs>
            <TabPane label="门诊" >
              <div class="outPatient" v-for='(item, index) in outPatientInfo' :key='index'>
                <p class="outTit">第{{index + 1}}次门诊</p>
                <div class="outTotal">
                  <div style='width: 230px'>
                    <p>就诊卡号: {{item && item.jzkh}}</p>
                    <p>就诊时间: {{item && item.jzsj}}</p>
                    <p>科室: {{item && item.ksmc}}</p>
                  </div>
                  <div>
                    <p>患者性质: {{item && hzxzNum[item.hzxz]}}</p>
                    <p>就诊医生: {{item && item.ysmc}}</p>
                    <p>疾病诊断: {{item && item.icdName}}</p>
                  </div>
                </div>
              </div>
            </TabPane>
            <TabPane label="住院">
              <div class="hospitaliza" v-for='(item, index) in hospitalInfo' :key='index'>
                <p class='hos_tit'>第{{index + 1}}次住院</p>
                <div>
                  <P class="hos_left">住院号: {{item && item.zyhm}}</P>
                  <P>患者性质: {{item && hzxzNum[item.hzxz]}}</P>
                </div>
                <div>
                  <P class="hos_left">入院时间:{{item && item.ryrq}}</P>
                  <P>出院时间: {{item && item.cysj}}</P>
                </div>
                <div>
                  <P class="hos_left">入院科室:{{item && item.ksmc}}</P>
                  <P>主治医生: {{item && item.ysmc}}</P>
                </div>
                <p>入院诊断: {{item && item.ryzd}}</p>
                <p>出院诊断: {{item && item.cyzd}}</p>
                <p>入院情况: {{item && item.ryqk}}</p>
                <p>出院情况: {{item && item.cyqk}}</p>
              </div>
            </TabPane>
          </Tabs>
        </div>
      </Drawer>
      <!-- 新增编辑 -->
      <Drawer
        v-model="editModel"
        :title="drawerType ==='add' ? '新增患者': '编辑患者'"
        :closable="true"
        width= '600'
        @on-close="resetForm"
        >
        <Form :model="formRight" label-position="right" :label-width="100" :rules="validate.patientValidate"  ref="form">
          <FormItem label="姓名" prop="hzxm">
            <Input v-model="formRight.hzxm" placeholder="请输入患者姓名"></Input>
          </FormItem>
          <FormItem label="患者状态" prop="status">
            <Select v-model="formRight.status" placeholder="请选择患者状态" clearable>
              <Option :value="0">正常</Option>
              <Option :value="1">死亡</Option>
              <Option :value="2">不需要回访</Option>
              <Option :value="3">住院</Option>
              <Option :value="4">门诊</Option>
            </Select>
          </FormItem>
          <FormItem label="性别" prop="hzxb">
            <Select v-model="formRight.hzxb" placeholder="请选择性别" clearable>
              <Option :value="1">男</Option>
              <Option :value="2">女</Option>
              <Option :value="3">其他</Option>
            </Select>
          </FormItem>
          <FormItem label="联系电话" prop="lxdh">
            <Input v-model="formRight.jtdh" placeholder="请输入联系电话"></Input>
          </FormItem>
          <FormItem label="民族" prop="hzmz">
            <Input v-model="formRight.hzmz" placeholder="请输入民族"></Input>
          </FormItem>
          <FormItem label="地址" prop="csd">
            <Input v-model="formRight.csd" placeholder="请输入地址"></Input>
          </FormItem>
          <FormItem label="身份证号"  prop="sfzh">
            <Input v-model="formRight.sfzh" placeholder="请输入身份证号"></Input>
          </FormItem>
          <FormItem label="单位" prop="dwmc">
            <Input v-model="formRight.dwmc" placeholder="请输入单位"></Input>
          </FormItem>
          <FormItem label="出生年月" prop="csny">
            <DatePicker type="date" placeholder="请选择出生年月" format='yyyy-MM-dd' @on-change='handleGetTime' :value='formRight.csny'/>
          </FormItem>
          <FormItem label="紧急联系人" prop="lxr">
            <Input v-model="formRight.lxr" placeholder="请输入紧急联系人"></Input>
          </FormItem>
          <FormItem label="与联系人关系" prop="lxrgx">
            <Input v-model="formRight.lxrgx" placeholder="请输入与紧急联系人关系"></Input>
          </FormItem>
          <FormItem label="联系人地址" prop="lxdz">
            <Input v-model="formRight.lxdz" placeholder="请输入紧急联系人地址"></Input>
          </FormItem>
          <FormItem label="联系人电话" prop="jtdh">
            <Input v-model="formRight.lxdh" placeholder="请输入紧急联系人电话"></Input>
          </FormItem>
        </Form>
        <div style="text-align: center">
           <Button type="primary" @click="handleSave" >保存</Button>
        </div>
      </Drawer>
      <!-- 批量导入 -->
      <Modal v-model="exportModal"
        title="批量导入患者"
        width="360">
        <p style="marginBottom: 10px">所属组织为<strong>{{this.orgName}}</strong></p>
        <span>导入文件</span>
        <Upload
          action="/posts/"
          class="margin-top-10 margin-bottom-10 modal-cascader"
          :format="['xlsx','xls']"
          accept=".xlsx,.xls"
          :before-upload="handleFileUpload"
          :on-format-error="handleFormatError">
          <Button icon="ios-cloud-upload-outline">选择文件</Button>
          <span v-if="patientFile" class="margin-left-10">{{patientFile.name}}</span>
        </Upload>
        <div slot="footer">
          <Button type="primary" @click="postFile">批量导入</Button>
        </div>
      </Modal>
      <!-- 删除患者之前 -->
      <Modal
        v-model="deleteModal"
        title="选择移除组织">
        <p style="fontSize: 16px">选择需要移除该患者的组织</p>
        <div style="margin-bottom:6px;">
          <Checkbox
            :indeterminate="indeterminate"
            :value="checkAll"
            @click.prevent.native="handleCheckAll"
            >全选</Checkbox>
        </div>
        <div style="display:flex">
          <CheckboxGroup
            v-model="checkAllGroup"
            v-for='(item, index) in deleteListNum'
            :key='index'
            @on-change="checkAllGroupChange">
            <Checkbox :label="item.organizationId">{{item.organizationName}}</Checkbox>
          </CheckboxGroup>
        </div>
        <div slot="footer">
            <Button type="primary" size="large" long @click="handleDeleteOk" :disabled='!checkAllGroup.length'>确定</Button>
        </div>
      </Modal>
  </div>
</template>
<script>
import organizationShrink from '../common-components/organization-shrink'
// import { formatToTreeData } from '@/libs/businessUtil'
export default {
  name: 'patient-manage',
	components: {
    organizationShrink
  },
  data () {
    return {
      deleteOrgId: [],
      indeterminate: true,
      checkAll: false,
      checkAllGroup: [],
      deleteListNum: [],
      deleteModal: false,
      patientFile: null,
      btnDisable: true,
      exportModal: false,
      hzxzNum: {
        1: '医保',
        2: '非医保'
      },
      orgId: '',
      orgName: '',
      drawerType: 'add',
      editModel: false,
      detailModel: false,
      pageData: {
        total: 100,
        pageSize: 10,
        current: 1
      },
      columnsData: [
        {
          title: '患者姓名',
          key: 'hzxm'
        },
        {
          title: '身份证号',
          key: 'sfzh'
        },
        {
          title: '性别',
          key: 'hzxb',
          render: (h, params) => {
            let text = ''
            switch (params.row.hzxb) {
              case 1:
                text = '男'
                break
              case 2:
                text = '女'
                break
              default:
                text = '其他'
            }
            return h('div', {
            }, text)
          }
        },
        {
          title: '联系电话',
          key: 'jtdh'
        },
        {
          title: '出生年月',
          key: 'csny',
          render: (h, params) => {
            return h('div', params.row.csny && params.row.csny.slice(0, 10))
          }
        },
        {
          title: '患者状态',
          key: 'status',
          render: (h, params) => {
            let text = ''
            switch (params.row.status) {
              case 0:
                text = '正常'
                break
              case 1:
                text = '死亡'
                break
              case 2:
                text = '不需要回访'
                break
              case 3:
                text = '住院'
                break
              default:
                text = '门诊'
            }
            return h('div', {
            }, text)
          }
        },
        {
          title: '操作',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'text',
                  size: 'small'
                },
                directives: [
                  {
                    name: 'permission',
                    value: this.$API.patientManage.patientUpdate
                  }
                ],
                on: {
                  click: () => {
                    this.handleAddEdit(params.row, 'edit')
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
                  margin: '0 5px'
                },
                directives: [
                  {
                    name: 'permission',
                    value: this.$API.patientManage.patientDetail
                  }
                ],
                on: {
                  click: () => {
                    this.handleDetail(params.row.id)
                  }
                }
              },
              '详情'
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
                    value: this.$API.patientManage.patientDelete
                  }
                ],
                on: {
                  click: () => {
                    this.handleDelete(params.row.id)
                  }
                }
              }, '移除')
            ])
          }
        }
      ],
      tableData: [],
      formData: {
        hzxm: null,
        lxdh: null,
        status: null
      },
      formRight: {
        hzxm: null,
        status: null,
        hzxb: null,
        jtdh: null,
        hzmz: null,
        csd: null,
        sfzh: null,
        dwmc: null,
        csny: null,
        lxr: null,
        lxrgx: null,
        lxdz: null,
        lxdh: null
      },
      baseInfo: {},
      hospitalInfo: [],
      outPatientInfo: []
    }
  },
  methods: {
    handleCheckAll () {
      if (this.indeterminate) {
        this.checkAll = false
      } else {
        this.checkAll = !this.checkAll
      }
      this.indeterminate = false
      if (this.checkAll) {
        this.deleteListNum.forEach(e => {
          this.checkAllGroup.push(e.organizationId)
          this.deleteOrgId.push(e.organizationId)
        })
      } else {
        this.checkAllGroup = []
      }
    },
    checkAllGroupChange (data) {
      this.deleteOrgId = data
      if (data.length === this.deleteListNum.length) {
        this.indeterminate = false
        this.checkAll = true
      } else if (data.length > 0) {
        this.indeterminate = true
        this.checkAll = false
      } else {
        this.indeterminate = false
        this.checkAll = false
      }
    },
    handleGetTime (data) {
      this.formRight.csny = data
    },
    handleDownLoad () {
      window.open('/manage/visitPatientInfo/patientModel')
    },
    // 当前页，每页条数
    handlePage (pager) {
      this.pageData.current = pager
      this.patientList({ pager })
    },
    handlePageSize (num) {
      this.pageData.pageSize = num
      this.patientList({ limit: num })
    },

    handleAddEdit (rowData, type) {
      let rowDate = rowData ||　this.formRight
      this.formRight = JSON.parse(JSON.stringify(rowDate))
      this.drawerType = type
      this.editModel = true
    },
    async handleDelete (id) {
      this.checkAllGroup = []
      this.indeterminate = true
      this.deleteId = id
      const res = await this.$API.patientManage.patientDeleteList({
        patientId: id,
        userId: sessionStorage.getItem('rsysUserId')
      })
      this.deleteListNum = res.data
      this.deleteModal = true
    },
    handleDeleteOk () {
      this.deleteModal = false
      const content = "<p style='fontSize: 16px;marginBottom: 10px'>是否确定删除患者？</p><p  style='color: red'>若删除患者，其相关就诊记录、随访记录删除</p>"
      this.$Modal.confirm({
        title: '删除提示',
        content: content,
        onOk: async () => {
          const res = await this.$API.patientManage.patientDelete({
            organizationIds: this.deleteOrgId,
            patientId: this.deleteId
          })
          this.$Message.success('该患者已删除')
          this.patientList()
        }
      })
    },
    async handleDetail (id) {
      this.detailModel = true
      const res = await this.$API.patientManage.patientDetail({ id: id })
      this.baseInfo = res.data || {}
      this.hospitalInfo = res.data.leavehospitalInfo
      this.outPatientInfo = res.data.outpatientInfo
    },
    handleSave () {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          if (this.drawerType === 'add') {
            const res = await this.$API.patientManage.patientAdd({ orgId: this.orgId, orgName: this.orgName, ...this.formRight })
            this.editModel = false
            this.$Message.success('患者添加成功')
            this.patientList()
            this.$refs.form.resetFields()
          } else {
            const res = await this.$API.patientManage.patientUpdate(this.formRight)
            this.editModel = false
            this.$Message.success('患者编辑成功')
             this.patientList()
             this.$refs.form.resetFields()
          }
        } else {
          this.$Message.error('请填写相关字段！')
        }
      })
    },
    // 上传的组件
    handleFormatError (file) {
      this.$Message.warning('请上传 .xls , .xlsx 类型的文件！')
    },
    async postFile () {
      const formData = new FormData()
      if (!this.patientFile) {
        this.$Message.warning('请先选择文件！')
        return false
      }
      formData.append('upfile', this.patientFile)
      formData.append('orgId', this.orgId)
      formData.append('orgName', this.orgName)
      const res = await this.$API.patientManage.patientImport(formData)
      this.$Message.success(`导入成功！成功条数：${res.data.successNum}, 失败条数：${res.data.errornum}`)
      this.patientList()
      this.exportModal = false
      this.patientFile = null
    },
    handleFileUpload (file) {
      this.patientFile = file
      return false
    },
    // 患者列表
    async patientList (params) {
      const res = await this.$API.patientManage.patientList({
        pager: this.pageData.current,
        orgId: this.orgId,
        limit: this.pageData.pageSize,
        userId: sessionStorage.getItem('rsysUserId'),
        ...this.formData,
        ...params
      })
      this.tableData = res.data
      this.pageData.total = res.total
    },
    selectTree (data) {
      this.btnDisable = false
      this.patientList({ orgId: data[0] && data[0].organizationId })
      this.orgId = data[0] && data[0].organizationId
      this.orgName = data[0] && data[0].title
    },
    resetForm () {
      this.$refs.form.resetFields()
    }
  },
  mounted () {
    this.patientList()
  }
}
</script>
<style lang="less" scoped>
.patient {
    height: 100%;
    .manSearch{
      display: flex;
      align-items: center;
      height: 80px;
      background-color: #fff;
      margin-bottom: 10px;
      span {
        margin: 0 10px 0 20px;
      }
      p{
        color: #2d8cf0;
      }
    }
   .content {
      height: calc(~'100% - 90px');
      padding: 20px;
      background-color: #fff;
     .contentRight {
        height: 100%;
        overflow-y: auto;
      }
    }
}
.hospitaliza {
  div{
    display: flex;
  }
  .hos_tit {
    color: #FF9900;
    font-size: 16px
  }
  .hos_left {
    width: 230px;
  }
  p {
    margin-bottom: 10px;
  }
}
.outPatient {
  .outTit {
    color: #FF9900;
    font-size: 16px
  }
  .outTotal {
    display: flex;
    padding-top: 10px;
    p {
      margin-bottom: 10px;
    }
  }
}
.patientMes{
  display: flex;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0,0,0,0.1)
}
.patientMesTitle{
  color: #FF9900;
  display: flex;
  margin-bottom: 15px;
  .titleP1{
    font-size: 16px;
    color: #FF9900;
    margin-right: 20px;
  }
}
.modal-cascader{
		display: inline-block;
		margin-left: 8px;
		width: ~"calc(100% - 64px)"
	}
</style>
