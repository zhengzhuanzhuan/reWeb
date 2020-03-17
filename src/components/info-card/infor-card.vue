<template>
  <Card :shadow="shadow" class="info-card-wrapper card-margin" :padding="0">
    <div class="content-con">
      <div class="left-area" :style="{background: color, width: leftWidth}">
        <img :src="icon" alt="图标">
      </div>
      <div class="right-area">
        <div>
          <slot></slot>
        </div>
      </div>
    </div>
  </Card>
</template>

<script>
// import CommonIcon from '_c/common-icon'
export default {
  name: 'InforCard',
  // components: {
  //   CommonIcon
  // },
  props: {
    left: {
      type: Number,
      default: 80
    },
    color: {
      type: String,
      default: '#2d8cf0'
    },
    icon: {
      type: String,
      default: ''
    },
    iconSize: {
      type: Number,
      default: 25
    },
    shadow: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    leftWidth () {
      return `${this.left}px`
    }
    // rightWidth () {
    //   return `${100 - this.left}%`
    // }
  }
}
</script>

<style lang="less">
.common{
  // float: left;
  height: 100%;
  display: table;
  // text-align: center;
}
.size{
  width: 100%;
  height: 100%;
}
.middle-center{
  display: table-cell;
  vertical-align: middle;
}
.card-margin {
  margin-left: 10px;
}
.info-card-wrapper{
  .size;
  overflow: hidden;
  .ivu-card-body{
    .size;
  }
  .content-con{
   display: flex;
    .size;
    padding: 15px;
    position: relative;
    .left-area{
      border-radius: 8%;
       .common;
      display: flex;
      justify-content: center;
      align-items: center;
      // & > .icon{
        // .middle-center;
      // }
    }
    .right-area{
      padding-left: 10px;
      .common;
      & > div{
        .middle-center;
      }
    }
  }
}
</style>
