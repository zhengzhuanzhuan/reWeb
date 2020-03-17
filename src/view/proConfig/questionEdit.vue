<template>
<div class="question-eidt">
	<Card>
		<p slot="title">基本信息</p>
		<Row :gutter="20">
			<Col span="24">
				<span>随访问题：</span>
				<span>{{baseInfo.questionName}}</span>
			</Col>
			<Col span="8">
				<span>分类：</span>
				<span>{{baseInfo.diseaseTypeName}}-{{baseInfo.diseaseName}}</span>
			</Col>
			<Col span="8">
				<span>关联指标：</span>
				<span>{{baseInfo.targetName}}</span>
			</Col>
			<Col span="8">
				<span>对话是否可打断：</span>
				<span>{{baseInfo.playWavOnly === 0 ? '是' : '否'}}</span>
			</Col>
			<Col span="24">
				<span>问题内容：</span>
				<span>{{baseInfo.questionContent}}</span>
			</Col>
			<Col span="24">
				<span>备注：</span>
				<span>{{baseInfo.remark}}</span>
			</Col>
		</Row>
	</Card>
	<Card style="margin-top: 8px;">
		<p slot="title">话术配置</p>
		<ul class="script">
			<li v-for="(item, index) in scriptArray" :key="index">
				<div class="script-title">处理{{index + 1}}</div>
				<Button icon="ios-close" type="text" class="script-delete" @click="handleDelete(index)" v-if="!item.hiddenDelete"></Button>
				<Form :label-width="80" class="script-form">
					<FormItem label="话术名称">
						<Input v-model="item.switchText"></Input>
					</FormItem>
					<Form :label-width="80">
						<FormItem label="指标值">
							<Input v-model="item.keyValue" :disabled="item.hiddenDelete"></Input>
						</FormItem>
					</Form>
					<FormItem label="判别规则">
						<Input v-model="item.switchRegexText" type="textarea"></Input>
					</FormItem>
				</Form>
			</li>
		</ul>
		<div>
			<Button style="margin-right: 16px;" @click="handleAdd">添加话术</Button>
			<Button type="primary" @click="handleSave">保存</Button>
		</div>
	</Card>
</div>
</template>

<script>
export default {
    name: 'questionEdit',
    data () {
    	return {
    		id: '',
            baseInfo: {},
            scriptArray: []
        }
    },
    methods: {
    	async getInfo () {
    		this.scriptArray = []
    		const res = await this.$API.questionEdit.info({ id: this.id })
            this.baseInfo = Object.assign(res.data.followupQuestion, this.baseInfo)
            const scriptArr = res.data.FollowupQuestionCallScript
            const optionsArr = res.data.followupTargetOption || []
            const optionsNameArr = []
            optionsArr.forEach(item => {
                optionsNameArr.push(item.optionValues)
            })
            if (scriptArr.length) {
    			scriptArr.forEach(item => {
    				if (optionsNameArr.indexOf(item.keyValue) !== -1) {
    					this.scriptArray.push({
                            hiddenDelete: true,
                            ...item
                        })
                    } else {
                        this.scriptArray.push(item)
                    }
                })
            } else {
                optionsArr.forEach(item => {
                	if (item.optionName === 'select') {
						this.scriptArray.push({
							questionId: this.id,
							keyName: this.baseInfo.targetName,
							keyValue: item.optionValues,
							switchRegexText: '',
							switchText: '',
							hiddenDelete: true
						})
					}
                })
            }
        },
        handleDelete (index) {
    		this.scriptArray.splice(index, 1)
        },
        handleAdd () {
            this.scriptArray.push({
                questionId: this.id,
                keyName: this.baseInfo.targetName,
                keyValue: '',
                switchRegexText: '',
                switchText: ''
            })
        },
        async handleSave () {
    		await this.$API.questionEdit.add({ questionId: this.id, followupQuestionCallScripts: this.scriptArray })
            this.$Message.success('保存成功！')
            this.$router.push({
                path: '/proConfig/questionManage'
            })
        }
    },
    mounted () {
    	const query = this.$route.query
    	this.id = query.questionId
        this.baseInfo = JSON.parse(JSON.stringify(query))
        this.getInfo()
    }
}
</script>

<style lang="less">
	.question-eidt{
		.script{
			max-height: 60vh;
			overflow: auto;
			li{
				list-style: none;
				border: 1px solid #e8eaec;
				position: relative;
				margin-bottom: 8px;
			}
			&-delete{
				font-size: 30px;
				height: 48px;
				padding: 0;
				position: absolute;
				right: 16px;
				top: 0;
			}
			&-delete:hover{
				background-color: #f8f8f9;
			}
			&-title{
				background-color: #f8f8f9;
				height: 48px;
				line-height: 48px;
				padding-left: 16px;
				border-bottom: 1px solid #e8eaec;
			}
			&-form{
				margin: 16px 16px 16px 0;
			}
		}
	}
</style>
