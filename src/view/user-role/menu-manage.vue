<style lang="less" scoped>
  .single-page{
    height: 100%;
  }
  .iconfont{
	  font-size: 12px;
  }
  .menu{
    height: 100%;
    background-color: white;
    overflow: auto;
    &-left{
      display: inline-block;
      float: left;
      position: relative;
		height: 100%;
		.ivu-menu{
			max-height: calc(~'100% - 70px');
			overflow-y: auto;
		}
      h3{
        font-size: 18px;
        padding: 20px;
      }
      &-shrink{
        position: absolute;
        right: 0;
        top: 17px;
      }
      &-expand{
        margin-top: 15px;
      }
    }
    &-main{
      height: 100%;
      overflow-y: auto;
      border-left: 1px solid #eeeeee;
      padding: 30px;
		position: relative;
		.ivu-tree {
			max-height: calc(~'100% - 50px');
			overflow-y: auto;
			overflow-x: hidden;
			padding-right: 15px;
		}
      h3{
        font-size: 18px;
        padding-bottom: 20px;
      }
      &-topBtn{
        position: absolute;
        right: 57px;
        top: 25px;
      }
    }
  }
  .drawer-form {
    .ivu-form-item-label{
      width: 70px;
      float: left;
    }
    .ivu-form-item-content{
      margin-left: 70px;
    }
  }
</style>

<template>
  <div class="menu">
    <div class="menu-left">
      <h3 v-show="menuWidth === '200px'">系统列表</h3>
      <Button icon="ios-arrow-back" type="text" @click="menuWidth='0px'" class="menu-left-shrink" v-show="menuWidth === '200px'"></Button>
      <Button icon="ios-arrow-forward" type="text" @click="menuWidth='200px'" class="menu-left-expand" v-show="menuWidth === '0px'"></Button>
      <Menu :active-name="chosenSystem" :width="menuWidth" @on-select="handleChooseSystem" v-show="menuWidth === '200px'">
        <MenuItem  v-for="(item, index) in systemList" :name="index" :key="item.systemId" :class="{'ivu-menu-item-active ivu-menu-item-selected': chosenSystem === index && index === 0}">
          {{item.title}}
        </MenuItem>
      </Menu>
    </div>
    <div class="menu-main" v-if="systemList.length">
      <h3>{{systemList[chosenSystem].title}}-菜单功能列表</h3>
      <Button type="primary" @click="handleAddEdit('', 'add')" class="menu-main-topBtn" v-permission="this.$API.menuManage.add">添加菜单</Button>
      <Tree :data="menuList" :render="renderContent"></Tree>
    </div>
    <!--弹框-->
    <Drawer
            :title="drawerType==='add'?'添加菜单':drawerType==='edit'?'编辑菜单':'查看菜单'"
            v-model="isDrawerShow"
            width="30"
            :mask-closable="false"
            @on-close="resetForm"
    >
      <Form :model="formData" :rules="validate.menuEdit" ref="form" class="drawer-form" :label-width="80">
        <FormItem label="菜单名称" prop="menuName">
          <Input v-model="formData.menuName" :disabled="drawerType==='detail'" />
        </FormItem>
        <FormItem label="菜单类型">
          <Select v-model="formData.menuType" :disabled="drawerType==='detail'" @on-change="handleMenuTypeChange">
            <Option value=0>菜单</Option>
            <Option value=1>页面</Option>
            <Option value=2>按钮</Option>
          </Select>
        </FormItem>
        <FormItem label="上级菜单">
          <!--<Input v-model="formData.parentMentName" disabled />-->
			<Cascader :data="menuCascaderData" change-on-select @on-change="handleParentSelect" :value="editParentArray" :disabled="drawerType==='detail'"></Cascader>
        </FormItem>
        <FormItem label="图标" prop="menuLogo">
          <Select v-model="formData.menuLogo" clearable filterable :disabled="formData.menuType !== '0' || drawerType==='detail'">
            <Option v-for="(item, index) in menuIcons" :value="item" :key="index">
				<icon :class="`icon iconfont margin-right-10 ${item}`" v-if="item.indexOf('icon') !== -1"></icon>
				<Icon :type="item" class="margin-right-10" v-else />{{item}}
			</Option>
          </Select>
        </FormItem>
        <FormItem label="权限值">
          <Input v-model="formData.permissionValue" :disabled="drawerType==='detail'" />
        </FormItem>
        <FormItem label="路径" prop="menuUrl">
          <Input v-model="formData.menuUrl" :disabled="drawerType==='detail'" />
        </FormItem>
        <FormItem label="排序" prop="menuSort">
          <Input v-model="formData.menuSort" :disabled="drawerType==='detail'" />
        </FormItem>
        <FormItem label="描述">
          <Input v-model="formData.remark" type="textarea" :disabled="drawerType==='detail'" />
        </FormItem>
        <FormItem label="是否启用">
          <RadioGroup v-model="formData.isEnable" v-if="drawerType!=='detail'">
            <Radio label=0>是</Radio>
            <Radio label=1>否</Radio>
          </RadioGroup>
          <span v-else>{{formData.isEnable == '1' ? '否':'是'}}</span>
        </FormItem>
      </Form>
      <div style="text-align: center;"  v-if="drawerType!=='detail'">
        <Button type="primary" @click="handleSave">保存</Button>
      </div>
      <div v-else style="padding: 0 80px;">
        <Button type="primary" @click="handleAddEdit(formData, 'edit')" v-permission="this.$API.menuManage.update">编辑</Button>
        <Button type="primary" @click="handleDelete" style="float: right;" v-permission="this.$API.menuManage.delete">删除</Button>
      </div>
    </Drawer>
  </div>
