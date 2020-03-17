// 用户登录密码格式验证
const validatePasword = (rule, value, callback) => {
    // if (!/^(?![A-Za-z0-9]+$)(?![a-z0-9\\W]+$)(?![A-Za-z\\W]+$)(?![A-Z0-9\\W]+$)[a-zA-Z0-9\\W]{8,}$/.test(value)) { // 后端的正则
    if (!/^(?!(?:[^a-zA-Z]|\D|[a-zA-Z0-9])$).{8,}$/.test(value)) {
        callback(new Error('密码格式不正确,密码规则：大写字母+小写字母+数字+特殊字符，8位以上'))
    } else {
        callback()
    }
}
// 手机号码格式验证
const validatePhone = (rule, value, callback) => {
    if (!/^((1[3-9][0-9])+\d{8})$/.test(value)) {
        callback(new Error('手机号码格式不正确'))
    } else {
        callback()
    }
}
// 固化、手机号格式验证
const validateContact = (rule, value, callback) => {
    // 若是非必填项且值为空，不做验证
    if (!rule.required && !value) {
    	callback()
        return false
    }
    if (/^(((0\d{2,3})-)?(0\d{2,3})?\d{7,8}(-(\d{3,}))?)$/.test(value) || /^((1[3-9][0-9])+\d{8})$/.test(value)) {
        callback()
    } else {
        callback(new Error('格式不正确'))
    }
}
const sortValue = [
    { required: false, message: '排序值必须是正整数', trigger: 'blur', pattern: /^[1-9]\d*|0$/ }
]
export default {
    // user-role/system-set
    systemEdit: {
        title: [
            { required: true, message: '请输入系统标题', trigger: 'blur' }
        ],
        name: [
            { required: true, message: '请输入系统名称', trigger: 'blur' }
        ],
        url: [
            { required: true, message: '请输入系统访问地址', trigger: 'blur' }
        ],
        paramCode: [
            { required: true, message: '请选择系统类型', trigger: 'change' }
        ],
        sort: sortValue
    },
    menuEdit: {
        menuName: [
            { required: true, message: '请输入菜单名称', trigger: 'blur' }
        ],
        menuSort: sortValue,
        menuUrl: [
            { required: true, message: '请输入路径', trigger: 'blur' }
        ]
    },
    // user-role/role-edit
    roleEdit: {
        name: [
            { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        profile: [
            { required: false, message: '请输入说明', trigger: 'blur' }
        ]
    },
    userEdit: {
        userName: [
            { required: true, message: '用户名需是6位以上的字符', trigger: 'blur', min: 7 }
        ],
        password: [
            { validator: validatePasword, required: true, message: '格式错误,密码规则：大写字母+小写字母+数字+特殊字符，8位以上', trigger: 'blur' }
        ],
        updatePassword: [
            { validator: validatePasword, required: false, message: '格式错误,密码规则：大写字母+小写字母+数字+特殊字符，8位以上', trigger: 'blur' }
        ],
        organizationId: [
            { required: true, message: '请选择科室', trigger: 'change' }
        ],
        medicalId: [
            { required: true, message: '请选择医疗机构', trigger: 'change' }
        ],
        mobile: [
            { validator: validateContact, required: true, message: '专属号码格式不正确，请填写固定电话或手机号码', trigger: 'blur' }
        ],
        phone: [
            { validator: validateContact, required: false, message: '联系电话格式不正确，请填写固定电话或手机号码', trigger: 'blur' }
        ]
    },
    systemParamType: {
        paramTypeName: [
            { required: true, message: '请输入类型名称', trigger: 'blur' }
        ],
        paramTypeCode: [
            { required: true, message: '请输入类型编码', trigger: 'blur' }
        ]
    },
    systemParamManage: {
        paramName: [
            { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        paramCode: [
            { required: true, message: '请输入编码', trigger: 'blur' }
        ],
        paramTypeSelect: [
            { required: true, message: '请选择参数类型', trigger: 'change' }
        ]
    },
    // 患者管理
    patientValidate: {
        hzxm: [
            { required: true, message: '请输入患者姓名', trigger: 'blur' }
        ],
        sfzh: [
            { required: true, message: '请输入身份证号', trigger: 'blur' }
        ],
    },
    // 修改密码
    passwordValidate: {
        origPwd: [
            { required: true, message: '不能为空噢~', trigger: 'blur' }
        ],
        newPwd: [
            { required: true, message: '不能为空噢~', trigger: 'blur' }
        ],
        confirmPwd: [
            { required: true, message: '不能为空噢~', trigger: 'blur' }
        ]
    },
    orgEdit: {
        name: [
            { required: true, message: '请输入组织名称', trigger: 'blur' }
        ],
        sort: sortValue
    },
    fieldEdit: {
        fieldName: [
            { required: true, message: '请输入字段名称', trigger: 'blur' }
        ],
        type: [
            { required: true, message: '请选择类型', trigger: 'change' }
        ],
        number: [
            { required: true, message: '请填写字符长度', trigger: 'blur' }
        ],
    },
    stopFollowUp: {
        cancleReason: [
            { required: true, message: '请选择原因', trigger: 'change' }
        ],
        cancleRemark: [
            { required: true, message: '请输入详情', trigger: 'blur' }
        ]
    },
    // 随访详情弹框--随访结果块
    followupDetailResult: {
        cancleReason: [
            { required: true, message: '请选择原因', trigger: 'change' }
        ],
        cancleRemark: [
            { required: true, message: '请输入详情', trigger: 'blur' }
        ]
    },
    // 指标管理
    indexManage: {
        targetName: [
            { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        oType: [
            { required: true, message: '请选择类型', trigger: 'change' }
        ]
    },
    questionManage: {
        questionName: [
            { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        questionContent: [
            { required: true, message: '请输入内容', trigger: 'blur' }
        ]
    },
    voiceManageForm: {
        voiceName: [
            { required: true, message: '语音标题不能为空', trigger: 'blur' }
        ],
        content: [
            { required: false, message: '语音标题不能为空', trigger: 'blur' }
        ],
        remark: [
            { required: false, message: '语音标题不能为空', trigger: 'blur' }
        ]
    },
    // 短信平台设置
    mesPlatForm: {
        centerName: [
            { required: true, message: '平台名称不能为空', trigger: 'blur' }
        ],
        product: [
            { required: true, message: 'product不能为空', trigger: 'blur' }
        ],
        domain: [
            { required: true, message: 'domain不能为空', trigger: 'blur' }
        ],
        accessId: [
            { required: true, message: 'accessId不能为空', trigger: 'blur' }
        ],
        accessSecret: [
            { required: true, message: 'accessSecret不能为空', trigger: 'blur' }
        ],
        singName: [
            { required: true, message: 'singName不能为空', trigger: 'blur' }
        ]
    },
    // 短信模板
    mesTemplate: {
        templateName: [
            { required: true, message: '短信模板名称不能为空', trigger: 'blur' }
        ],
        mesprop: [
            { required: true, message: '请选择短信平台', trigger: 'change' }
        ],
        templateCode: [
            { required: true, message: 'templateCode不能为空', trigger: 'blur' }
        ],
        smsContent: [
            { required: false, message: '短信内容不能为空', trigger: 'blur' }
        ]
    },
    // 系统设置-合成语音
    composeVoice: {
        variableName: [
            { required: true, message: '短信模板名称不能为空', trigger: 'blur' }
        ],
        corresponding: [
            { required: true, message: '请选择短信平台', trigger: 'change' }
        ]
    },
    planlist:{
        cancleReason: [
            { required: true, message: '终止原因不能为空', trigger: 'change' }
          ]
    },
    // 系统设置-机器人配置
    robotRules: {
        aiEngine: [
            { required: true, message: '短信模板名称不能为空', trigger: 'change' }
        ],
        samplingRate: [
            { required: true, message: '请选择', trigger: 'change' }
        ],
        languages: [
            { required: true, message: '请选择', trigger: 'change' }
        ],
        sourceEngine: [
            { required: true, message: '请选择', trigger: 'change' }
        ],
        voiceSpeaker: [
            { required: true, message: '请选择', trigger: 'change' }
        ]
    },
    // 模板编辑
    templateEdit: {
        templateName: [
            { required: true, message: '模板名称不能为空', trigger: 'blur' }
        ],
        silentTime: [
            { required: true, message: '静默时间不能为空', trigger: 'blur', type: 'number' }
        ],
        noMatchRepeat: [
            { required: true, message: '无匹配重复次数不能为空', trigger: 'blur', type: 'number' }
        ],
        noSoundRepeat: [
            { required: true, message: '无声音重复次数不能为空', trigger: 'blur', type: 'number' }
        ],
        startNumber: [
            { required: true, message: '起始问题编号不能为空', trigger: 'blur', type: 'number' }
        ]
    },
    // 方案编辑
    schemeEdit: {
        schemeName: [
            { required: true, message: '方案名称不能为空', trigger: 'blur' }
        ],
        activeType: [
            { required: true, message: '请选择方案类型', trigger: 'blur' }
        ]
    },
    // 数据统计-统计结果
    countResult: {
        collectName: [
            { required: true, message: '模板名称不能为空', trigger: 'blur' }
        ],
        sqlStatement: [
            { required: true, message: '模板名称不能为空', trigger: 'blur' }
        ],
        remark: [
            { required: false, message: '模板名称不能为空', trigger: 'blur' }
        ]
    },
    //  疾病管理
    diseaseManage: {
        typeId: [
            { required: true, message: '请选择分类', trigger: 'change' }
        ],
        icdName: [
            { required: true, message: '名称不能为空', trigger: 'blur' }
        ],
        zjm: [
            { required: true, message: '助记码不能为空', trigger: 'blur' }
        ],
        icd: [
            { required: true, message: 'ICD编码不能为空', trigger: 'blur' }
        ]
    },
    // 机构管理
    InstitutionalManagement: {
        medicalName: [
            {
                required: true,
                message: '请输入名称',
                trigger: 'blur'
            }
        ],
        appId: [
            {
                required: true,
                message: '请输入appId',
                trigger: 'blur'
            }
        ],
        appKey: [
            {
                required: true,
                message: '请输入appKey',
                trigger: 'blur'
            }
        ],
        cityName: [
            {
                required: true,
                message: '请输入所在城市',
                trigger: 'blur'
            }
        ],
        medicalCode: [
            {
                required: true,
                message: '请输入机构代码',
                trigger: 'blur'
            }
        ],
        webUrl: [
            {
                required: true,
                message: '请输入管理台系统地址',
                trigger: 'blur'
            }
        ]
    }
}
