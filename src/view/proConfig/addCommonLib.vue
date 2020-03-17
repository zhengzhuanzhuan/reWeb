<template>
  <div class="addComLib">
    <div class="mesBolckAdd">
      <h3>通用库基本信息</h3>
      <Form ref="formValidate" :model="formValidate" :label-width="80">
        <FormItem label="通用库名称" prop="name">
          <Input v-model="formValidate.name" placeholder="请填写通用库名称"></Input>
        </FormItem>
        <FormItem label="通用库分类">
            <p>{{this.$route.params.classifyName}}</p>
        </FormItem>
         <FormItem label="通用库说明" prop="desc">
            <Input v-model="formValidate.remark" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="请填写通用库说明"></Input>
        </FormItem>
      </Form>
    </div>
    <div class="commonConfig">
      <h3>通用库配置</h3>
      <Card style="marginTop: 20px" v-for='(item,index) in dealTable' :key='index'>
        <p slot="title">处理{{index+1}}</p>
        <a href="#" slot="extra" @click="handleDeleteDeal(index)">X</a>
        <Form :label-width="80">
          <FormItem label="处理名称" prop="itemName">
              <Input v-model="item.itemName" placeholder="请填写处理名称"></Input>
          </FormItem>
          <FormItem label="判别规则" prop="regular">
              <Input v-model="item.regular" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="请填写判别规则"></Input>
          </FormItem>
          <FormItem label="AI语音">
            <div>
              <Tag
                v-for='(e, i) in item.AddVoiceListNum'
                type="border"
                closable
                :key='i'
                @on-close="handleClose(e,i,index)"
              >{{i+1}}<Divider type="vertical" />{{e.voiceName || e.correspondingField}}</Tag>
            </div>
            <Button @click="handleAddVoice(index)">添加语音</Button>   
          </FormItem>
          <FormItem label="判别处理" prop="handle">
            <RadioGroup v-model="item.handle">
              <Radio :label="1">返回对话</Radio>
              <Radio :label="2">结束对话</Radio>
            </RadioGroup>
          </FormItem>
        </Form>
      </Card>
      <div>
        <Button class="btnBlock" @click='handleAdd'>添加处理</Button>
        <Button type="primary" class="btnBlock" @click='handleSave'>保存</Button>
      </div>   
    </div>
    <Drawer title="语音添加" v-model="addVoiceAi" width='800px'>
      <div class='addVoiceDrawer'>
        <div>
          <h3 class="addVoiceHeader" >合成语音变量</h3>
          <p 
            class="addVoiceList" 
            @click='handleClickCompose'
            :style="voiceListIndex == '合成'? 'backgroundColor: #57a3f3;color: #fff': ' backgroundColor: #eee'"
            >合成语音</p>
          <h3 class="addVoiceHeader">本地语音</h3>
          <p 
            class="addVoiceList" 
            v-for="(item, index) in voiceSortNum"
            :key='index'
            :style="voiceListIndex == index? 'backgroundColor: #57a3f3;color: #fff': ' backgroundColor: #eee'"
            @click="handleSortList(item,index)"
            >{{item.classifyName}}</p>
        </div>
        <div class='addVoiceMain'>
          <div class='addVoiceMes'>
            <span>语音标题</span>
            <Input v-model="DrawerVoiceTitle" style="width: 200px;margin: 0 30px 0 20px"></Input>
            <Button type="primary" @click="handleSearch">查询</Button>
          </div>
          <div v-if='localListShow' class="voiceMes" v-for="(item,index) in voiceAiNum" :key='index'>
            <div class="voice1">
              <div class="voice2">
                <h3>{{item.voiceName}}</h3>
                <Button>本地语音</Button>
              </div>
              <Button 
                :type="item.isChosen? 'default' : 'primary'"
                :disabled='item.isChosen'
                @click='handleChoseLocal(item, index)'
                >{{item.isChosen ? '已选择': '选择'}}</Button>
            </div>
            <p>{{item.content}}</p>
          </div>
          <div v-if='composeListShow' class="voiceMes" v-for="(item,index) in componseVoiceNum" :key='index'>
            <div class="voice1">
              <div class="voice2">
                <h3>{{item.variableName}}</h3>
                <Button>合成语音</Button>
              </div>
              <Button 
                :type="item.isChosen? 'default' : 'primary'"
                :disabled='item.isChosen'
                @click='handleChoseCompose(item,index)'
              >{{item.isChosen? '已选择': '选择'}}</Button>
            </div>
            <p>{{item.correspondingField}}</p>
          </div>
        </div>
      </div>
    </Drawer>
  </div>
