<style lang="less">
	.img-item{
		.user-logo{
			width: 60px;
			height: 60px;
			position: absolute;
			left: 120px;
			top: 0;
		}
	}
</style>

<template>
  <div class="user">
    <div class="user_main">
      <Row class="user_main_search common_search" :gutter="20">
        <Col span="6">
          <span>系统标题</span>
          <Input v-model="searchParams.title" placeholder="系统标题"></Input>
        </Col>
        <Col span="2">
          <Button @click="handlePage(1)" type="primary" :loading="tableParams.isLoading">查询</Button>
			<Button @click="handleAddEdit('','add')" v-permission="this.$API.systemSet.create">添加系统</Button>
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
            :title="drawerType==='add'?'添加系统':drawerType==='edit'?'编辑系统':'查看系统'"
            v-model="isDrawerShow"
            width="30"
            :mask-closable="false"
            @on-close="resetForm"
    >
      <Form :model="formData" :rules="validate.systemEdit" ref="form" class="drawer-form" :label-width="80">
        <FormItem label="系统标题" prop="title">
          <Input v-model="formData.title" :disabled="drawerType==='detail'" />
        </FormItem>
        <FormItem label="系统名称" prop="name">
          <Input v-model="formData.name" :disabled="drawerType==='detail'" />
        </FormItem>
        <!--<FormItem label="系统图标">-->
          <!--<Input v-model="formData.icon" :disabled="drawerType==='detail'" />-->
        <!--</FormItem>-->
		  <FormItem label="系统图标" class="img-item">
			  <Upload
				  action="/temp/posts/"
				  :max-size="100"
				  :format="['jpg','jpeg','png']"
				  :disabled="drawerType==='detail'"
				  :before-upload="handleImgUpload"
				  :on-format-error="handleImgFormatError"
			  >
				  <Button icon="ios-cloud-upload-outline" :disabled="drawerType==='detail'">上传图片</Button>
			  </Upload>
			  <img :src="formIconImg" v-show="formIconImg" class="user-logo">
		  </FormItem>
		  <FormItem label="系统类型" prop="paramCode" v-if="drawerType!=='detail'">
			  <Select v-model="formData.paramCode">
				  <Option v-for="item in systemTypeOps" :value="item.paramCode" :key="item.paramId">{{ item.paramName }}</Option>
			  </Select>
		  </FormItem>
		  <FormItem label="系统类型" v-else>
			  <Input v-model="formData.paramName" disabled />
		  </FormItem>
        <FormItem label="系统路径" prop="url">
          <Input v-model="formData.url" :disabled="drawerType==='detail'" />
        </FormItem>
        <FormItem label="排序" prop="sort">
          <Input v-model.trim="formData.sort" :disabled="drawerType==='detail'" />
        </FormItem>
        <FormItem label="描述">
          <Input v-model="formData.description" type="textarea" :disabled="drawerType==='detail'" />
        </FormItem>
        <FormItem label="是否启用">
          <RadioGroup v-model="formData.status" v-if="drawerType!=='detail'">
            <Radio label=1>是</Radio>
            <Radio label=0>否</Radio>
          </RadioGroup>
          <span v-else>{{formData.status === '1' ? '是':'否'}}</span>
        </FormItem>
      </Form>
      <div style="text-align: center;"  v-if="drawerType!=='detail'">
        <Button type="primary" @click="handleSave">保存</Button>
      </div>
      <div v-else style="padding: 0 80px;">
        <Button type="primary" @click="handleAddEdit(formData, 'edit')" v-permission="this.$API.systemSet.update">编辑</Button>
        <Button type="error" @click="handleDelete(formData.systemId)" style="float: right;" v-permission="this.$API.systemSet.delete">删除</Button>
      </div>
    </Drawer>
  </div>
</template>

