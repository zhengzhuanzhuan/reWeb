<style lang="less">
</style>

<template>
    <div class="user">
        <div class="sys-dis_main">
            <Row class="sys-dis_main_search common_search" :gutter="20" style="margin-bottom:10px">
                <Col span="6">
                <span>
                    机构名称
                </span>
                <Input v-model="searchParam.medicalName" placeholder="请输入机构名称"></Input>
                </Col>
                <Col span="6" >
                <Button @click="searchData" type="primary" >查询</Button>
                <Button @click="handleAdd" style="margin-left:15px" v-permission="this.$API.InstitutionalManage.add">新增</Button>
                </Col>
            </Row>
			<Card>
            <div class="sys-dis_main_list">
                <Table :columns="config" :data="tableParams.data" :loading="tableParams.isLoading"></Table>
            </div>
            <Row class="sys-dis_main_page">
                <Page  show-total :page-size="searchParam.limit" :total="tableParams.total" :current="searchParam.pager" show-elevator style="float:right" @on-change="changePage"></Page>
            </Row>
			</Card>
        </div>
        <Modal v-model="modal" title="添加机构" width="70">
            <Form ref="formData" class="busadd_main_form" :model="formData" :rules="validate.InstitutionalManagement" :label-width="190" style="height: 500px;overflow-y: auto;">
                <FormItem label="机构名称" prop="medicalName">
                    <Input v-model="formData.medicalName" placeholder="请输入医疗机构名称"></Input>
                </FormItem>
                <FormItem label="机构代码" prop="medicalCode">
                    <Input v-model="formData.medicalCode" placeholder="请输入医疗机构代码"></Input>
                </FormItem>
                <FormItem label="appId" prop="appId">
                    <Input v-model="formData.appId" placeholder="请输入appId"></Input>
                </FormItem>
                <FormItem label="appKey" prop="appKey">
                    <Input v-model="formData.appKey" placeholder="请输入appKey"></Input>
                </FormItem>
                <FormItem label="机器人地址" prop="aiUrl">
                    <Input v-model="formData.aiUrl" placeholder="请输入机器人地址"></Input>
                </FormItem>
                <FormItem label="机器人语音地址" prop="aiAudioUrl">
                    <Input v-model="formData.aiAudioUrl" placeholder="请输入机器人语音地址"></Input>
                </FormItem>
                <FormItem label="所在城市" prop="cityName">
                    <Input v-model="formData.cityName" placeholder="请输入所在城市"></Input>
                </FormItem>
                <FormItem label="联系人" prop="">
                    <Input v-model="formData.linkMan" placeholder="请输入联系人"></Input>
                </FormItem>
                <FormItem label="地址"  prop="">
                    <Input v-model="formData.address" placeholder="请输入地址"></Input>
                </FormItem>
                <FormItem label="回写接口">
                    <Input v-model="formData.backUrl" placeholder="请输入回写接口"></Input>
                </FormItem>
                <FormItem label="接入商Id">
                    <Input v-model="formData.bindId" placeholder="请输入接入商id"></Input>
                </FormItem>
                <FormItem label="接入商Key">
                    <Input v-model="formData.bindKey" placeholder="请输入接入商key"></Input>
                </FormItem>
                <FormItem label="接入商号地址">
                    <Input v-model="formData.bindUrl" placeholder="请输入接入商号地址"></Input>
                </FormItem>
                <FormItem label="商务虚拟号">
                    <Input v-model="formData.virtualMobile" placeholder="请输入商务虚拟号"></Input>
                </FormItem>
                <FormItem label="绑定时间">
                    <!--<Input v-model="formData.bindTime" placeholder="enter bind time, between 0 and 14400, minute as the unit"></Input>-->
                    <InputNumber :max="14400" :min="0" v-model="formData.bindTime"></InputNumber>
                </FormItem>
                <FormItem label="是否允许使用APP">
                    <RadioGroup v-model="formData.isAllowAPP">
                        <Radio :label="1">
                            是
                        </Radio>
                        <Radio :label="0">
                            否
                        </Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="Ftp Ip">
                    <Input v-model="formData.ftpIp"></Input>
                </FormItem>
                <FormItem label="Ftp用户名">
                    <Input v-model="formData.ftpUserName"></Input>
                </FormItem>
                <FormItem label="Ftp密码">
                    <Input v-model="formData.ftpPassword"></Input>
                </FormItem>
                <FormItem label="Ftp根路径">
                    <Input v-model="formData.ftpPath"></Input>
                </FormItem>
                <!--<FormItem label="是否正常">-->
                    <!--<RadioGroup v-model="formData.isDelete">-->
                        <!--<Radio :label="0">-->
                            <!--<span>是</span>-->
                        <!--</Radio>-->
                        <!--<Radio :label="1">-->
                            <!--<span>否</span>-->
                        <!--</Radio>-->
                    <!--</RadioGroup>-->
                <!--</FormItem>-->
                <FormItem label="备注" prop="remark">
                    <Input v-model="formData.remark" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="请填写备注"></Input>
                </FormItem>
				<FormItem label="管理台系统地址(ip+端口)" prop="webUrl">
					<Input v-model="formData.webUrl"></Input>
				</FormItem>
            </Form>
            <div slot="footer" class="sys-sysset_main_btnList">
                <Button type="primary" @click="addDisease">确认</Button>
            </div>
        </Modal>
        <Modal v-model="editmodal" title="编辑机构" width="70">
            <Form ref="currentInfo" class="busadd_main_form" :model="currentInfo" :rules="validate.InstitutionalManagement" :label-width="190" style="height: 500px;overflow-y: auto;">
                <FormItem label="机构名称" prop="medicalName">
                    <Input v-model="currentInfo.medicalName" placeholder="请输入医疗机构名称"></Input>
                </FormItem>
                <FormItem label="机构代码" prop="medicalCode">
                    <Input v-model="currentInfo.medicalCode" placeholder="请输入医疗机构代码"></Input>
                </FormItem>
                <FormItem label="appId" prop="appId">
                    <Input v-model="currentInfo.appId" placeholder="请输入appId"></Input>
                </FormItem>
                <FormItem label="appKey" prop="appKey">
                    <Input v-model="currentInfo.appKey" placeholder="请输入appKey"></Input>
                </FormItem>
                <FormItem label="机器人地址" prop="aiUrl">
                    <Input v-model="currentInfo.aiUrl" placeholder="请输入机器人地址"></Input>
                </FormItem>
                <FormItem label="机器人语音地址" prop="aiAudioUrl">
                    <Input v-model="currentInfo.aiAudioUrl" placeholder="请输入机器人语音地址"></Input>
                </FormItem>
                <FormItem label="所在城市" prop="cityName">
                    <Input v-model="currentInfo.cityName" placeholder="请输入所在城市"></Input>
                </FormItem>
                <FormItem label="联系人" prop="">
                    <Input v-model="currentInfo.linkMan" placeholder="请输入联系人"></Input>
                </FormItem>
                <FormItem label="地址"  prop="">
                    <Input v-model="currentInfo.address" placeholder="请输入地址"></Input>
                </FormItem>
                <FormItem label="回写接口">
                    <Input v-model="currentInfo.backUrl" placeholder="请输入回写接口"></Input>
                </FormItem>
                <FormItem label="接入商Id">
                    <Input v-model="currentInfo.bindId" placeholder="请输入接入商id"></Input>
                </FormItem>
                <FormItem label="接入商Key">
                    <Input v-model="currentInfo.bindKey" placeholder="请输入接入商key"></Input>
                </FormItem>
                <FormItem label="接入商号地址">
                    <Input v-model="currentInfo.bindUrl" placeholder="请输入接入商号地址"></Input>
                </FormItem>
                <FormItem label="商务虚拟号">
                    <Input v-model="currentInfo.virtualMobile" placeholder="请输入商务虚拟号"></Input>
                </FormItem>
                <FormItem label="绑定时间">
                    <!--<Input v-model="currentInfo.bindTime" placeholder="enter bind time, between 0 and 14400, minute as the unit"></Input>-->
                    <InputNumber :max="14400" :min="0" v-model="currentInfo.bindTime"></InputNumber>
                </FormItem>
                <FormItem label="是否允许使用APP">
                    <RadioGroup v-model="currentInfo.isAllowAPP">
                        <Radio :label="1">
                            是
                        </Radio>
                        <Radio :label="0">
                            否
                        </Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="Ftp Ip">
                    <Input v-model="currentInfo.ftpIp"></Input>
                </FormItem>
                <FormItem label="Ftp用户名">
                    <Input v-model="currentInfo.ftpUserName"></Input>
                </FormItem>
                <FormItem label="Ftp密码">
                    <Input v-model="currentInfo.ftpPassword"></Input>
                </FormItem>
                <FormItem label="Ftp根路径">
                    <Input v-model="currentInfo.ftpPath"></Input>
                </FormItem>
                <!--<FormItem label="是否正常">-->
                <!--<RadioGroup v-model="currentInfo.isDelete">-->
                <!--<Radio :label="0">-->
                <!--<span>是</span>-->
                <!--</Radio>-->
                <!--<Radio :label="1">-->
                <!--<span>否</span>-->
                <!--</Radio>-->
                <!--</RadioGroup>-->
                <!--</FormItem>-->
                <FormItem label="备注" prop="remark">
                    <Input v-model="currentInfo.remark" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="请填写备注"></Input>
                </FormItem>
				<FormItem label="管理台系统地址(ip+端口)" prop="webUrl">
					<Input v-model="currentInfo.webUrl"></Input>
				</FormItem>
            </Form>
            <div slot="footer" class="sys-sysset_main_btnList">
                <Button type="primary" @click="submitDisease">确认</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
