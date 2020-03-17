<template>
	<div class="dataCollectDetail">
		<Row class="user_main_search common_search" :gutter="20">
			<h2>{{name}}</h2>
			<Col span="9">
				<span>执行时间</span>
				<date-time-picker :timeBegin.sync="searchParams.dateEndBegin" :timeEnd.sync="searchParams.dateEndEnd" :is-default-today="true"></date-time-picker>
			</Col>
			<Col span="2">
				<Button @click="handleQuery" type="primary" :loading="tableParams.isLoading">查询</Button>
			</Col>
		</Row>
		<Card>
			<div class="user_main_list">
				<Table :columns="config" :data="tableParams.data" :loading="tableParams.isLoading"></Table>
			</div>
			<Button @click="handleExport" :disabled="!tableParams.data.length" class="margin-top-10" v-permission="this.$API.dataCollect.export">导出报表</Button>
		</Card>
	</div>
</template>

<script>
import dateTimePicker from '../common-components/date-time-picker'
export default {
    name: 'dataCollectDetail',
    components: {
    	dateTimePicker
    },
    data () {
    	return {
    		id: '',
            name: '',
            searchParams: {
                dateEndBegin: '',
                dateEndEnd: '',
                templateId: ''
            },
            tableParams: {
                data: [],
                total: 0,
                isLoading: false
            },
            config: [],
            tableHeaderData: [],
            isVertical: 0
        }
    },
    methods: {
        // 获取表头数据
        async handleQueryTableHeader () {
            const resColumns = await this.$API.dataCollect.columns({ templateId: this.id })
            resColumns.data.forEach(item => {
            	this.tableHeaderData.push(item.collectName)
            })
        },
        async handleQuery () {
            this.tableParams.isLoading = true
            if (!this.tableHeaderData.length) {
                this.handleQueryTableHeader()
            }
            const res = await this.$API.dataCollect.summary(this.searchParams).catch(e => {
                this.tableParams.isLoading = false
            })
            if (res.data.length) {
                if (this.isVertical == 0) {
                    this.formatHorizontalData(res.data)
                } else {
                    this.formatVerticalData(res.data)
                }
            } else {
                this.tableParams.data = []
            }
            this.tableParams.isLoading = false
        },
        /**
		 * @description 横向表格数据处理
		 * @param dbData
		 */
        formatHorizontalData (dbData) {
            let specialColumn = ''
            Object.keys(dbData[0]).forEach(key => {
                if (this.tableHeaderData.indexOf(key) === -1) {
                    specialColumn = key
                }
            })
        	this.config = [{
        		title: '数据项名称',
                key: 'name'
            }]
        	dbData.forEach((item, index) => {
        		this.config.push({
                    title: item[specialColumn],
                    key: `param${index}`
                })
            })
            const resData = []
            this.tableHeaderData.forEach(headerName => {
                const temp = {}
                dbData.forEach((item, index) => {
                    temp[`param${index}`] = item[headerName]
                })
                temp.name = headerName
                resData.push(temp)
            })
            this.tableParams.data = resData
        },
        /**
		 * @description 纵向表格数据处理
		 * @param dbData
		 */
        formatVerticalData (dbData) {
            let specialColumn = ''
            Object.keys(dbData[0]).forEach(key => {
            	if (this.tableHeaderData.indexOf(key) === -1) {
            		specialColumn = key
                }
            })
            this.config = [
                {
                    title: specialColumn,
                    key: specialColumn
                }
            ]
            this.tableHeaderData.forEach(item => {
                this.config.push({
                    title: item,
                    key: item
                })
            })
            this.tableParams.data = dbData
        },
        handleExport () {
    		let pendUrl = ''
            const data = this.searchParams
            for (let key in data) {
                pendUrl += key + '=' + (data[key] ? data[key] : '') + '&'
            }
    		window.open('/manage/reportSummaryTemplate/export?' + pendUrl)
        }
    },
    mounted () {
    	this.id = this.$route.query.id
        this.searchParams.templateId = this.$route.query.id
        this.name = this.$route.query.name
        this.handleQuery()
        this.isVertical = this.$route.query.isVertical
    }
}
</script>

<style lang="less">
	.dataCollectDetail{
		h2{
			margin-left: 20px;
			margin-bottom: 20px;
		}
	}
</style>
