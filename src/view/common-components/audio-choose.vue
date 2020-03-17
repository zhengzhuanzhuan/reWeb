<template>
	<div class="audio-choose">
		<Menu @on-select="handleTypeSelect" width="150px" :active-name="currentClassifyId" ref="menu">
			<MenuItem
				v-for="(item, index) in audioTypes"
				:name="item.classifyId"
				:key="index"
				:class="{'ivu-menu-item-active ivu-menu-item-selected': item.classifyId===currentClassifyId}"
			>
				{{item.classifyName}}
			</MenuItem>
		</Menu>
		<div class="table-wrapper">
			<Row class="user_main_search common_search" :gutter="20">
				<Col span="16">
					<span>名称</span>
					<Input v-model="searchParams.name"></Input>
				</Col>
				<Col span="4">
				<Button @click="handlePage(1)" type="primary" :loading="tableParams.isLoading">查询</Button>
				</Col>
			</Row>
			<div class="user_main_list">
				<Table :columns="config" :data="tableParams.data" :loading="tableParams.isLoading"></Table>
			</div>
			<Row class="user_main_page">
				<Page :total="tableParams.total" :page-size="searchParams.limit" show-total :current="searchParams.pager" @on-change="handlePage"></Page>
			</Row>
		</div>
	</div>
</template>

<script>
export default {
    name: 'audio-choose',
    props: {
        resetParams: {
            type: Boolean,
            default: false
        }
    },
    data () {
    	return {
    		currentClassifyId: '',
    		audioTypes: [],
            tableParams: {
                data: [],
                total: 0,
                isLoading: false
            },
            searchParams: {
    			name: '',
                pager: 1,
                limit: 10,
                sort: '', // 排序字段
                order: '' // 排序方式:降序 DESC 升序 ASC
            },
            config: [
                {
                    title: '名称',
                    key: 'name'
                },
                {
                    title: '内容',
                    key: 'content'
                },
                {
                    title: '操作',
                    key: 'action',
                    width: 80,
                    align: 'center',
                    render: (h, params) => {
                        return h('div', [
                            h(
                                'Button',
                                {
                                    props: {
                                        type: 'primary',
                                        size: 'small'
                                    },
                                    class: {
                                        // menuHide: this.menuShow(this.AM.Jur.updataPass)
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.$emit('chosen', params.row)
                                        }
                                    }
                                },
                                '选择'
                            )
                        ])
                    }
                }
            ]
        }
    },
    watch: {
    	resetParams () {
    		if (this.resetParams) {
    			this.searchParams.name = ''
                if (!this.audioTypes.length) {
                    this.getAudioTypes()
                } else {
                    this.currentClassifyId = this.audioTypes[0].classifyId
                    this.handlePage(1)
                }
            } else {
    			this.$refs.menu.updateActiveName()
            }
        }
    },
    methods: {
    	async getAudioTypes () {
            const res = await this.$API.proConfig.voiceSortList({
                pager: 1,
                limit: 999,
                classifyType: 1
            })
            res.data.push({
                classifyId: '',
                classifyName: '合成语音变量'
            })
            this.audioTypes = res.data
            this.currentClassifyId = this.audioTypes[0].classifyId
            this.handlePage(1)
        },
        /**
		 * @description 选择左侧类型
		 * @param id
		 */
        handleTypeSelect (id) {
        	this.currentClassifyId = id
            this.handlePage(1)
        },
        handlePage (page) {
        	this.searchParams.pager = page
        	if (this.currentClassifyId) {
        		this.handleQueryAudio()
            } else {
        		this.handleQueryVariable()
            }
        },
        /**
		 * @description 获取 合成语音变量list
		 */
        async handleQueryVariable () {
        	this.tableParams.isLoading = true
            const res = await this.$API.composeVoice.composeList({
                variableName: this.searchParams.name,
                ...this.searchParams
            }).catch(e => {
                this.tableParams.isLoading = false
            })
            const resArr = []
            res.data.forEach(item => {
            	resArr.push({
                    name: item.variableName,
                    content: item.correspondingField,
                    type: 2,
                    id: item.variableId,
                    value: item.correspondingField
                })
            })
            this.tableParams.data = resArr
            this.tableParams.total = res.total
            this.tableParams.isLoading = false
        },
        /**
		 * @description 获取 语音分类下的语音文件列表
		 */
        async handleQueryAudio () {
        	const res = await this.$API.proConfig.voiceList({
                classifyId: this.currentClassifyId,
                voiceName: this.searchParams.name,
                order: 'create_time asc',
                ...this.searchParams
            })
            const resArr = []
            res.data.forEach(item => {
                resArr.push({
                    name: item.voiceName,
                    content: item.content,
                    type: 1,
                    id: item.voiceId,
                    value: item.voicePath
                })
            })
            this.tableParams.data = resArr
            this.tableParams.total = res.total
            this.tableParams.isLoading = false
        }
    }
}
</script>

<style lang="less">
.audio-choose{
	overflow: auto;
	.ivu-menu{
		float: left;
	}
	.table-wrapper{
		margin-left: 152px;
	}
	.common_search{
		height: 70px;
	}
}
</style>