</template>

<script>
import { formatToTreeData, getCascaderSelectedValue } from '@/libs/businessUtil'
import { iconsArray } from '@/libs/menu-icons'
const baseForm = {
    menuId: '',
    menuName: '', // 必填
    menuType: '0', // 类型：0,菜单；1，页面(tab)；2，按钮
    parentMentId: '',
    parentMentName: '',
    systemId: '',
    systemName: '',
    menuLogo: '',
    permissionValue: '',
    menuUrl: '',
    menuSort: '',
    remark: '',
    isEnable: '0'
}
export default {
    name: 'menu-manage',
    data () {
        return {
        	menuIcons: iconsArray,
            menuCascaderData: [],
            menuCascaderDataAll: [], // 编辑时筛选用
            editParentArray: [],
            menuWidth: '200px',
            chosenSystem: 0, // 左侧选中的系统
            systemList: [], // 左侧系统列表数据
            menuList: [], // 菜单数据
            isDrawerShow: false,
            drawerType: 'add', // add/edit/detail
            formData: baseForm,
            // 为删除、新增、修改后，无需重新拉取数据即可更新页面，保存相关数据
            treeRoot: null,
            treeNode: null,
            treeData: null,
            originAddParentId: '' // 记录 点击 添加子菜单 时的原始默认id，以便新增成功后的数据刷新处理
        }
    },
    methods: {
    /**
     * menu tree的render方法
     */
        renderContent (h, { root, node, data }) {
            return h('span', {
                style: {
                    display: 'inline-block',
                    width: '100%',
                    height: '35px',
                    lineHeight: '25px',
                    borderBottom: '1px solid #eeeeee'
                }
            }, [
                h('span', [
                    h('Icon', {
                        props: {
                            type: data.allData.menuLogo
                        },
                        style: {
                            marginRight: '8px',
                            fontSize: '16px'
                        },
                        'class': data.allData.menuLogo.indexOf('icon') === -1 ? '' : `icon iconfont ${data.allData.menuLogo}`
                    }),
                    h('span', data.title)
                ]),
                h('span', {
                    style: {
                        display: 'inline-block',
                        float: 'right'
                    }
                }, [
                    h('Button', {
                        props: {
                            size: 'small'
                        },
                        style: {
                            marginRight: '8px',
                            display: data.allData.menuType == '2' ? 'none' : 'inline-block'
                        },
                        directives: [
                            {
                                name: 'permission',
                                value: this.$API.menuManage.add
                            }
                        ],
                        on: {
                            click: () => {
                                if (data.allData.menuType != '2') {
                                    this.treeData = data
                                    this.handleAddEdit(data.allData, 'add')
                                }
                            }
                        }
                    }, '添加子菜单'),
                    h('Button', {
                        props: {
                            type: 'text',
                            size: 'small'
                        },
                        style: {
                            marginRight: '8px',
                            color: '#3696fa'
                        },
                        on: {
                            click: () => {
                                this.treeRoot = root
                                this.treeNode = node
                                this.treeData = data
                                this.handleAddEdit(data.allData, 'detail')
                            }
                        }
                    }, '查看'),
                    h('Button', {
                        props: {
                            type: 'text',
                            size: 'small'
                        },
                        style: {
                            marginRight: '8px',
                            color: '#3696fa'
                        },
                        directives: [
                            {
                                name: 'permission',
                                value: this.$API.menuManage.update
                            }
                        ],
                        on: {
                            click: () => {
                                this.handleAddEdit(data.allData, 'edit')
                            }
                        }
                    }, '编辑'),
                    h('Button', {
                        props: {
                            type: 'text',
                            size: 'small'
                        },
                        style: {
                            marginRight: '8px',
                            color: '#3696fa'
                        },
                        directives: [
                            {
                                name: 'permission',
                                value: this.$API.menuManage.delete
                            }
                        ],
                        on: {
                            click: () => {
                            	this.treeRoot = root
                                this.treeNode = node
                                this.treeData = data
                                this.handleDelete()
                            }
                        }
                    }, '删除')
                ])
            ])
        },
        /**
     * 左侧系统数据
     * @return {Promise<void>}
     */
        async getSystemList () {
            const res = await this.$API.systemSet.list({ limit: 9999, pager: 1 })
            this.systemList = res.data.filter(item => item.status !== 0)
            if (this.systemList && this.systemList[0] && this.systemList[0].systemId) this.getMenuData(this.systemList[0].systemId)
        },
        /**
     * 某个系统的菜单数据
     * @param systemId
     * @return {Promise<void>}
     */
        async getMenuData (systemId) {
            const res = await this.$API.menuManage.list({ limit: 9999, pager: 1, systemId: systemId })
            const resData = res.data || []
            this.menuList = formatToTreeData({
                baseArr: JSON.parse(JSON.stringify(resData)),
                parentIdName: 'parentMentId',
                idName: 'id',
                sortName: 'menuSort',
                childrenFn: function (item) {
                    return {
                        title: item.menuName,
                        expand: true,
                        id: item.menuId,
                        allData: JSON.parse(JSON.stringify(item)),
                        menuSort: item.menuSort,
                        children: []
                    }
                }

            })
            // 上级菜单 选择数据，不能包含 按钮类型
            function filterArray (arr) {
            	const res = []
                arr.forEach(item => {
                    if (item.allData.menuType != 2) {
                        res.push({
                            value: item.allData.menuId,
                            label: item.allData.menuName,
                            children: filterArray(item.children)
                        })
                    }
                })
                return res
            }
            this.menuCascaderData = filterArray(this.menuList)
            this.menuCascaderDataAll = filterArray(this.menuList)
        },
        /**
     * 选择左侧的系统
     * @param name
     */
        handleChooseSystem (name) {
            if (name === this.chosenSystem) return false
            this.chosenSystem = name
            // 获取菜单数据
            this.getMenuData(this.systemList[name].systemId)
        },
        handleAddEdit (rowData, type) {
            this.editParentArray = []
            if (type === 'add') {
                if (rowData) { // 顶部‘添加菜单’按钮
                    baseForm.parentMentId = rowData.menuId
                    baseForm.parentMentName = rowData.menuName
                    this.originAddParentId = rowData.menuId
                } else {
                    baseForm.parentMentId = ''
                    baseForm.parentMentName = ''
                    this.originAddParentId = ''
                }
                rowData = JSON.parse(JSON.stringify(baseForm))
                // 设置 上级菜单值
                this.editParentArray = getCascaderSelectedValue(this.menuCascaderDataAll, rowData.parentMentId)
                // console.warn(rowData.menuId)
                // console.error(this.menuCascaderDataAll)
            } else if (type === 'update') {
            	// 修改时，上级菜单的cascade不能包含其自身及其子菜单，不然会乱套
                const currentMenuId = rowData.menuId
                const oldMenuCascaderData = JSON.parse(JSON.stringify(this.menuCascaderDataAll))
                function deleteFunc (dataArr) {
                    for (let i = 0; i < dataArr.length; i++) {
                        if (dataArr[i].value === currentMenuId) {
                        	dataArr.splice(i, 1)
                            break
                        } else {
                            dataArr[i].children = deleteFunc(dataArr[i].children)
                        }
                    }
                    return dataArr
                }
                this.menuCascaderData = deleteFunc(oldMenuCascaderData)
                // 设置 上级菜单值
                this.editParentArray = getCascaderSelectedValue(this.menuCascaderData, rowData.parentMentId)
            } else {
                // 设置 上级菜单值
                this.editParentArray = getCascaderSelectedValue(this.menuCascaderDataAll, rowData.parentMentId)
            }
            this.formData = JSON.parse(JSON.stringify(rowData))
            this.formData.menuType = rowData.menuType + ''
            this.formData.isEnable = rowData.isEnable + ''
            this.drawerType = type // add/edit/detail
            // console.log(this.editParentArray)
            this.$nextTick(() => {
                this.isDrawerShow = true
            })
        },
        handleSave () {
            this.$refs.form.validate(async (valid) => {
                if (valid) {
                    const funcName = this.formData.menuId ? 'update' : 'add'
                    if (this.formData.menuType === '1' || this.formData.menuType === 1) {
                        this.formData.menuLogo = 'md-albums'
                    } else if (this.formData.menuType === '2' || this.formData.menuType === 2) {
                        this.formData.menuLogo = 'ios-hammer'
                    }
                    const postData = {
                        ...this.formData,
                        systemId: this.systemList[this.chosenSystem].systemId,
                        systemName: this.systemList[this.chosenSystem].title
                    }
                    // console.log(postData)
                    // return false
                    const res = await this.$API.menuManage[funcName](postData)
                    this.isDrawerShow = false
                    // 新增成功后，不重新拉取数据，优化用户体验--仅上级菜单未改且菜单类型是功能的时候不重新拉取数据
                    if (funcName === 'add') {
                    	if (this.originAddParentId === this.formData.parentMentId && this.formData.menuType == 2) {
                            const temp = JSON.parse(JSON.stringify(this.formData))
                            temp.menuId = res.data
                            const newItem = {
                                allData: temp,
                                children: [],
                                expand: true,
                                id: res.data,
                                menuSort: temp.menuSort,
                                nodeKey: this.menuList.length,
                                title: temp.menuName
                            }
                            if (!this.formData.parentMentId) {
                                this.menuList.push(newItem)
                                this.menuList = this.menuList.sort(function (a, b) {
                                    return (b.menuSort - a.menuSort)
                                })
                            } else {
                                let children = this.treeData.children || []
                                children.push(newItem)
                                children = children.sort(function (a, b) {
                                    return (b.menuSort - a.menuSort)
                                })
                                this.$set(this.treeData, 'children', children)
                            }
                        } else {
                            this.getMenuData(this.systemList[this.chosenSystem].systemId)
                        }
                    } else {
                    	// 不整体刷新的话，其children的parentName可能没更新
                        this.getMenuData(this.systemList[this.chosenSystem].systemId)
                    }
                }
            })
        },
        handleDelete () {
            this.$Modal.confirm({
                title: '删除提示',
                content: '删除后，子菜单也会删除，用户的页面权限也将被删除。确定要删除该菜单吗?',
                onOk: async () => {
                    await this.$API.menuManage.delete({ ids: this.treeData.allData.menuId })
                    this.isDrawerShow = false
                    // 更新菜单数据
                    if (!this.treeData.allData.parentMentId) {
                        this.getMenuData(this.systemList[this.chosenSystem].systemId)
                    } else {
                    	try {
                            // iview 示例中的方法
                            const parentKey = this.treeRoot.find(el => el === this.treeNode).parent
                            const parent = this.treeRoot.find(el => el.nodeKey === parentKey).node
                            const index = parent.children.indexOf(this.treeData)
                            parent.children.splice(index, 1)
                        } catch (e) {
                            this.getMenuData(this.systemList[this.chosenSystem].systemId)
                        }
                    }
                }
            })
        },
        resetForm () {
            this.$refs.form.resetFields()
        },
        /**
		 * @description 选择 上级菜单 的处理
		 * @param value
		 * @param selectData
		 */
        handleParentSelect (value, selectData) {
            const userfulData = selectData[selectData.length - 1]
            this.formData.parentMentName = userfulData ? userfulData.label : ''
            this.formData.parentMentId = userfulData ? userfulData.value : ''
        },
        handleMenuTypeChange (value) {
        	if (value !== '0') {
        		this.formData.menuLogo = ''
            }
        }
    },
    mounted () {
        this.getSystemList()
    }
}
</script>
