<template>
  <div class="voice">
    <Row>
      <Col span="4" class="voice-Left">
        <h2>语音分类</h2>
        <Row style="marginBottom: 20px" v-if="!showChoose">
          <Col style='marginTop: 10px' span="6">
            <span>语音分类</span>
          </Col>
          <Col span="18">
            <Input
              search
              enter-button
              v-model="SearchName"
              placeholder="请输入语音分类"
              @on-search='handleSearchSort'
              />
          </Col>
        </Row>
        <div v-for="(item,index) in voiceSortNum" :style="voiceSortIndex == index? 'color: #57a3f3': 'color: #333'" class='leftList'>
          <div @click="handleVoiceSort(item, index)">
            <Icon type="ios-folder"/>
            <span>{{item.classifyName}}</span>
          </div>
          <p v-show='item.remove == 1' @click='handleDelSort(item)' v-if="!showChoose">X</p>
        </div>
        <div class="addSort" @click='addVoiceDrawer = true' v-if="!showChoose" v-permission="this.$API.proConfig.addVoiceSort">
          +添加语音分类
        </div>
      </Col>
      <Col span="20" class="voice-Right">
        <h3>{{classifyName}}</h3>
        <div class="Rig_search">
          <span>语音标题</span>
          <Input v-model='voiceTitle' placeholder="请输入语音标题" style="width: 200px" />
          <Button type="primary" @click='handlePageCurrent(1)' :loading='tableData.loading' v-permission="this.$API.proConfig.voiceList">查询</Button>
          <Button @click="handleAddEdit('', 'add')" v-if="!showChoose" v-permission="this.$API.proConfig.addVoiceFile">添加语音</Button>
						<Button
              icon="ios-cloud-upload-outline"
              @click='UploadModal=true'
              v-permission="this.$API.proConfig.batchVoiceAdd"
            >批量导入语音</Button>
          <p @click="handleDownLoad" style='cursor: pointer' v-if="!showChoose" v-permission="this.$API.proConfig.batchImport">下载语音内容模版</p>
        </div>
        <Table :columns="columns" :data="tableData.data" :loading='tableData.loading'>
					<template slot-scope="{row, index}" slot="action">
						<div 
							class="btnAudio"
							id='btnAudio'
							ref='btnAudio'
							:style="{background:`url(${audioStop}) no-repeat`}"
							@click='handleAudio(index)'>
							<audio id="mp3Btn"
								ref='mp3Btn'
								@ended="audioEnd(index)"
								:src="row.voicePath">
							</audio>
						</div>
						<Button type="text" size="small" :style="{display:(showChoose?'none':'inline-block')}" @click="handleAddEdit(row, 'edit')" class="btn" v-permission="$API.proConfig.editVoiceFile">编辑</Button>
						<Button type="text" size="small" :style="{display:(showChoose?'none':'inline-block'),margin:'-20px 10px'}" class="btn" @click="handleDelete(row.voiceId, 'edit')"  v-permission="$API.proConfig.voiceDelete">删除</Button>
						<Button type="text" size="small" :style="{display:(showChoose?'inline-block':'none')}" @click="handleChose(row)">选择</Button>
					</template>
				</Table>
        <Page
          :total='total'
          :current='pageData.pager'
          :page-size='pageData.limit'
          show-total
          show-sizer
          @on-change='handlePageCurrent'
          @on-page-size-change='handlePageSize'
        />
      </Col>
    </Row>
    <Drawer
     :title="drawerType == 'edit'? '编辑语音' : '添加语音'"
      :closable="false"
      @on-close='handleCloseDrawer'
      v-model="voiceDrawer" width='600'>
      <Form :model="formValidate" :label-width="80" ref='formRef' :rules="validate.voiceManageForm">
        <FormItem label="语音标题" prop="voiceName">
          <Input v-model="formValidate.voiceName" placeholder="请输入语音标题"></Input>
        </FormItem>
        <FormItem label="语音内容" prop="content">
          <Input v-model="formValidate.content" type="textarea" placeholder="请输入语音内容"></Input>
        </FormItem>
        <FormItem label="语音分类">
          <p>{{classifyName}}</p>
          <div class='upLoadVoice'>
            <p>请上传本地语音文件，支持wav格式</p>
            <span v-show="showWav">{{voicePath}}</span>
            <Upload
              action="/posts/"
              :format="['wav']"
              accept=".wav"
              :show-upload-list='true'
              :default-file-list='defaultList'
              :before-upload="handleOtherImgUpload"
              :on-format-error="handleImgFormatError"
            >
                <Button icon="ios-cloud-upload-outline">上传语音</Button>
            </Upload>
          </div>
        </FormItem>
        <FormItem label="备注" prop="remark">
          <Input v-model="formValidate.remark" type="textarea"  placeholder="请输入备注"></Input>
        </FormItem>
        <FormItem>
          <Button type="primary" style="margin: 20px 50%;" @click="handleVoiceFile">保存</Button>
        </FormItem>
      </Form>
    </Drawer>
    <Drawer title="添加语音分类" :closable="false" v-model="addVoiceDrawer" width='500'>
      <div class="addSortDrawer">
        <span>分类名称</span>
        <Input v-model="addSortName" placeholder="请输入分类名称" style="width: 250px" />
      </div>
      <Button type="primary" style="margin:20px 35%" @click='handleAddSort'>保存</Button>
    </Drawer>
    <Modal
        v-model="UploadModal"
        title="批量导入语音"
        >
        <input type="file" @change="uploadZip" style="marginBottom: 10px" accept=".zip,.rar" ref='FileRefZip'></input>
        <Alert type="warning" show-icon>请上传压缩包</Alert>
        <input type="file" @change="uploadExcel" style="marginBottom: 10px" accept=".xls,.xlsx" ref='FileRefXls'></input>
        <Alert type="warning" show-icon>请上传excel格式</Alert>
        <div slot="footer">
          <Button @click="UploadModal = false">取消</Button>
          <Button type="primary"  @click="handleVoiceUpload">确定</Button>
        </div>
    </Modal>
     <Drawer title="上传失败" :closable="true" v-model="upLoadDrawer" width='700' @on-close='handleClose'>
      <Table :columns="upLoadColumn" :data="upLoadTabData" ></Table>
      <Button style="margin:20px 35%" @click='handleErrMesExport'>导出失败记录</Button>
    </Drawer>
  </div>
