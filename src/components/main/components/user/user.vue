<template>
  <div class="user-avator-dropdown">
    <Dropdown @on-click="handleClick">
      <Badge :dot="!!messageUnreadCount">
        <Avatar :src="userAvator"/>
      </Badge>
      <Icon :size="18" type="md-arrow-dropdown"></Icon>
      <DropdownMenu slot="list">
        <DropdownItem name="message">
          修改密码
          <!-- 消息中心<Badge style="margin-left: 10px" :count="messageUnreadCount"></Badge> -->
        </DropdownItem>
        <DropdownItem name="logout">退出登录</DropdownItem>
      </DropdownMenu>
    </Dropdown>
    <Modal
      v-model="PassWordModal"
      title="修改密码"
      :footer-hide='true'
      >
      <Form ref="formValidate" :model="formValidate" :rules="validate.passwordValidate" :label-width="80">
        <FormItem label="原密码" prop="origPwd">
          <Input v-model="formValidate.origPwd"></Input>
        </FormItem>
        <FormItem label="新密码" prop="newPwd">
          <Input v-model="formValidate.newPwd"></Input>
        </FormItem>
        <FormItem label="确认密码" prop="confirmPwd">
          <Input v-model="formValidate.confirmPwd"></Input>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="handleSubmit('formValidate')">确定</Button>
          <Button @click="handleReset('formValidate')" style="margin-left: 8px">取消</Button>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
import './user.less'
import { mapActions } from 'vuex'
export default {
    name: 'User',
    props: {
        userAvator: {
            type: String,
            default: ''
        },
        messageUnreadCount: {
            type: Number,
            default: 0
        }
    },
    data () {
        return {
            formValidate: {
                origPwd: null,
                newPwd: null,
                confirmPwd: null
            },
            PassWordModal: false
        }
    },
    methods: {
        ...mapActions([
            'handleLogOut'
        ]),
        async updataPwd () {
            const res = await this.$API.Pwd.passWord({
                username: JSON.parse(localStorage.getItem('userName')),
                password: this.formValidate.origPwd,
                newPassword: this.formValidate.newPwd
            })
            this.$Message.success('修改密码成功')
            this.PassWordModal = false
            this.$refs.formValidate.resetFields()
        },
        logout () {
            this.handleLogOut().then(() => {
                this.$router.push({
                    name: 'login'
                })
            })
        },
        message () {
            this.PassWordModal = true
            // this.$router.push({
            //   name: 'message_page'
            // })
        },
        handleClick (name) {
            switch (name) {
            case 'logout': this.logout()
                break
            case 'message': this.message()
                break
            }
        },
        handleSubmit (name) {
            this.$refs[name].validate((valid) => {
                if (valid) {
                    if (this.formValidate.newPwd === this.formValidate.confirmPwd) {
                        this.updataPwd()
                    } else {
                        this.$Message.warning('两次输入的密码不一致哦！')
                    }
                } else {
                    this.$Message.error('请填写相应字段！')
                }
            })
        },
        handleReset (name) {
            this.$refs[name].resetFields()
            this.PassWordModal= false
        }
    }
}
</script>