</template>
<script>
export default {
  name: 'addCommon',
  data(){
    return {
      followChose: '',
      AIVoiceLable: {},
      formValidate: {},
      DrawerVoiceTitle: '',
      drawerType: '',
      dealTable: [{
        AddVoiceListNum: []
      }],
      voiceAiNum: [],
      componseVoiceNum: [],
      addVoiceAi: false,
      voiceListIndex: '合成',
      AddVoiceIndex: null,
      voiceSortNum: [],
      composeListShow: true,
      localListShow: false,
      localClassifyId: '',
      AiWavParams: []
    }
  },
  methods: {
    formData (data, chosenData, dataName, chosenName) {
      data && data.forEach(item => {
          chosenData && chosenData.forEach(e=> {
            if(item[dataName] === e[chosenName]){
              item.isChosen = true
            } 
          })
      })
    return data
  },
    // 处理的添加
    handleAdd () {
      this.dealTable.push({
        AddVoiceListNum: []
      })
    },
    // 处理的删除
    handleDeleteDeal (index) {
      this.dealTable.splice(index, 1)
    },
     // 语音分类列表
    async handleVoiceSortList () {
      const res = await this.$API.proConfig.voiceSortList({
        pager: 1,
        limit: 999,
        classifyType: 1,
      })
      res.data.unshift({ classifyName: '全部', classifyId: '' })
      this.voiceSortNum = res.data
    },
    // 点击合成语音
    handleClickCompose () {
      this.voiceListIndex = '合成'
      this.composeListShow = true
      this.localListShow = false
    },
    // 点击语音分类的列表
    handleSortList (item, index) {
      this.localClassifyId= item.classifyId
      this.voiceListIndex = index
      this.composeListShow = false
      this.localListShow = true
      this.handleLocalVoice({classifyId: item.classifyId})
    },
    // 点击查询
    handleSearch () {
      this.handleLocalVoice()
      this.handleComposeVoice()
    },
      // 点击添加语音
    handleAddVoice (index) {
      this.addVoiceAi = true
      this.AddVoiceIndex = index
      this.handleLocalVoice()
      this.handleComposeVoice()
    },
    //本地语音列表
    async handleLocalVoice (params) {
      const res = await this.$API.proConfig.voiceList({
        pager: 1,
        limit: 999,
        voiceName: this.DrawerVoiceTitle,
        classifyId: this.localClassifyId,
        ...params,
      })
      this.voiceAiNum = this.formData(res.data, this.dealTable[this.AddVoiceIndex].AddVoiceListNum,'voiceName','voiceName')
    },
    // 合成语音列表
    async handleComposeVoice () {
      const res = await this.$API.composeVoice.composeList({
        pager: 1,
        limit: 999,
        variableName: this.DrawerVoiceTitle,
      })
      this.componseVoiceNum = this.formData(res.data, this.dealTable[this.AddVoiceIndex].AddVoiceListNum,'variableName','voiceName')
    },
   
    handleChoseCompose (item,index) {
      let copyData = JSON.parse(JSON.stringify(item))
      copyData.isChosen = !item.isChosen
      this.componseVoiceNum.splice(index, 1, copyData)
      this.dealTable[this.AddVoiceIndex].AddVoiceListNum.push({
        voiceName: copyData.variableName,
        voicePath: `${copyData.variableName}&${copyData.variableId}&${copyData.correspondingField}&${copyData.correspondingDescription}&${copyData.correspondingAttribute}`
      })
    },
    // 选择本地
    handleChoseLocal (item,index) {
      let copyData = JSON.parse(JSON.stringify(item))
      copyData.isChosen = !item.isChosen
      this.voiceAiNum.splice(index, 1, copyData)
      this.dealTable[this.AddVoiceIndex].AddVoiceListNum.push({
        voiceName: copyData.voiceName,
        voicePath: `${copyData.voiceName}&${copyData.voiceId}&${copyData.voicePath}`
      })
    },
    // 语音标签的删除
    handleClose (e, i, index) {
      this.dealTable[index].AddVoiceListNum.splice(i, 1)
    },
    async handleSave () {
      // 合成语音
      this.followChose = this.dealTable && this.dealTable.map((e, i) => (
        {
          itemName: e.itemName,
          regular: e.regular,
          aiWav: (e.AddVoiceListNum && e.AddVoiceListNum.map(e => e.voicePath)).join(),
          handle: e.handle,
          updateUserId: sessionStorage.getItem('rsysUserId')
        }
      ))
      if (this.drawerType === 'edit') {
        await this.$API.commonLib.commonEdit({
          ...this.formValidate,
          classifyId: this.$route.params.classifyId,
          'followupLibItems': this.followChose
        })
         this.$Message.success('通用库基本信息编辑成功')
         this.$router.push({
          name: 'commonManage',
          params: {
             classifyId: this.$route.params.classifyId,
             classifyName: this.$route.params.classifyName
          }
         })
      } else if (this.drawerType === 'add') {
        await this.$API.commonLib.commonAdd({
          ...this.formValidate,
          classifyId: this.$route.params.classifyId,
          'followupLibItems': this.followChose
        })
        this.$Message.success('通用库基本信息添加成功')
        this.$router.push({
          name: 'commonManage',
          params: {
             classifyId: this.$route.params.classifyId,
             classifyName: this.$route.params.classifyName
          }
         })
      }
    },
    async handleEditValue () {
      const res = await this.$API.commonLib.commonDetail({ id: this.$route.params.id })
      let rowDate = res.data.followupLib
      this.formValidate = JSON.parse(JSON.stringify(rowDate))
      const AIfollowNum = JSON.parse(JSON.stringify(res.data.followupLibItems))
      AIfollowNum && AIfollowNum.forEach((item, index) => {
        item.AddVoiceListNum = item.aiWav && item.aiWav.split(',').map(e => ({
          voiceName: e.split('&')[0],
          voicePath: e
        })) || []
      })
      AIfollowNum.length ? this.dealTable = AIfollowNum : this.dealTable = [{ AddVoiceListNum: [] }]
    }
  },
   mounted () {
    this.handleVoiceSortList()
    this.drawerType = this.$route.params.type
    if (this.$route.params.type === 'edit') {
      // 点击编辑的时候渲染的信息
     this.handleEditValue()
    }
  }
}
</script>
<style lang="less" scoped>
.addComLib{
  width: 100%;
  padding: 20px;
  background-color: #fff;
  .mesBolckAdd{
    border-bottom: 1px solid #ccc;
    margin-bottom: 20px;
    h3{
      margin-bottom: 20px;
    }
  }
  .commonConfig {
    h3{
      margin-bottom: 20px;
    }
    .btnBlock {
      margin: 20px;
    }
  }
}
.addVoiceDrawer {
  display: flex;
  .addVoiceList{
    width: 150px;
    height: 40px;
    line-height: 40px;
    cursor: pointer;
    text-align: center;
  }
  .addVoiceHeader{
    width: 150px;
    height: 40px;
    line-height: 40px;
    padding-left: 10px;
  }
  .addVoiceMain {
    margin-left: 10px;
    flex: 1;
    .addVoiceMes {
      display: flex;
      padding-bottom: 20px;
      border-bottom: 1px solid #ccc;
      span {
        margin-top: 6px;
      }
    }
    .voiceMes {
      padding: 15px 0;
      border-bottom: 1px solid #ccc;
      .voice1{
        display: flex;
        justify-content: space-between;
        .voice2 {
          display: flex;
          h3{
            margin: 6px 10px 0 0
          }
        }
      }
      p {
        margin-top: 10px
      }
    }
  }
}
</style>
<style lang="less">
.commonConfig {
  .ivu-card-head{
    background-color: #eee;
  }
}
</style>
