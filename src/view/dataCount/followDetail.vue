<template>
  <div class="followDetail">
    <h2>随访数据列表</h2>
      <Row :gutter="30">
        <Col 
          span="6" 
          class="followCard"
          v-for="(item, index) in followListData"
          :key='index'>
          <Card>
            <div @click="handleCard(item.mouldId)">
              <h3>{{item.mouldName}}</h3>
              <p>{{item.remark||'暂无备注'}}</p>
            </div>
          </Card>
        </Col>
    </Row>
  </div>
</template>
<script>
export default {
  name: 'followDetail',
  data(){
    return{
      followListData: [],
    }
  },
  methods:{
    async handleFollowList(){
      const res = await this.$API.followTemp.followTempList({
        isEnable: 0,
        offset: 1,
        limit: 9999,
      })
      this.followListData=res.data
    },
    handleCard(id){
      this.$router.push({
        path:'/dataCount/dataDetail',
        query: {
          id
        }
      })
    }
  },
  mounted(){
    this.handleFollowList()     
  }
}
</script>
<style lang="less" scoped>
.followDetail{
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


