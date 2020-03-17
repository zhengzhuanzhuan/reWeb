<template>
	<div>
		<Tabs :value="tabName">
			<TabPane label="审核记录查看" name="1">
				<follow-up-record-review :is-after-distribute="true"></follow-up-record-review>
			</TabPane>
			<TabPane label="外呼记录查看" name="2">
				<!-- 外呼块--睿狗 -->
				<call-data-look></call-data-look>
			</TabPane>
		</Tabs>
	</div>
</template>
<script>
// 审核数据查看
import followUpRecordReview from './followUpRecordReview'
import callDataLook from './callDataLook'
export default {
    name: 'outSideCall',
    components: {
        followUpRecordReview,
        callDataLook
    },
    data () {
        return {
            tabName: '1'
        }
    }
}
</script>

<style lang="less" scoped>

</style>