<script>
import { handleDeleteRefresh } from '@/libs/businessUtil'
const baseForm = {
    systemId: '',
    title: '', // 必填
    name: '', // 必填
    url: '', // 必填
    paramCode: '', // 必填
    icon: '',
    status: '1',
    description: '',
    sort: '',
    banner: '', // 以下三个，原型没有，接口有的参数
    theme: '',
    basepath: '' // 根目录
}
export default {
    name: 'system-set',
    data () {
        return {
        	formIconFile: null,
            formIconImg: '',
            isDrawerShow: false,
            drawerType: 'add', // add/edit/detail
            systemTypeOps: [], // 系统类型下拉框选项数据
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
            config: [
                {
                    title: '系统标题',
                    key: 'title'
                },
                {
                    title: '系统名称',
                    key: 'name'
                },
                {
                    title: '系统路径',
                    key: 'url'
                },
                {
                    title: '状态',
                    key: 'status',
                    render: (h, params) => {
                        return h('span', params.row.status === 0 ? '禁用' : '启用')
                    }
                },
                {
                    title: '描述',
                    key: 'description'
                },
                {
                    title: '系统类型',
                    key: 'paramName'
                },
                {
                    title: '排序',
                    key: 'sort'
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
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.handleAddEdit(params.row, 'detail')
                                        }
                                    }
                                },
                                '查看'
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
                                            value: this.$API.systemSet.update
                                        }
                                    ],
                                    style: {
                                        marginRight: '5px'
                                    },
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
                                        marginRight: '5px'
                                    },
                                    directives: [
                                        {
                                            name: 'permission',
                                            value: this.$API.systemSet.delete
                                        }
                                    ],
                                    on: {
                                        click: () => {
                                            this.handleDelete(params.row.systemId)
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
        /**
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
            this.formIconFile = file
            // 将文件转成base64预览
            const _this = this
            try {
                let reader = new FileReader()
                reader.onload = function () {
                    _this.formIconImg = this.result
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
            this.$Message.warning('图片文件目前仅支持jpg,jpeg,png格式的图片，请重新选择图片！')
        },
    	async getSystemTypeOps () {
    		const res = await this.$API.systemParamManage.list({ limit: 9999, pager: 1, paramTypeCode: 'appType' })
            this.systemTypeOps = res.data
        },
        async handleQuery () {
    		this.tableParams.isLoading = true
            const res = await this.$API.systemSet.list(this.searchParams).catch(e => {
                this.tableParams.isLoading = false
            })
            this.tableParams.data = res.data
            this.tableParams.total = res.total
            this.tableParams.isLoading = false
        },
        handleAddEdit (rowData, type) {
            rowData = rowData || baseForm
            this.isDrawerShow = true
            this.formData = JSON.parse(JSON.stringify(rowData))
            this.formData.status = rowData.status + ''
            this.drawerType = type // add/edit/detail
            if (type === 'add') {
                this.formIconImg = ''
                this.resetForm()
            } else {
                this.formIconImg = rowData.icon
            }
        },
        handlePage (pager) {
            this.searchParams.pager = pager
            this.handleQuery()
        },
        handleSave () {
            this.$refs.form.validate(async (valid) => {
                if (valid) {
                    const formData = new FormData()
                    for (let key in this.formData) {
                        formData.append(key, this.formData[key] || '')
                    }
                    formData.append('file', this.formIconFile)
                    const funcName = this.formData.systemId ? 'update' : 'create'
                    await this.$API.systemSet[funcName](formData)
                    this.isDrawerShow = false
                    if (!this.formData.systemId) {
                        this.searchParams.pager = 1
                    }
                    this.handleQuery()
                }
            })
        },
        handleDelete (delId) {
            this.$Modal.confirm({
                title: '删除提示',
                content: '确定要删除该条系统配置吗?',
                onOk: async () => {
                    await this.$API.systemSet.delete({ ids: delId })
                    this.isDrawerShow = false
                    handleDeleteRefresh('searchParams', 'tableParams', 'handleQuery', this)
                }
            })
        },
        resetForm () {
            if (this.drawerType !== 'detail') {
                this.$refs.form.resetFields()
            }
        }
    },
    mounted () {
        this.handleQuery()
        this.getSystemTypeOps()
    }
}
</script>