</template>
<script>
import audioPlay from '@/assets/images/audioPlay.png'
import audioStop from '@/assets/images/audioStop.png'
export default {
    name: 'outSideCall',
    props: {
			showChoose: { // 查看时，设置为false，input置为disable,不显示 删除 按钮
				type: Boolean,
				default: false
			}
    },
    data () {
        return {
						audioStop,
						audioPlay,
            voicePath: '',
            errorId: '',
            UploadInput: '',
            upLoadDrawer: false,
            UploadModal: false,
            zipFile: '',
            excelFile: '',
            addSortName: '',
            SearchName: '',
            voiceTitle: '',
            total: 10,
            tableData: {
              data: [],
              loading: false
            },
            columns: [
                {
                    title: '语音标题',
                    key: 'voiceName'
                },
                {
                    title: '语音内容',
                    key: 'content'
                },
                {
                    title: '操作',
                    width: 350,
										align: 'center',
										slot: 'action',
                }
            ],
            upLoadTabData: [],
            upLoadColumn: [
                {
                    title: '语音标题名称',
                    key: 'voiceName'
                },
                {
                    title: '语音文件名',
                    key: 'fileName'
                },
                {
                    title: '失败原因',
                    key: 'errorMessage'
                },
                {
                    title: '操作',
                    render: (h, params) => {
                        return h('div', [
                            h('Button', {
                                style: {
                                    display: params.row.errorCode == 1 ? 'none' : 'inline'
                                },
                                on: {
                                    click: () => {
                                        this.handleCoverFile(params.row, params.index)
                                    }
                                }
                            }, '覆盖之前的文件')
                        ])
                    }
                }
            ],
            pageData: {
                pager: 1,
                limit: 10
            },
            voiceDrawer: false,
            addVoiceDrawer: false,
            formValidate: {},
            voiceSortNum: [],
            classifyId: '',
            classifyName: '',
            UploadFile: {},
            drawerType: '',
            showWav: true,
            voiceSortIndex: null,
            defaultList: [
							{
								name: '请选择文件'
							}
            ]
        }
    },
    methods: {
			audioEnd(index){
				const btnAudio= document.querySelectorAll('#btnAudio')
				btnAudio[index].style.background=`url(${audioStop}) no-repeat`
			},
			handleAudio(index){
				const audio = document.querySelectorAll('#mp3Btn')
        const btnAudio= document.querySelectorAll('#btnAudio')
				if(audio[index].paused){
					btnAudio[index].style.background=`url(${audioPlay}) no-repeat`
					audio[index].play();
          return;
				} else {
					btnAudio[index].style.background=`url(${audioStop}) no-repeat`
					audio[index].pause();
				}
			},
			handleChose(row){
				this.$emit('chosen', row)
				this.voiceTitle = ''
				this.classifyId = this.voiceSortNum[0].classifyId || ''
			},
    // 表格数据
        async handleVoiceList (params) {
            this.tableData.loading = true
            const res = await this.$API.proConfig.voiceList({
                ...this.pageData,
                classifyId: this.classifyId,
                voiceName: this.voiceTitle,
                sort:'create_time',
                order: 'desc',
                ...params
            })
            this.total = res.total
            this.tableData.data = res.data
            this.tableData.loading = false
        },
        // 页码
        handlePageCurrent (pager) {
            this.pageData.pager = pager
            this.handleVoiceList({ pager })
        },
        handlePageSize (limit) {
            this.pageData.limit = limit
            this.handleVoiceList({ limit })
        },
        // 语音文件的编辑
        handleAddEdit (rowData, type) {
            this.voiceDrawer = true
            this.drawerType = type
            this.voicePath = rowData.voicePath
            let rowDate = rowData ||　this.formValidate
            this.formValidate = JSON.parse(JSON.stringify(rowDate))
            this.defaultList[0].name = '请选择文件'
            this.UploadFile = {}
            type == 'edit' ? this.showWav = true : this.showWav = false
        },
        // 添加语音文件
        handleVoiceFile () {
            const formData = new FormData()
            formData.append('file', this.UploadFile)
            formData.append('classifyName', this.classifyName)
            formData.append('classifyId', this.classifyId)
            formData.append('voiceName', this.formValidate.voiceName || '')
            formData.append('content', this.formValidate.content || '')
            formData.append('remark', this.formValidate.remark || '')
            formData.append('voiceId', this.formValidate.voiceId || '')
            formData.append('voicePath', this.formValidate.voicePath || '')
            formData.append('isDeleted', this.formValidate.isDeleted || '')
            formData.append('createTime', this.formValidate.createTime || '')
            formData.append('updateUserId', sessionStorage.getItem('rsysUserId'))
            this.$refs.formRef.validate(async (valid) => {
            if (valid) {
              if (this.drawerType == 'add') {
                await this.$API.proConfig.addVoiceFile(formData)
                this.$Message.success('语音添加成功')
                this.voiceDrawer = false
                this.$refs.formRef.resetFields()
                this.handleVoiceList()
              } else if (this.drawerType == 'edit') {
                await this.$API.proConfig.editVoiceFile(formData)
                this.$Message.success('语音编辑成功')
                this.voiceDrawer = false
                this.$refs.formRef.resetFields()
                this.handleVoiceList()
              }
          } else {
              this.$Message.error('请填写对应字段！')
          }
          })
        },
        // 点击语音分类查询表格
        handleVoiceSort (data, index) {
            this.voiceSortIndex = index
            this.classifyId = data.classifyId
            this.classifyName = data.classifyName
            this.handleVoiceList({ classifyId: data.classifyId })
        },
        // 语音分类列表
        async handleSortList (params) {
            const res = await this.$API.proConfig.voiceSortList({
                pager: 1,
                limit: 999,
                classifyType: 1,
                ...params
            })
            this.voiceSortNum = res.data
            this.classifyId = res.data[0] && res.data[0].classifyId
            this.classifyName = res.data[0] && res.data[0].classifyName
            this.voiceSortIndex = 0
            this.handleVoiceList({ classifyId: res.data[0] && res.data[0].classifyId })
        },
        // 语音分类的搜索
        handleSearchSort () {
            this.handleSortList({ classifyName: this.SearchName })
        },
        // 删除语音分类
        async handleDelSort (data) {
            await this.$API.proConfig.DelVoiceSort({
                id: data.classifyId,
                classifyName: data.classifyName,
                updateUserId: data.updateUserId
            })
            this.$Message.success('语音分类删除成功')
            this.handleSortList()
        },
        // 添加语音分类
        async handleAddSort () {
            await this.$API.proConfig.addVoiceSort({
                classifyType: 1,
                classifyName: this.addSortName
            })
            this.addVoiceDrawer = false
            this.$Message.success('语音分类添加成功')
            this.addSortName = ''
            this.handleSortList()
        },
        handleDelete (id) {
            this.$Modal.confirm({
                title: '删除提示',
                content: '<p>确定要删除该条记录吗</p>',
                onOk: async () => {
                    await this.$API.proConfig.voiceDelete({
                        id,
                        updateUserId: sessionStorage.getItem('rsysUserId')
                    })
                    this.$Message.success('该条信息已删除')
                    this.handleVoiceList({pager: 1})
                }
            })
        },
        // 上传语音
        handleOtherImgUpload (file) {
            this.defaultList[0].name = file.name
            this.UploadFile = file
            this.showWav = false
        },
        // 上传的错误信息
        handleImgFormatError (file) {
            this.$Message.warning('请上传以.wav结尾的文件')
        },
        handleDownLoad () {
            window.open('/manage/followupVoice/uploadVoice')
        },
        uploadZip (event) {
            this.zipFile = event.target && event.target.files[0]
        },
        uploadExcel (event) {
            this.excelFile = event.target && event.target.files[0]
        },
        // 导入
        async handleVoiceUpload (file) {
            if (this.zipFile == '' || this.excelFile == '') {
                this.$Message.warning('请选择文件！')
            } else {
                const formUpload = new FormData()
                formUpload.append('zipFile', this.zipFile)
                formUpload.append('excelFile', this.excelFile)
                formUpload.append('classifyId', this.classifyId)
                formUpload.append('classifyName', this.classifyName)
                const res = await this.$API.proConfig.batchVoiceAdd(formUpload)
                if(res.data.length){
                  this.upLoadDrawer = true
                } else {
                  this.$Message.error('导入失败，请检查模版！')
                  this.upLoadDrawer = false
                }
                this.errorId = res.data && res.data[0].errorId || ''
                this.upLoadTabData = res.data
                this.UploadModal = false
                this.$refs.FileRefZip.value=''
                this.$refs.FileRefXls.value=''
                this.zipFile =''
                this.excelFile =''
                this.handleVoiceList()
            }
        },
        // 覆盖之前的文件
        handleCoverFile (data, index) {
          this.$Modal.confirm({
            title: '覆盖提示',
            content: '<p>确定覆盖原有语音文件吗？</p>',
            onOk: async () => {
              await this.$API.proConfig.coverVoiceFile({
                voiceName: data.voiceName,
                voicePath: data.fileName,
                content: data.content,
                remark: data.remark,
                classifyName: this.classifyName,
                classifyId: this.classifyId,
                errorId: data.errorId
              })
              this.upLoadTabData.splice(index, 1)
              this.$Message.success('该条记录已覆盖')
            }
          })
        },
        // 错误信息导出
        handleErrMesExport () {
            window.open(`/manage/followupVoice/VoiceErrorExcel?errorId=${this.errorId}`)
        },
        // 清除缓存文件
        async handleClearCache () {
            const res = await this.$API.proConfig.clearCache({
                classifyName: this.classifyName,
                errorId: this.errorId
            })
        },
        handleCloseDrawer () {
            this.$refs.formRef.resetFields()
        },
        handleClose () {
            this.handleClearCache()
        }
    },
    mounted () {
        this.handleSortList()
    }
}
</script>
<style>
textarea.ivu-input{
  font-size: 12px;
}
</style>