import { handleDeleteRefresh } from '@/libs/businessUtil'
export default {
    data () {
        return {
            diseaseId: '', // 被选中的疾病id
            // 搜索参数
            searchParam: {
                pager: 1, // 当前页码
                limit: 10,
                medicalName: '' // 疾病名称
            },
            tableParams: {
                data: [],
                total: 0,
                isLoading: false
            },
            // 当前被点击触发的数据
            currentInfo: {
                medicalName: '',
                id: '',
                appId: '', // 疾病名称
                appKey: '', // 疾病名称
                linkMan: '', // 助记码
                address: '', // ICD编码
                // isDelete: 0, //状态（0正常，1禁用）
                remark: '' // 备注
            },
            // 添加的数据
            formData: {
                medicalName: '',
                appId: '', // 疾病名称
                appKey: '', // 疾病名称
                linkMan: '', // 助记码
                address: '', // ICD编码
                // isDelete: 0, //状态（0正常，1禁用）
                remark: '', // 备注
                aiUrl: '', // 必填
                aiAudioUrl: '', // 必填
                virtualMobile: '',
                backUrl: '',
                ftpPassword: '',
                isAllowAPP: 0,
                bindId: '',
                bindKey: '',
                medicalCode: '',
                ftpUserName: '',
                bindTime: 0,
                ftpIp: '',
                ftpPath: '',
                bindUrl: '',
                cityName: '',
                webUrl: ''
            },
            departList: [], // 部门列表接口
            actionmodal: false,
            editmodal: false,
            modal: false,
            // 列表配置
            config: [
                {
                    title: '医疗机构名称',
                    key: 'medicalName'
                },
                {
                    title: '地址',
                    key: 'address'
                },
                {
                    title: 'appId',
                    key: 'appId'
                },
                {
                    title: 'appKey',
                    key: 'appKey'
                },
                {
                    title: '机器人地址',
                    key: 'aiUrl'
                },
                {
                    title: '机器人语音地址',
                    key: 'aiAudioUrl'
                },
                {
                    title: '联系人',
                    key: 'linkMan'
                },
                {
                    title: '备注',
                    key: 'remark'
                },
                {
                    title: '所在城市',
                    key: 'cityName'
                },
                {
                    title: '操作',
                    key: 'action',
                    width: 200,
                    render: (h, params) => {
                        return h('div', [
                            h(
                                'Button',
                                {
                                    props: {
                                        type: 'text',
                                        size: 'small'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    directives: [
                                        {
                                            name: 'permission',
                                            value: this.$API.InstitutionalManage.update
                                        }
                                    ],
                                    on: {
                                        click: () => {
                                            this.editDisease(params.row)
                                        }
                                    }
                                },
                                '编辑'
                            ),
                            h(
                                'Button',
                                {
                                    props: {
                                        type: 'text',
                                        size: 'small'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    directives: [
                                        {
                                            name: 'permission',
                                            value: this.$API.InstitutionalManage.delete
                                        }
                                    ],
                                    on: {
                                        click: () => {
                                            this.delDisease(params.row.id)
                                        }
                                    }
                                },
                                '删除'
                            )
                        ])
                    }
                }
            ]
        }
    },
    methods: {
        handleAdd () {
            this.$refs.formData.resetFields()
            this.modal = true
        },
        /**
     * 获取所有数据
     */
        getData () {
            this.$API.InstitutionalManage.list(this.searchParam)
                .then(res => {
                    this.tableParams.data = res.data
                    this.tableParams.total = res.total
                    this.tableParams.isLoading = false
                })
                .catch(err => {
                    this.tableParams.isLoading = false
                })
        },
        /**
     * 搜索数据
     */
        searchData () {
            this.searchParam.pager = 1
            this.getData()
        },
        /**
     * 新增系统设置
     */
        addDisease () {
            this.$refs['formData'].validate(valid => {
                if (valid) {
                    this.$API.InstitutionalManage.add(this.formData)
                        .then(res => {
                            this.$Message.success('新增成功')
                            this.modal = false
                            this.getData()
                            this.formData = {
                                medicalName: '',
                                appId: '', // 疾病名称
                                appKey: '', // 疾病名称
                                linkMan: '', // 助记码
                                address: '', // ICD编码
                                isDelete: 0, // 状态（0正常，1禁用）
                                remark: '' // 备注
                            }
                        })
                        .catch(err => {})
                } else {
                    this.$Message.error('补全信息!')
                    return false
                }
            })
        },
        /**
     * 删除疾病
     */
        delDisease (id) {
            let self = this
            this.$Modal.confirm({
                title: '删除提示',
                content: '确定删除该医疗机构吗？',
                onOk: () => {
                    this.$API.InstitutionalManage.delete({
                        ids: id
                    })
                        .then(res => {
                            self.$Message.success('删除成功')
                            self.getData()
                            handleDeleteRefresh('searchParam', 'tableParams', 'getData', self)
                        })
                        .catch(err => {})
                }
            })
        },
        /**
     * 编辑疾病设置
     */
        editDisease (data) {
            this.editmodal = true
            let copyData = JSON.parse(JSON.stringify(data))
            // this.currentInfo = {
            //   id:copyData.id,
            //   medicalName: copyData.medicalName,
            //   appId: copyData.appId, //疾病名称
            //   appKey: copyData.appKey, //疾病名称
            //   linkMan: copyData.linkMan, //助记码
            //   address: copyData.address, //ICD编码
            //   isDelete: copyData.isDelete, //状态（0正常，1禁用）
            //   remark: copyData.remark //备注
            // };
            // copyData.isAllowAPP += ''
            this.currentInfo = copyData
        },
        /**
     * 提交修改
     */
        submitDisease () {
            this.$refs['currentInfo'].validate(valid => {
                if (valid) {
                    this.$API.InstitutionalManage.update(this.currentInfo)
                        .then(res => {
                            this.$Message.success('修改成功')
                            this.editmodal = false
                            this.getData()
                        })
                        .catch(err => {})
                } else {
                    this.$Message.error('补全信息!')
                }
            })
        },
        /**
     * 分页更改
     */
        changePage (page) {
            this.searchParam.pager = page
            this.getData()
        }
    },
    mounted () {
        this.getData()
    }
}
</script>
