<template>
  <div>
		<field-component ref="fld" @openDrawerEdit="openDrawerEdit" :is-normal="true">
			<template slot="otherButtons">
				<Button @click="handleAdd" class="search-btn" type="default" v-permission="this.$API.fieldManage.create">
					<Icon type="search"/>+ 添加字段
				</Button>
			</template>
		</field-component>
		<Drawer
			title="添加/编辑字段"
			v-model="drawerValue"
			width="480"
			:mask-closable="false"
			:styles="styles"
      >
			<Form :model="formData" :label-width="80" ref="formData">
				<FormItem 
					label="字段名称" 
					label-position="top"
					:rules="{required: true, message: '字段名称不能为空', trigger: 'blur'}"
					prop="fieldName">
					<Input v-model="formData.fieldName" placeholder="请输入字段名称"/>
				</FormItem>
				<FormItem 
					label="类型"
					:rules="{required: true, message:'请选择类型', trigger: 'change'}"
					label-position="top" 
					prop="type">
					<Select v-model="formData.type" placeholder="请选择类型">
						<Option value="text">文本</Option>
						<Option value="numerical">数值</Option>
						<Option value="image">图片</Option>
						<Option value="select">下拉</Option>
					</Select>
				</FormItem>
				<FormItem v-if="formData.type=='text'" label="字符长度" label-position="top" prop="text">
					<Input v-model="formData.text" key="text-length" placeholder="请输入长度"/>
				</FormItem>
			  <FormItem v-if="formData.type=='numerical'" label="字符长度" label-position="top" prop="number">
					<Input v-model="formData.number" key="code-length" placeholder="请输入长度"/>
				</FormItem>
				<template v-if="formData.type=='image'">
					<FormItem label="宽度限制" label-position="top">
						<Input v-model="formData.width" key="limit-width" placeholder="请输入宽度限制">
							<span slot="append">px</span>
						</Input>
					</FormItem>
					<FormItem label="高度限制" label-position="top">
						<Input v-model="formData.height" key="limit-height" placeholder="请输入高度限制">
							<span slot="append">px</span>
						</Input>
					</FormItem>
				</template>
				<template v-if="formData.type=='select'">
					<FormItem
						v-for="(item,index) in formData.keyWordAdd"
						:key="index"
						:label="`选项${index+1}`"
						:prop="'keyWordAdd.' + index + '.value'"
						:rules="{required: true, message: '选项不能为空', trigger: 'blur'}">
						<Row>
							<Col span="18">
								<Input type="text" v-model="item.value" placeholder="请输入"></Input>
							</Col>
							<Col span="4" offset="1">
								<Button @click="handleRemove(index)">删除</Button>
							</Col>
						</Row>
					</FormItem>
					<FormItem>
						<Row>
							<Col span="12">
								<Button type="dashed" long @click="handleAddItem" icon="md-add">添加选项</Button>
							</Col>
						</Row>
					</FormItem>
				</template>
				<FormItem label="是否必填">
					<Checkbox v-model="formData.required" :true-value="1" :false-value="0">必填</Checkbox>
				</FormItem> 
				 <FormItem>
					<Button style="margin-right: 8px" @click="handleCancle">取消</Button>
					<Button v-if="isCreate" type="primary" @click="handleSave('formData')">保存</Button>
					<Button v-else type="error" @click="handleEdit('formData')">修改</Button>
				</FormItem>
      </Form>
    </Drawer>
  </div>
</template>

<script>
import fieldComponent from './field-component.vue'
export default {
	name: 'field-page',
	components: {
			fieldComponent
	},
	data(){
		return {
			searchValue: '',
			drawerValue: false,
			isCreate: true,
			styles: {
					height: 'calc(100% - 55px)',
					overflow: 'auto',
					paddingBottom: '53px',
					position: 'static'
			},
			formData: {
				fieldId: '',
				fieldName: '',
				type: 'text',
				text: '',
				number: '',
				width: '',
				height: '',
				items: [],
				typeParameters: '',
				required: 0,
				index: 1,
				keyWordAdd: [],
			}
		}
	},
	methods: {
		handleCancle(){
			this.drawerValue = false
			try{
				this.$refs.formData.resetFields();
			} catch(e){
				console.log(e)
			}
		},
		handleAdd () {
			this.isCreate = true
			this.drawerValue = true
			this.formData.keyWordAdd=[{value: ''}]
			try{
				if(this.$refs.formData.resetFields()) {
					this.$refs.formData.resetFields();
				}
			} catch(e){
				console.log(e)
			}
		},
		dataForm () {
				const arr = []
				const type = this.formData.type
				if (type=='text') {
					this.formData.typeParameters = this.formData.text
				} else if(type=='numerical') {
					this.formData.typeParameters = this.formData.number
				} else if(type=='image') {
					this.formData.typeParameters = this.formData.width + ',' + this.formData.height
				} else if(type=='select') {
					this.formData.keyWordAdd.forEach((item, index) => {
						if (item.value) {
							arr.push(item.value)
							this.formData.typeParameters = arr.join(',')
						}
					})
				}
		},
		/**
		 * @description 创建保存表单
		 * @param null
		 */
		handleSave (name) {
			this.$refs[name].validate(async(valid) => {
				if (valid) {
					await this.dataForm()
					await this.$API.fieldManage.create(this.formData)
					this.drawerValue = false
					this.$refs.fld.getData()
				} else {
					this.$Message.error('请填写相对应的字段！');
				}
			})
		},
		/**
		 * @description 添加选项
		 * @param null
		 */
		handleAddItem () {
				this.formData.keyWordAdd.push({
					value: '',
				})
		},
		handleRemove (index) {
			if(index){
				this.formData.keyWordAdd.splice(index, 1)
			} else{
				this.$Message.info('至少输入一个选项值');
			}
			
		},
		/**
		 * @description 修改表单
		 * @param null
		 */
		async handleEdit (name) {
				this.$refs[name].validate(async(valid) => {
				if (valid) {
					this.dataForm()
					await this.$API.fieldManage.update(this.formData)
					this.drawerValue = false
					this.$refs.fld.getData()
				}else {
					this.$Message.error('请填写相对应的字段！');
				}
			})
		},
		/**
		 * @description 弹出编辑窗口
		 * @param null
		 */
		openDrawerEdit (data) {
			this.isCreate = false
			this.drawerValue = true
			this.formData = data
			this.formData.fieldId = data.fieldId
			this.$set(this.formData,'keyWordAdd',[{value: ''}])
			const type = this.formData.type
			if (type === 'text') {
				this.formData.text = this.formData.typeParameters
			} else if (type === 'numerical') {
				this.formData.number = this.formData.typeParameters
			} else if (type === 'image') {
				this.formData.width = this.formData.typeParameters.split(',')[0]
				this.formData.height = this.formData.typeParameters.split(',')[1]
			} else if (type === 'select') {
				this.formData.typeParameters.split(',').forEach((item, index) => {
				this.$set(this.formData.keyWordAdd, index, {
					value: item,
				})
			})}
		}
	},
	mounted () {
	}
}
</script>

<style lang="less">
.sf-card{
	margin-bottom:10px;
}
.search-con {
	padding: 10px 0;
	.search {
		&-col {
			display: inline-block;
			width: 200px;
		}
		&-input {
			display: inline-block;
			width: 200px;
			margin-left: 2px;
		}
		&-btn {
			margin-left: 2px;
		}
	}
}
.pages {
	padding: 10px 0;
	text-align: right;
}
.item-type {
	margin-bottom: 5px;
}

</style>
