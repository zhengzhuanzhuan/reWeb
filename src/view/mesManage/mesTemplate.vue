<template>
  <div class='mesPlatfrom'>
    <h3>短信模板列表</h3>
	  <Row class="user_main_search common_search" :gutter="20">
		  <Col span="10">
			  <span>短信模板名称</span>
			  <Input v-model="templateName" placeholder="请填写短信平台名称"></Input>
		  </Col>
		  <Col span="10">
			  <span>短信平台</span>
			  <Select v-model="mesPlatId" placeholder="请选择短信平台" style="width:200px" clearable>
				  <Option v-for="(item, index) in mesPlatListNum" :value="item.smsCid" :key='index'>{{item.centerName}}</Option>
			  </Select>
		  </Col>
		  <Col span="4">
			  <Button type="primary" @click='handleSearch' class='btn'  v-permission="this.$API.mesTemplate.templateList">查询</Button>
			  <Button @click="handleAddEdit('','add')" v-if="!showChoose"  v-permission="this.$API.mesTemplate.templateAdd">添加短信模板</Button>
		  </Col>
	  </Row>
    <div class='main'>
      <Table :columns="columns" :data="tableData"></Table>
      <Page
        :total='total'
        :current='pageData.offset'
        :page-size='pageData.limit'
        show-sizer
        show-total
        @on-change='handlePageCurrent'
        @on-page-size-change='handlePageSize'
      />
    </div>
    <Drawer
      :title="drawType=='edit'? '编辑短信平台': '添加短信平台'"
      v-model="addEditMes"
      @on-close='handleClose'
      width='500px'>
      <Form ref="formValidate" :model="formValidate" :rules="validate.mesTemplate" :label-width="130">
        <FormItem label="短信模板名称" prop="templateName">
          <Input v-model="formValidate.templateName" placeholder="请输入短信模板名称"></Input>
        </FormItem>
        <FormItem label="短信平台" prop="mesprop">
          <Select v-model="formValidate.mesprop" placeholder="请选择短信平台" clearable>
            <Option v-for="(item, index) in mesPlatListNum" :value="`${item.smsCid}&${item.centerName}`" :key='index'>{{item.centerName}}</Option>
          </Select>
        </FormItem>
        <FormItem label="TEMPLATE_CODE" prop="templateCode">
          <Input v-model="formValidate.templateCode" placeholder="请输入TEMPLATE_CODE"></Input>
        </FormItem>
        <FormItem label="短信内容" prop="smsContent">
          <Input v-model="formValidate.smsContent" type="textarea" placeholder="请输入短信内容"></Input>
        </FormItem>
        <FormItem>
            <Button type="primary" @click="handleSubmit('formValidate')">保存</Button>
        </FormItem>
      </Form>
    </Drawer>
  </div>