<style lang="less" scoped>
  .voice {
    width: 100%;
    height: 100%;
    padding: 20px;
    background-color: #fff;
    h2{
      margin-bottom: 10px;
    }
    &-Left{
      height: 100%;
      border-right: 1px solid #ccc;
      padding-right: 20px;
      .leftList {
        height: 30px;
        display: flex;
        cursor: pointer;
        justify-content: space-between;
        span {
          margin-left: 10px;
        }
      }
      .addSort {
        border: 1px solid #ccc;
        text-align: center;
        padding: 6px;
        font-size: 14px;
        color: #333;
        margin-top: 20px;
        cursor: pointer;
      }
    }
    &-Right{
      padding-left: 20px;
      .Rig_search{
        width: 700px;
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        justify-content:space-around;
      }
    }
  }
  .upLoadVoice {
    width: 100%;
    height: 160px;
    padding: 10px;
    background: rgb(242,242,242);
    border:1px solid rgb(228,228,228);
    p{
      font-size: 12px;
      color:#999;
    }
    span{
      display: block;
      color: #333;
      font-size: 14px;
    }
  }
  .addSortDrawer {
    margin: 20px;
    span {
      margin-right: 10px;
    }
	}
	.btn {
		transform: translateY(-40%);
	}
	.btnAudio{
		transform: translate(268%, 70%);
    width: 25px;
    height: 25px;
}
</style>
