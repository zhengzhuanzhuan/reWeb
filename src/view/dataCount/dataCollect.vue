<template>
	<div class="dataCollect">
		<h2>统计列表</h2>
		<Row :gutter="30">
			<Col
				span="6"
				class="followCard"
				v-for="(item, index) in followListData"
				:key="index"
			>
				<Card>
					<div @click="handleCard(item.templateId, item.templateName, item.isVertical)">
						<h3>{{item.templateName}}</h3>
						<p>{{item.remark||'暂无备注'}}</p>
					</div>
				</Card>
			</Col>
		</Row>
	</div>
</template>
<script>
export default {
    name: 'dataCollect',
    data () {
        return {
            followListData: []
        }
    },
    methods: {
        async handleFollowList () {
            const res = await this.$API.dataCollect.list({
                pager: 1,
                limit: 9999,
                isEnable: 0
            })
            this.followListData = res.data
        },
        handleCard (id, name, isVertical) {
            this.$router.push({
                path: '/dataCount/dataCollectDetail',
                query: {
                    id,
                    name,
                    isVertical
                }
            })
        }
    },
    mounted () {
        this.handleFollowList()
    }
}
</script>
<style lang="less" scoped>
	.dataCollect{
		height: 100%;
		padding: 20px;
		background-color: #fff;
		h2{
			margin-bottom: 20px;
		}
		.followCard {
			margin-bottom: 20px;
			h3{
				margin-bottom: 10px;
			}
		}
	}
</style>