</template>
<script>
export default {
    name: 'mestemplate',
    props: {
        showChoose: { // 查看时，设置为false，input置为disable,不显示 删除 按钮
            type: Boolean,
            default: false
        },
        resetParams: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            drawType: '',
            addEditMes: false,
            templateName: '',
            mesPlatListNum: [],
            mesPlatId: '',
            formValidate: {},
            total: 10,
            pageData: {
                offset: 1,
                limit: 10
            },
            tableData: [],
            columns: [
                {
                    title: '短信模板名称',
                    key: 'templateName'
                },
                {
                    title: '短信平台',
                    key: 'centerName'
                },
                {
                    title: 'TEMPLATE_CODE',
                    key: 'templateCode'
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
                                style: {
                                    marginRight: '5px',
                                    display: this.showChoose ? 'none' : 'inline-block'
                                },
                                directives: [
                                    {
                                        name: 'permission',
                                        value: this.$API.mesTemplate.templateEdit
                                    }
                                ],
                                on: {
                                    click: () => {
                                        this.handleAddEdit(params.row, 'edit')
                                    }
                                }
                            }, '编辑'),
                            h('Button', {
                                props: {
                                    type: 'text',
                                    size: 'small'
                                },
                                style: {
                                    display: this.showChoose ? 'none' : 'inline-block'
                                },
                                directives: [
                                    {
                                        name: 'permission',
                                        value: this.$API.mesTemplate.templateDel
                                    }
                                ],
                                on: {
                                    click: () => {
                                        this.handleMesDelete(params.row)
                                    }
                                }
                            }, '删除'),
                            h('Button', {
                                props: {
                                    type: 'text',
                                    size: 'small'
                                },
                                style: {
                                    display: this.showChoose ? 'inline-block' : 'none'
                                },
                                on: {
                                    click: () => {
                                    	this.$emit('chosen', params.row)
                                    }
                                }
                            }, '选择')
                        ])
                    }
                }
            ]
        }
    },
    watch: {
        resetParams () {
            if (this.resetParams) {
                this.templateName = ''
                this.mesPlatId = ''
                this.smsCid = ''
                this.pageData.offset = 1
                this.handleSearch()
            }
        }
    },
    methods: {
    // 列表
        async handleTemplateList (params) {
            const res = await this.$API.mesTemplate.templateList({
                ...this.pageData,
                templateName: this.templateName,
                smsCid: this.mesPlatId,
                ...params
            })
            this.tableData = res.data
            this.total = res.total
        },
        // 短信平台列表
        async handlePlatList () {
            const res = await this.$API.mesConfig.mesList({
                offset: 1,
                limit: 10
            })
            this.mesPlatListNum = res.data
        },
        handleSearch () {
            this.handleTemplateList({
                templateName: this.templateName,
                smsCid: this.mesPlatId
            })
        },
        handlePageCurrent (offset) {
            this.pageData.offset = offset
            this.handleTemplateList({ offset })
        },
        handlePageSize (limit) {
            this.pageData.limit = limit
            this.handleTemplateList({ limit })
        },
        handleMesDelete (data) {
            this.$Modal.confirm({
                title: '删除提示',
                content: '<p>确定要删除该条记录吗</p>',
                onOk: async () => {
                    await this.$API.mesTemplate.templateDel({
                        smsCid: data.smsCid,
                        smsTid: data.smsTid,
                        updateUserId: sessionStorage.getItem('rsysUserId')
                    })
                    this.$Message.success('该条信息已删除')
                    this.handleTemplateList()
                }
            })
        },
        handleAddEdit (rowData, type) {
            if (type == 'edit') {
                const selectChosen = this.mesPlatListNum.some(item=>{
                    return item.smsCid==rowData.smsCid
                })
                if(selectChosen){
                    rowData.mesprop=`${rowData.smsCid}&${rowData.centerName}`
                } else {
                    rowData.mesprop = ''
                }
            }
            this.addEditMes = true
            this.drawType = type
            let rowDate = rowData || this.formValidate
            this.formValidate = JSON.parse(JSON.stringify(rowDate))
        },
        handleSubmit (name) {
            this.$refs[name].validate(async (valid) => {
                if (valid) {
                    if (this.drawType == 'edit') {
                        await this.$API.mesTemplate.templateEdit({
                            ...this.formValidate,
                            smsCid: this.formValidate.mesprop.split('&')[0],
                            centerName: this.formValidate.mesprop.split('&')[1],
                            updateUserId: sessionStorage.getItem('rsysUserId')
                        })
                        this.$Message.success('短信平台编辑成功')
                        this.$refs.formValidate.resetFields()
                        this.handleTemplateList()
                        this.addEditMes = false
                    } else if (this.drawType == 'add') {
                        await this.$API.mesTemplate.templateAdd({
                            ...this.formValidate,
                            smsCid: this.formValidate.mesprop.split('&')[0],
                            centerName: this.formValidate.mesprop.split('&')[1],
                            updateUserId: sessionStorage.getItem('rsysUserId')
                        })
                        this.$Message.success('短信平台添加成功')
                         this.$refs.formValidate.resetFields()
                        this.addEditMes = false
                        this.handleTemplateList()
                    }
                } else {
                    this.$Message.error('请填写相关字段')
                }
            })
        },
        handleClose () {
            this.$refs.formValidate.resetFields()
        }

    },
    mounted () {
        this.handleTemplateList()
        this.handlePlatList()
    }
}
</script>
<style lang="less" scoped>
.mesPlatfrom {
  width: 100%;
  height: 100%;
  background-color: #fff;
  padding: 20px;
  .searchMes {
    display: flex;
    span {
      margin: 8px 10px 0 20px;
    }
    .btn {
      margin: 0 40px 0 20px;
    }
  }
  h3{
    margin-bottom: 20px;
  }
  .main {
    margin-top: 20px;
  }

}
</style>
