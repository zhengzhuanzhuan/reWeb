<style lang="less" scoped>
.roleAdd {
  height: 100%;
  &_main {
    background-color: #fff;
    padding: 10px;
    height: 100%;
    border-radius: 5px;
    box-sizing: border-box;
    h3 {
      text-align: left;
      line-height: 40px;
      font-size: 15px;
      position: relative;
      margin-bottom: 10px;
      font-weight: 400;
      padding-left: 50px;
      &:after {
        content: "";
        display: block;
        height: 20px;
        width: 4px;
        background-color: #2d8cf0;
        position: absolute;
        top: 50%;
        left: 40px;
        transform: translateY(-50%);
      }
    }
    &_form {
      height: calc(~"100% - 80px");
		margin-bottom: 50px;
    }
	  &_btnList{
		  text-align: center;
	  }
  }
    .menu{
        height: calc(~"100% - 280px");
        background-color: white;
        overflow: auto;
        &-left{
            display: inline-block;
            float: left;
            position: relative;
			height: 100%;
			overflow-y: auto;
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
            overflow-x: hidden;
            border-left: 1px solid #eeeeee;
            padding: 30px;
            h3{
                font-size: 18px;
                padding-bottom: 20px;
            }
        }
    }
}
</style>

<template>
    <div class="roleAdd">
        <div class="roleAdd_main">
            <Form ref="role" class="roleAdd_main_form" :model="formData" :rules="validate.roleEdit" :label-width="120">
                <h3>{{type==0?"新增角色":"编辑角色"}}</h3>
                <FormItem label="名称：" prop="roleName" style="width:500px">
                    <Input v-model="formData.roleName" placeholder="请填写名称"></Input>
                </FormItem>
                <FormItem label="说明：" prop="remark" style="width:500px">
                    <Input v-model="formData.remark" placeholder="请填写角色说明"></Input>
                </FormItem>
                <h3>随访数据权限</h3>
                <FormItem label=""  >
                    <CheckboxGroup v-model="formData.activeTypes">
                        <Checkbox v-for="(item,index) in activeTypeOption" :key="index" :label="item.planTypeId">
                            <span>{{item.planTypeName}}</span>
                        </Checkbox>
                    </CheckboxGroup>
                </FormItem>
                <h3>菜单和功能权限</h3>
                <div class="menu">
                    <div class="menu-left">
                        <Menu @on-select="handleChooseSystem">
                            <MenuItem  v-for="(item, index) in systemList" :name="index" :key="item.systemId" :class="{'ivu-menu-item-active ivu-menu-item-selected': chosenSystemId === item.systemId}">
                                {{item.title}}
                            </MenuItem>
                        </Menu>
                    </div>
                    <div class="menu-main" v-if="systemList.length">
                        <Tree :data="menuList" :render="renderContent" ref="tree" show-checkbox></Tree>
                    </div>
                </div>
            </Form>
            <div class="roleAdd_main_btnList">
                <Button type="primary" @click="saveRole()">保存</Button>
            </div>
        </div>
    </div>
</template>

