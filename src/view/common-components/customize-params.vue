<template>
  <div class="customize-params">
    <Form :label-width="120">
      <template v-for="(item, index) in customParamsArray">
        <FormItem
          :label="item.fieldName"
          :required="item.required === 1"
          :key="item.fieldId"
          v-if="item"
        >
          <Input v-model.trim="item.value" v-if="item.type==='text'" :disabled="!showDelete"></Input>
          <InputNumber
            v-model="item.value"
            v-else-if="item.type==='numerical'"
            :disabled="!showDelete"
          ></InputNumber>
          <!-- <Select v-model="item.value" v-else-if="item.type==='select'" :disabled="!showDelete">
            <template v-if="item.typeParameters">
              <Option
                v-for="(opt, optIndex) in item.typeParameters.split(',')"
                :value="opt"
                :key="optIndex"
              >{{ opt }}</Option>
            </template>
            <Option v-else value>暂无选项</Option>
          </Select> -->
          <Upload
            v-else
            action="/temp/posts/"
            :max-size="100"
            :show-upload-list="true"
            :format="['jpg','jpeg','png']"
            :before-upload="handleOtherImgUpload"
            :on-format-error="handleImgFormatError"
          >
            <Button
              icon="ios-cloud-upload-outline"
              @click="getParamUploadIndex(index)"
              :disabled="!showDelete"
            >上传图片</Button>
          </Upload>
          <Button
            icon="ios-close"
            shape="circle"
            class="delete-btn"
            @click="handleDelete(index)"
            v-if="showDelete"
          ></Button>
          <img v-if="customParamsImgs[index]" :src="customParamsImgs[index]" class="user-logo" />
        </FormItem>
      </template>
      <FormItem>
        <Button @click="handleAddParams" v-show="showDelete">添加字段</Button>
      </FormItem>
    </Form>
    <!--基本信息-添加字段 按钮点击后的弹框-->
    <Drawer
      title="添加字段"
      :mask-closable="false"
      v-model="showDrawer"
      width="560"
      class-name="field-drawer"
    >
      <field-component ref="fld" @closeDrawerField="baseInfoOtherParam" :is-normal="false"></field-component>
    </Drawer>
  </div>
</template>

<script>
import fieldComponent from '@/view/organization/field-component.vue'
export default {
  name: 'customize-params',
  components: {
    fieldComponent
  },
  data () {
    return {
      showDrawer: false,
      customParamsArray: [], // 选择的自定义添加字段
      customParamsFiles: {},
      customParamsImgs: {},
      currentCustomUploadIndex: 0
    }
  },
  props: {
    baseParamsArray: {
      // 左侧选中的组织信息
      type: Array,
      default: function () {
        return []
      }
    },
    showDelete: {
      // 查看时，设置为false，input置为disable,不显示 删除 按钮
      type: Boolean,
      default: true
    }
  },
  watch: {
    baseParamsArray (val) {
			console.log(val, 'eeeeee')
      this.customParamsArray = []
      this.customParamsImgs = {}
      this.customParamsFiles = {}
      val.forEach((item, index) => {
        if (item) {
          const temp = {
            fieldId: item.fieldId,
            fieldName: item.fieldName,
            code: item.fieldCode,
            sort: item.fieldSort,
            type: item.fieldType,
            value: item.fieldValue,
            fieldDynamicId: item.fieldDynamicId,
            extendObjectId: item.extendObjectId
          }
          // 遍历获取选项的option值
          if (item.fieldType === 'select') {
            this.$API.fieldManage
              .list({ fieldId: item.fieldId, limit: 9999 })
              .then(res => {
                temp.typeParameters = res.data[0].typeParameters
                this.$set(this.customParamsArray, index, temp)
              })
          } else {
            if (item.fieldType === 'numerical') {
              temp.value = temp.value - 0
            }
            if (item.fieldType === 'image') {
              this.$set(this.customParamsImgs, index, item.fieldValue)
            }
            this.$set(this.customParamsArray, index, temp)
          }
        }
      })
    }
  },
  methods: {
    returnData () {
      const temp = {
        paramArray: this.customParamsArray,
        fileArray: this.customParamsFiles
      }
      let imgCount = 0
      this.customParamsArray.forEach(item => {
        if (item && item.type === 'image' && !item.value) {
          imgCount++
        }
      })
      if (Object.keys(temp.fileArray).length < imgCount) {
        this.$Message.warning(
          '自定义的图片类型字段，必须上传图片！请先上传对应图片'
        )
        return null
      }
      return temp
    },
    /**
     * @description tab 1 添加字段  按钮
     */
    handleAddParams () {
      this.showDrawer = true
      this.$refs.fld.clearNameSearch()
    },
    /**
     * @description 添加字段  块的  图片上传前的处理
     */
    handleOtherImgUpload (file) {
      // upload 的max-size属性无效
      if (file.size > 1024 * 500) {
        this.$Message.warning('图片文件的大小不能超过500kb，请重新选择图片！')
        return false
      }
      const CURRENT_INDEX = this.currentCustomUploadIndex
      // 将文件转成base64预览
      const _this = this
      try {
        let reader = new FileReader()
        reader.onload = function () {
          _this.$set(_this.customParamsImgs, CURRENT_INDEX, this.result)
        }
        reader.readAsDataURL(file)
      } catch (e) {
        console.error(e)
      }
      this.customParamsArray[CURRENT_INDEX].value = ''
      this.customParamsFiles[CURRENT_INDEX] = file
      return false
    },
    /**
     * @description 上传图片 格式错误提醒
     */
    handleImgFormatError () {
      this.$Message.warning(
        '图片文件目前仅支持jpg,jpeg,png格式的图片，请重新选择图片！'
      )
    },
    /**
     * @description 自定义字段时，记录其index
     * @param index
     */
    getParamUploadIndex (index) {
      this.currentCustomUploadIndex = index
    },
    /**
     * @description 添加字段  弹框方法
     * @param data
     */
    baseInfoOtherParam (data) {
      // console.log(data)
      const paramsLength = this.customParamsArray.length
      for (let i = 0; i < paramsLength; i++) {
        if (
          this.customParamsArray[i] &&
          data.fieldId === this.customParamsArray[i].fieldId
        ) {
          this.$Message.warning('您已添加过该字段！')
          return false
        }
      }
      data.value = data.type === 'numerical' ? 0 : ''
      this.showDrawer = false
      this.customParamsArray.push(data)
    },
    /**
     * @description 删除某个字段
     */
    handleDelete (index) {
      this.$Modal.confirm({
        title: '提示',
        content: '确定删除该字段吗？',
        onOk: () => {
          this.$set(this.customParamsArray, index, null)
          if (this.customParamsImgs[index]) {
            this.$set(this.customParamsImgs, index, '')
          }
          this.$Message.success('删除成功')
        }
      })
    }
  }
}
</script>

<style>
.field-drawer {
  z-index: 1001;
}
</style>
<style lang="less" scoped>
.ivu-form-item {
  width: 480px;
  position: relative;
  .delete-btn {
    position: absolute;
    right: -60px;
    top: 0;
  }
  .user-logo {
    width: 60px;
    height: 60px;
    position: absolute;
    left: 120px;
    top: 0;
  }
}
</style>
