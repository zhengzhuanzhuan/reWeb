<template>
	<div>
		<Tabs :value="tabName">
			<TabPane label="审核记录分配" name="1">
				<follow-up-record-distribute-normal></follow-up-record-distribute-normal>
			</TabPane>
			<TabPane label="外呼记录分配" name="2">
				<call-record-distribute/>
			</TabPane>
		</Tabs>
	</div>
</template>

<script>
// 审核记录分配
import followUpRecordDistributeNormal from './followUpRecordDistributeNormal'
import callRecordDistribute from './callRecordDistribute'
export default {
    name: 'followUpRecordDistribute',
    components: {
			followUpRecordDistributeNormal,
			callRecordDistribute
    },
    data () {
    	return {
    		tabName: '1'
        }
    },
    mounted () {

    }
}
</script>

<style scoped>

</style>
