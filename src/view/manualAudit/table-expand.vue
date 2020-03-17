<template>
    <div>
        <Row class="expand-row">
            <table style="width:100%">
                <tr class="ivu-table-row" v-for="item in data" :key="item.id">
                    <td class="">
                        <div class="ivu-table-cell">
                            <span>{{item.brxm}}</span>
                        </div>
                    </td>
                    <td class="">
                        <div class="ivu-table-cell">
                            <span>{{item.mobile}}</span>
                        </div>
                    </td>
                    <td class="">
                        <div class="ivu-table-cell">
                            <span>{{item.icdName}}</span>
                        </div>
                    </td>
                    <td class="">
                        <div class="ivu-table-cell">
                            <span>{{item.schemeName}}</span>
                        </div>
                    </td>
                    <td class="">
                        <div class="ivu-table-cell">
                            <span>{{item.statusName}}</span>
                        </div>
                    </td>
                    <td class="" style="width: 160px">
                        <div class="ivu-table-cell">
                            <span>{{item.dateAdd}}</span>
                        </div>
                    </td>
                    <td class="" style="width: 160px">
                        <div class="ivu-table-cell">
                            <span>{{item.followupStartTime}}</span>
                        </div>
                    </td>
                    <td class="">
                        <div class="ivu-table-cell">
                            <span>{{item.userName}}</span>
                        </div>
                    </td>
                    <td class="">
                        <div class="ivu-table-cell">
                            <span>{{item.cancleUser}}</span>
                        </div>
                    </td>
                    <td class="ivu-table-column-center" style="width:120px">
                        <div class="ivu-table-cell">
							<Button @click="handleOperation(item)" type="warning" size="small" v-show="item.status == 2">终止</Button>
							<Button @click="handleOperation(item)" type="primary" size="small" v-show="item.status == 0">排期</Button>
							<Button @click="handleOperation(item)" type="default" size="small" v-show="item.status == 4">终止详情</Button>
                        </div>
                    </td>
                </tr>
            </table>
        </Row>
    </div>
</template>
<script>
export default {
    props: {
        data: Array
    },
    data () {
    	return {

        }
    },
    methods: {
        handleOperation (rowData) {
        	this.$emit('handleOperation', rowData)
        }
    }
}
</script>
