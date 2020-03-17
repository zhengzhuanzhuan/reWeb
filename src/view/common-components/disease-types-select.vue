<template>
	<Row style="width: 100%;" :gutter="20">
		<Col span="10">
			<Select v-model="firstSelectValue" clearable @on-change="handleFirstSelect">
				<Option v-for="(item, index) in firstOptions" :value="item.paramId" :key="index">{{ item.paramName }}</Option>
			</Select>
		</Col>
		<Col span="13">
			<Select
				class="second-select"
				ref="remoteSelect"
				v-model="secondSelectValue"
				:multiple="isMultiple"
				:clearable="!isMultiple"
				filterable
				remote
				:remote-method="remoteMethod"
				:loading="loading">
				<Option v-for="option in secondOptions" :value="option.paramId" :key="option.paramId">{{option.paramName}}</Option>
			</Select>
		</Col>
	</Row>
</template>

<script>
import { debounce } from '@/libs/businessUtil'
export default {
    name: 'disease-types-select',
    props: {
        isMultiple: {
            type: Boolean,
            default: true
        },
        isChange: {
            type: Boolean,
            default: false
        },
        firstValue: {
            type: String,
            default: ''
        },
        secondValue: {
            type: Array,
            default: function () {
                return []
            }
        }
    },
    data () {
    	return {
    		firstOptions: [],
    		firstOptionsObj: {},
            secondOptions: [],
            secondOptionsObj: {},
            firstSelectValue: '',
            secondSelectValue: this.isMultiple ? [] : '',
            loading: false,
            secondSelectedArr: []
        }
    },
    watch: {
        isChange: function (val) {
        	try {
                this.$refs.remoteSelect.setQuery(null)
            } catch (e) {
                console.log(e)
            }
        	// todo 优化，firstOptions数据获取慢时会有问题
        	setTimeout(() => {
                this.firstSelectValue = this.firstValue
                this.secondOptions = this.secondValue
                this.secondSelectValue = []
                this.secondValue.forEach(item => {
                    this.secondOptionsObj[item.paramId] = item.paramName
                    this.secondSelectValue.push(item.paramId)
                })
            }, 200)
        }
    },
    methods: {
    	async getFirstOptionsData () {
    		this.firstOptions = []
            this.firstOptionsObj = {}
    		const res = await this.$API.systemParamManage.list({ limit: 10000, pager: 1, paramTypeCode: 'followUpType' })
            this.firstOptions = res.data
            res.data.forEach(item => {
                this.firstOptionsObj[item.paramId] = item
            })
        },
        async queryMethod (query) {
    		query = query.split('|')[0]
            this.loading = true
            const res = await this.$API.diseaseManage.list({ limit: 10000, pager: 1, typeCode: this.firstOptionsObj[this.firstSelectValue].paramCode, icdName: query }).catch(e => {
                this.loading = false
            })
            this.secondOptions = []
            // iview 中，会根据query的值和option中的文字，再筛选一遍，导致输入 助记码时，虽然后端数据不为空，但当输入框内容不为空时，下拉框选项仍然是无数据
            res.data.forEach(item => {
                item.paramId = item.diseaseId
                // item.paramName = item.icdName
                item.paramName = `${item.icdName}|${item.zjm}`
                this.secondOptionsObj[item.paramId] = item
            })
            this.secondOptions = res.data
            this.loading = false
        },
        remoteMethod (query) {
    		if (!this.firstSelectValue) {
    			this.$Message.warning('请先选择第一项')
                this.$refs.remoteSelect.setQuery(null)
                return false
            }
    		if (query !== '') {
                const debounceAjax = debounce(this.queryMethod, 500)
                debounceAjax(query)
            } else {
    			this.secondOptions = []
            }
        },
        handleFirstSelect () {
            this.secondOptions = []
            this.secondSelectValue = this.isMultiple ? [] : ''
            this.$refs.remoteSelect.setQuery(null)
        },
        /**
		 * @description 供父组件调用
		 * @return {{firstData: *, secondData: Array}}
		 */
        getSelectedData () {
    		const res = {
    			firstData: this.firstOptionsObj[this.firstSelectValue] || '',
                secondData: this.isMultiple ? [] : {}
            }
            if (this.isMultiple) {
                this.secondSelectValue.forEach(item => {
                    res.secondData.push(this.secondOptionsObj[item])
                })
            } else {
    			res.secondData = this.secondOptionsObj[this.secondSelectValue] || ''
            }
            // 去除加上的助记码
            // console.log(res)
            if (res.secondData) {
    			if (res.secondData instanceof Array) {
                    res.secondData.forEach(item => {
                    	if (typeof item !== 'string') {
                            item.paramName = item.paramName.split('|')[0]
                        }
                    })
                } else {
    				if (res.secondData.paramName) {
                        res.secondData.paramName = res.secondData.paramName.split('|')[0]
                    }
                }
            }
            // console.log(res)
            return res
        }
    },
    created () {
    	this.getFirstOptionsData()
    }
}
</script>

<style lang="less">
	.second-select >.ivu-select-selection{
		height: auto;
		max-height: 200px;
		overflow-y: auto;
	}
</style>