<script>
import { formatToTreeData } from '@/libs/businessUtil'
const baseForm = {
    roleName: '',
    remark: '',
    activeTypes: [],
    menuId: [],
    roleId: ''
}
export default {
    name: 'role-edit',
    props: {
        'hospital': {
            type: String,
            default: ''
        }
    },
    data () {
        return {
            type: 0,
            id: -1,
            // 添加的数据
            formData: JSON.parse(JSON.stringify(baseForm)),
            // 权限树
            menuList: [],
            activeTypeOption: [], // 随访类型权限选项数据
            chosenSystemId: '',
            systemList: [], // 左侧系统列表数据
            editSystemId: '', // 编辑时初始获取的system id
            switchSystemMenuIds: {} // 存储切换系统时选中的menuId
        }
    },
    methods: {
    /**
     * 子部门渲染
     */
        renderContent (h, { root, node, data }) {
            return h(
                'span',
                {
                    style: {
                        display: 'inline-block',
                        width: '100%'
                    }
                },
                [
                    h(
                        'span',
                        {
                            style: {
                                padding: '5px'
                            }
                        },
                        [
                            h(
                                'span',
                                {},
                                data.title
                            )
                        ]
                    )
                ]
            )
        },
        // 编辑角色--获取 随访数据 菜单数据
        async editRole () {
            const postData = {
                roleId: this.id,
                limit: 9999
            }
            const activeTypeData = await this.$API.roleManage.getActiveTypeSelected(postData)
            const menuData = await this.$API.roleManage.getMenuSelected(postData)
            // 处理返回的data为空字符串的情况
            if (!activeTypeData.data) {
                activeTypeData.data = []
            }
            if (!menuData.data) {
                menuData.data = []
            }
            // 随访数据权限 选中数组
            const selectedActiveType = []
            activeTypeData.data.forEach(item => {
                selectedActiveType.push(item.activeId)
            })
            this.formData.activeTypes = selectedActiveType
            // 菜单 id 选中数组
            const selectedMenuIds = []
            menuData.data.forEach(item => {
                selectedMenuIds.push(item.menuId)
                if (this.switchSystemMenuIds[item.systemId]) {
                    this.switchSystemMenuIds[item.systemId].push(item.menuId)
                } else {
                    this.switchSystemMenuIds[item.systemId] = [item.menuId]
                }
            })
            // console.log(this.switchSystemMenuIds)
            this.formData.menuId = selectedMenuIds
            this.getSystemList()
            this.chosenSystemId = menuData.data[0] ? menuData.data[0].systemId : ''
            // this.getMenuData(this.chosenSystemId, selectedMenuIds)
            this.getMenuData(this.chosenSystemId, this.switchSystemMenuIds[this.chosenSystemId])
            // 记录 初始值， 以便更改系统后，拿不到原先已有的--按systemId分开存，解决去掉 之前已选中 时失败
            // this.switchSystemMenuIds[this.chosenSystemId] = selectedMenuIds
            this.editSystemId = this.chosenSystemId
        },
        /**
     * 最终的数据保存，首先进行数据分层
     */
        saveRole () {
            const selectedIdsString = this.getAllSelectedMenuIds().join(',')
            // console.log(this.switchSystemMenuIds)
            this.formData.menuId = selectedIdsString
            this.formData.activeType = this.formData.activeTypes.join(',')
            if (!this.formData.roleName) {
                this.$Message.warning('角色名称不能为空！')
                return false
            }
            if (!this.formData.activeType) {
                this.$Message.warning('请选择该角色的随访数据权限！')
                return false
            }
            if (!this.formData.menuId) {
                this.$Message.warning('请选择该角色的菜单和功能权限！')
                return false
            }
            let postName = 'update'
            if (this.type == 0) {
                delete this.formData.roleId
                postName = 'create'
            }
            const postData = JSON.parse(JSON.stringify(this.formData))
            delete postData.activeTypes
            // console.log(postData)
            // return false
            this.$API.roleManage[postName](postData)
                .then(res => {
                    this.$Message.success('保存成功')
                    window.history.back()
                })
                .catch(err => {
                    console.log(err)
                })
        },
        /**
     * 左侧系统数据
     * @return {Promise<void>}
     */
        async getSystemList () {
            const res = await this.$API.systemSet.list({ limit: 9999, pager: 1 })
            this.systemList = res.data.filter(item => item.status !== 0)
            if (this.systemList && this.systemList[0] && this.systemList[0].systemId && this.type == 0) {
                this.getMenuData(this.systemList[0].systemId)
                this.chosenSystemId = this.systemList[0].systemId
            }
        },
        /**
     * 某个系统的菜单数据
     * @param systemId
     * @return {Promise<void>}
     */
        async getMenuData (systemId, selectedArray = []) {
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
                },
                selectedArray: selectedArray,
                selectJudgeName: 'menuId'
            })
        },
        /**
     * @function getAllSelectedMenuIds
     */
        getAllSelectedMenuIds (systemId = this.chosenSystemId) {
            // 切换系统时，记录切换前系统的选中的菜单功能id
            const currentMenuSelected = this.$refs.tree.getCheckedAndIndeterminateNodes()
            const idsArray = []
            currentMenuSelected.forEach(item => {
                idsArray.push(item.allData.menuId)
            })
            this.switchSystemMenuIds[systemId] = idsArray
            let allSelectedMenuIds = []
            for (const item in this.switchSystemMenuIds) {
                allSelectedMenuIds = allSelectedMenuIds.concat(this.switchSystemMenuIds[item])
            }
            return allSelectedMenuIds
        },
        /**
     * 选择左侧的系统
     * @param name
     */
        handleChooseSystem (name) {
            const beforeSystemId = this.chosenSystemId // 切换系统前的选中的系统id
            const systemId = this.systemList[name].systemId
            if (systemId === this.chosenSystemId) return false
            this.chosenSystemId = systemId
            this.getMenuData(systemId, this.getAllSelectedMenuIds(beforeSystemId))
        },
        /**
		 * @description 随访计划类型 数据
		 */
        async getPlanType () {
            const res = await this.$API.planManage.planTypeList({ limit: 9999, pager: 1 })
            this.activeTypeOption = res.data
        }
    },
    mounted () {
        this.formData = JSON.parse(JSON.stringify(baseForm))
        this.type = this.$route.query.type
        this.id = ''
        if (this.type == 0) {
            this.getSystemList()
        } else {
            const detail = JSON.parse(this.$route.query.detail)
            this.id = detail.roleId
            this.formData.remark = detail.remark
            this.formData.roleName = detail.roleName
            this.formData.roleId = detail.roleId
            this.editRole()
        }
        this.getPlanType()
    }
}
</script>
