<template>
  <div class="robotConfig">
    <h3>机器人配置列表</h3>
    <Row class='common_search' :gutter="20">
      <Col span="7">
        <span>方案名称</span>
        <Input v-model="searchParams.schemeName" placeholder="请输入方案名称"></Input>
      </Col>
      <Col span="7">
        <span>AI引擎</span>
        <Select v-model="aiEngine" placeholder="请选择" clearable>
          <Option v-for='(item, index) in AINum' :value="`${item.paramId}&${item.paramName}`" :key='index'>{{item.paramName}}</Option>
        </Select>
      </Col>
    	<Col span="3">
				<Button @click="handlePage(1)" type="primary" :loading="tableParams.isLoading" v-permission="this.$API.robotConfig.robotList">查询</Button>
			</Col>
    </Row>
    <Table :columns="columns" :data="tableParams.data" :loading="tableParams.isLoading"></Table>
    <Page
      :total="tableParams.total"
      :current="searchParams.pager"
      :page-size='searchParams.limit'
      show-total
      @on-change='handlePage'
      />
    <Drawer title="机器人配置" :closable="false" v-model="robotDrawer" @on-close='handleClose' width='500px'>
      <Form ref="formValidate" :model="formValidate" :rules="validate.robotRules" :label-width="110">
        <FormItem label="方案名称" prop="variableName">
          <p>{{formValidate.schemeName}}</p>
        </FormItem>
        <FormItem label="AI引擎" prop="aiEngine">
          <Select v-model="formValidate.aiEngine" placeholder="请选择" clearable>
            <Option v-for='(item, index) in AINum' :value="`${item.paramId}&${item.paramName}`" :key='index'>{{item.paramName}}</Option>
          </Select>
        </FormItem>
        <FormItem label="语音识别采样率" prop="samplingRate">
          <Select v-model="formValidate.samplingRate" placeholder="请选择" clearable>
            <Option v-for='(item, index) in samplingNum' :value="item.paramCode" :key='index'>{{item.paramName}}</Option>
          </Select>
        </FormItem>
        <FormItem label="识别语种" prop="languages">
          <Select v-model="formValidate.languages" placeholder="请选择" clearable>
            <Option v-for='(item, index) in languagesNum' :value="`${item.paramCode}&${item.paramName}`" :key='index'>{{item.paramName}}</Option>
          </Select>
        </FormItem>
        <FormItem label="声源引擎" prop="sourceEngine">
          <Select v-model="formValidate.sourceEngine" placeholder="请选择" clearable>
            <Option v-for='(item, index) in sourceEngineNum' :value="item.paramName" :key='index'>{{item.paramName}}</Option>
          </Select>
        </FormItem>
        <FormItem label="语音发言人" prop="voiceSpeaker">
          <Select v-model="formValidate.voiceSpeaker" placeholder="请选择" clearable>
            <Option v-for='(item, index) in voiceSpeakerNum' :value="item.paramName" :key='index'>{{item.paramName}}</Option>
          </Select>
        </FormItem>
        <FormItem>
          <Button type="primary" style="marginRight:20px" @click="handleRemove" :disabled='removeBtn'>移除配置</Button>
          <Button type="primary" @click="handleSubmit('formValidate')">保存</Button>
        </FormItem>
      </Form>
    </Drawer>
  </div>
