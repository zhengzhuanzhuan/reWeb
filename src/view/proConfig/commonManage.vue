<template>
  <div class="voice">
    <Row>
      <Col span="4" class="voice-Left">
        <h2>通用库分类</h2>
         <Row style="marginBottom: 20px">
          <Col style='marginTop: 10px' span="6">
            <span>通用库分类</span>
          </Col>
          <Col span="18">
            <Input
              search
              enter-button
              v-model="SearchName"
              placeholder="请输入通用库分类"
              @on-search='handleSearchSort'
              />
          </Col>
        </Row>
        <div v-for="(item,index) in voiceSortNum" :style="voiceSortIndex == index? 'color: #57a3f3': 'color: #333'" class='leftList'>
          <div @click="handleVoiceSort(item, index)">
            <Icon type="ios-folder"/>
            <span>{{item.classifyName}}</span>
          </div>
          <p v-show='item.remove == 1' @click='handleDelSort(item)'>X</p>
        </div>
        <div class="addSort" @click='addVoiceDrawer = true' v-permission="this.$API.proConfig.addVoiceSort">
          +添加通用库分类
        </div>
      </Col>
      <Col span="20" class="voice-Right">
        <h2>{{classifyName}}</h2>
        <Row class='common_search' :gutter="20">
          <Col span="7">
            <span>通用库名称</span>
            <Input v-model='commonTitle' placeholder="请输入通用库名称" style="width: 200px" />
          </Col>
          <Col span="2">
            <Button type="primary" @click='handlePageCurrent(1)' v-permission="this.$API.commonLib.commonList">查询</Button>
          </Col>
          <Col span="3">
            <Button @click="handleAddEdit('', 'add')" v-permission="this.$API.commonLib.commonAdd">添加通用库</Button>
          </Col>
          <Col span="2">
            <Upload
              name="file"
              :format="['xml']"
              action="/import/lib"
              :data="{classifyId}"
              :on-success='handleSuccess'
              :show-upload-list="false"
              :on-format-error="handleFormatError">
                <Button icon="ios-cloud-upload-outline" v-permission="this.$API.commonLib.commonImport">导入通用库</Button>
            </Upload>
          </Col>
        </Row>
        <Table :columns="columns" :data="tableData"></Table>
        <Page
          :total='total'
          :current='pageData.pager'
          :page-size='pageData.limit'
          show-sizer 
          show-total
          @on-change='handlePageCurrent'
          @on-page-size-change='handlePageSize'
        />
      </Col>
    </Row>
    <Drawer title="添加通用库分类" :closable="false" v-model="addVoiceDrawer" width='500'>
      <div class="addSortDrawer">
        <span>分类名称</span>
        <Input v-model="addSortName" placeholder="请输入分类名称" style="width: 250px" />
      </div>
      <Button type="primary" style="margin:20px 35%" @click='handleAddSort'>保存</Button>
    </Drawer>
  </div>