</template>
<script>
export default {
  name: 'robotConfig',
  data () {
    return {
      searchParams: {
        schemeName: '',
        limit: 10,
        pager: 1
      },
      aiEngine: '',
      tableParams: {
        data: [],
        total: 10,
        isLoading: false
      },
      columns: [
         {
          title: '方案名称',
          key: 'schemeName'
        },
        {
          title: 'AI引擎',
          key: 'aiEngineName'
        },
        {
          title: '语音识别采样率',
          key: 'samplingRate'
        },
        {
          title: '识别语种',
          key: 'languagesName'
        },
        {
          title: '声源引擎',
          key: 'sourceEngine'
        },
        {
          title: '语音发言人',
          key: 'voiceSpeaker'
        },
        {
          title: '操作',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'default',
                  size: 'small'
                },
                directives: [
                  {
                    name: 'permission',
                    value: this.$API.robotConfig.robotAdd
                  }
                ],
                on: {
                  click: () => {
                    this.handleConfig(params.row)
                  }
                }
              }, '配置')
            ])
          }
        }
      ],
      robotDrawer: false,
      formValidate: {},
      drawerType: '',
      removeBtn: false,
      AINum: [],
      samplingNum: [],
      languagesNum: [],
      sourceEngineNum: [],
      voiceSpeakerNum: []
    }
  },
  methods: {
    async handleRobotList () {
      this.tableParams.isLoading = true
      const res = await this.$API.robotConfig.robotList({
        ...this.searchParams,
        aiEngineId: this.aiEngine && this.aiEngine.split('&')[0],
        aiEngineName: this.aiEngine && this.aiEngine.split('&')[1]
      })
      this.tableParams.data = res.data
      this.tableParams.total = res.total
      this.tableParams.isLoading = false
    },
    handlePage (pager) {
      this.searchParams.pager = pager
      this.handleRobotList()
    },
    // 点击配置
    handleConfig (rowData) {
      this.robotDrawer = true
      let rowDate = rowData || this.formValidate
      this.formValidate = JSON.parse(JSON.stringify(rowDate))
      if (rowData.aiId === '') {
        this.drawerType = 'robotAdd'
        this.removeBtn = true
      } else {
        this.drawerType = 'robotEdit'
        this.removeBtn = false
        this.formValidate.aiEngine = `${rowData.aiEngineId}&${rowData.aiEngineName}`
        this.formValidate.languages = `${rowData.languagesEngine}&${rowData.languagesName}`
      }
    },
    handleSubmit (name) {
      this.$refs[name].validate(async (valid) => {
        if (valid) {
          await this.$API.robotConfig[this.drawerType]({
          ...this.formValidate,
          aiEngineId: this.formValidate.aiEngine.split('&')[0],
          aiEngineName: this.formValidate.aiEngine.split('&')[1],
          languagesEngine: this.formValidate.languages.split('&')[0],
          languagesName: this.formValidate.languages.split('&')[1],
          updateUserId: sessionStorage.getItem('rsysUserId')
        })
          this.robotDrawer = false
          this.$Message.success('随访变量配置成功!')
          this.handleRobotList()
        } else {
          this.$Message.error('请填写相对应字段！')
        }
      })
    },
    handleRemove () {
      this.$Modal.confirm({
        title: '删除提示',
        content: '<p>确定要该条配置信息吗？</p>',
        onOk: async () => {
          await this.$API.robotConfig.robotDelete({ aiId: this.formValidate.aiId })
          this.handleRobotList()
          this.robotDrawer = false
          this.$Message.success('随访变量移除成功!')
        }
      })
    },
    async handleAI () {
      const res1 = await this.$API.planManage.upmsParamDataList({ paramTypeCode: 'aiEngine', limit: 999 })
      this.AINum = res1.data
      // 语音识别采样率
      const res2 = await this.$API.planManage.upmsParamDataList({ paramTypeCode: 'samplingRate', limit: 999 })
      this.samplingNum = res2.data
       // 识别语种
      const res3 = await this.$API.planManage.upmsParamDataList({ paramTypeCode: 'AI-ASR-ENGINE', limit: 999 })
      this.languagesNum = res3.data
       // 声源引擎
      const res4 = await this.$API.planManage.upmsParamDataList({ paramTypeCode: 'AI-TTS-ENT', limit: 999 })
      this.sourceEngineNum = res4.data
       // 语音发言人
      const res5 = await this.$API.planManage.upmsParamDataList({ paramTypeCode: 'AI-TTS-VCN', limit: 999 })
      this.voiceSpeakerNum = res5.data
    },
    handleClose () {
      this.$refs.formValidate.resetFields()
    }
  },
  mounted () {
    this.handleRobotList()
    this.handleAI()
  }
}
</script>
<style lang="less" scoped>
.robotConfig{
  background-color: #fff;
  width: 100%;
  height: 100%;
  padding: 20px
}
</style>