</template>
<script>
export default {
  name: 'outSideCall',
  data(){
    return {
      addSortName: '',
      SearchName:'',
      commonTitle: '',
      total:10,
      tableData: [],
      voiceSortIndex: null,
      columns: [
        {
          title: '通用库名称',
          key: 'name'
        },
        {
          title: '通用库说明',
          key: 'remark'
        },
        {
          title: '操作',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'text',
                  size: 'small',
                },
                style: {
                  marginRight: '5px',
                },
                directives: [
                  {
                    name: 'permission',
                    value: this.$API.commonLib.commonExport
                  }
                ],
                on: {
                  click: () => {
                    this.handleDownLoad(params.row.libId)
                  }
                }
              }, '下载通用库'),
               h('Button', {
                props: {
                  type: 'text',
                  size: 'small',
                },
                style: {
                  marginRight: '5px',
                },
                directives: [
                  {
                    name: 'permission',
                    value: this.$API.commonLib.commonEdit
                  }
                ],
                on: {
                  click: () => {
                    this.handleAddEdit(params.row, 'edit')
                  }
                }
              }, '编辑'),
              h('Button', {
                props: {
                  type: 'text',
                  size: 'small'
                },
                directives: [
                  {
                    name: 'permission',
                    value: this.$API.commonLib.commonDelete
                  }
                ],
                on: {
                  click: () => {
                    this.handleDelete(params.row.libId)
                  }
                }
              }, '删除')
            ]);
          }
        }
      ],
      pageData: {
        pager: 1,
        limit:　10,
      },
      addVoiceDrawer: false,
      formValidate: {},
      voiceSortNum: [],
      classifyId: null,
      classifyName: '',
    }
  },
  methods: {
      // 点击语音分类查询表格
    handleVoiceSort(data, index){
      this.voiceSortIndex = index
      this.classifyId = data.classifyId
      this.classifyName = data.classifyName
      this.handleCommonList({classifyId: data.classifyId})
    },
    // 语音分类列表
    async handleSortList(params){
      const res = await this.$API.proConfig.voiceSortList({
        pager: 1,
        limit: 999,
        classifyType: 2,
        ...params
      })
      this.voiceSortNum = res.data
      if(this.$route.params.classifyId){
        this.classifyId=this.$route.params.classifyId
        this.classifyName=this.$route.params.classifyName
        res.data.forEach((e,i)=> {
          if(e.classifyId==this.$route.params.classifyId){
            this.voiceSortIndex = i
          }
        })
       } else {
        this.classifyId = res.data[0].classifyId
        this.classifyName = res.data[0].classifyName
        this.voiceSortIndex= 0
       }
       this.handleCommonList()
    },
    // 语音分类的搜索
    handleSearchSort(){
      this.handleSortList({classifyName: this.SearchName})
    },
    // 删除语音分类
    async handleDelSort(data){
      await this.$API.proConfig.DelVoiceSort({
        id: data.classifyId,
        classifyName: data.classifyName,
        updateUserId: data.updateUserId,
      })
      this.$Message.success('语音分类删除成功');
      this.handleSortList()
    },
    // 添加语音分类
    async handleAddSort(){
      await this.$API.proConfig.addVoiceSort({
        classifyType: 2,
        classifyName: this.addSortName
      })
      this.addVoiceDrawer = false
      this.addSortName=''
      this.$Message.success('通用库分类添加成功');
      this.handleSortList()
    },
    // 表格数据
    async handleCommonList(params){
      const res = await this.$API.commonLib.commonList({
        ...this.pageData,
        classifyId: this.classifyId,
        name: this.commonTitle,
        ...params
      })
      this.total = res.total
      this.tableData = res.data
    },
     // 页码
    handlePageCurrent(pager){
      this.pageData.pager = pager
      this.handleCommonList({pager})
    },
    handlePageSize(limit){
      this.pageData.limit= limit
      this.handleCommonList({limit})
    },
    // 下载通用库
     handleDownLoad(data){
      window.open(`/export/lib/${data}`)
    },
    // 删除
    handleDelete(id){
      this.$Modal.confirm({
        title: '删除提示',
        content: "<p>确定要删除该条记录吗</p>",
        onOk: async () => {
          await this.$API.commonLib.commonDelete({id})
          this.$Message.success('该条信息已删除')
          this.handleCommonList({pager: 1})
        }
      })
    },
    handleFormatError(){
      this.$Message.warning('请导入XML格式的文件')
    },
    handleSuccess(response){
      if(response.code==1){
        this.$Message.error(response.message)
      } else{
        this.$Message.success(response.message)
      }
      
    },
     // 编辑和添加
    handleAddEdit(data, type){
     this.$router.push({
        name: `addCommonLib`,
        params: {
          id: data.libId,
          type,
          classifyId: this.classifyId || data.classifyId,
          classifyName: this.classifyName,
        }
      }) 
    }
  },
  mounted(){
    this.handleSortList()
  }
}
</script>
<style lang="less" scoped>
  .voice {
    width: 100%;
    height: 100%;
    padding: 20px;
    background-color: #fff;
    h2{
      margin-bottom: 10px;
    }
    &-Left{
      height: 100%;
      border-right: 1px solid #ccc;
      padding-right: 20px;
      .leftList {
        height: 30px;
        display: flex;
        cursor: pointer;
        justify-content: space-between;
        span {
          margin-left: 10px;
        }
      }
      .addSort {
        border: 1px solid #ccc;
        text-align: center;
        padding: 6px;
        font-size: 14px;
        color: #333;
        margin-top: 20px;
        cursor: pointer;
      }
    } 

    &-Right{
      padding-left: 20px;
    }
  }
  .upLoadVoice {
    width: 100%;
    height: 125px;
    padding: 10px;
    background: rgb(242,242,242);
    border:1px solid rgb(228,228,228);
    p{
      font-size: 12px;
      color:#999;
    }
    span{
      display: block;
      color: #333;
      font-size: 14px;
    }
  }
  .addSortDrawer {
    margin: 20px;
    span {
      margin-right: 10px;
    }
  }
</style>


