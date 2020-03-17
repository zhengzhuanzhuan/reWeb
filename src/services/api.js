import { fetch, dataFormFormat } from './fetch'

// 登录
export const Login = {
    // 用户系统权限
    userSystem (data) {
        return fetch('get', '/manage/upmsUser/userSystem', data)
    },
    login (data) {
        return fetch('post', '/sso/login', data)
    },
    logout (data) {
    	return fetch('get', '/sso/logout', data)
    }
}
// 修改密码
export const Pwd = {
    passWord (data) {
        return fetch('post', '/manage/upmsUser/UpdatePassword', data)
    }
}
// 首页
export const homePage = {
    // 就诊信息统计列表
    seeDoctor (data) {
        return fetch('get', '/homePage/visitFollowupRecord/seeADoctorCount', data)
    },
    // 就诊患者
    seeADoctorHZCount (data) {
        return fetch('get', '/homePage/visitFollowupRecord/seeADoctorHZCount', data)
    },
    // 人工外呼记录
    callCount (data) {
        return fetch('get', '/homePage/visitFollowupRecord/artificialCallCount', data)
    },
    // 计划重复审核
    repeatPlanCount (data) {
        return fetch('get', '/homePage/visitFollowupRecord/repeatPlanCount', data)
    },
    // 随访人次
    recordCount (data) {
        return fetch('get', '/homePage/visitFollowupRecord/recordCount', data)
    },
    // 随访审核
    checkCount (data) {
        return fetch('get', '/homePage/visitFollowupRecord/checkCount', data)
    },
    // 随访情况统计-列表
    followUpList (data) {
        return fetch('get', '/homePage/visitFollowupRecord/followUpList', data)
    },
     // 随访情况统计--人数,人次
    followUpCount (data) {
        return fetch('get', '/homePage/visitFollowupRecord/followUpCount', data)
    },
     // 指标采集
     targetCollected (data) {
        return fetch('get', '/homePage/visitFollowupRecord/targetCollected', data)
    },
    // 通话状态
    followupStatus (data) {
        return fetch('get', '/homePage/visitFollowupRecord/followupStatus', data)
    }
}
// 患者管理
export const patientManage = {
    // 下载
    patientDownLoad (data) {
        return fetch('get', '/manage/visitPatientInfo/patientModel', data)
    },
    // 删除列表
    patientDeleteList (data) {
        return fetch('get', '/manage/visitPatientOrganization/deleteList', data)
    },
    // 删除
    patientDelete (data) {
        return fetch('post', '/manage/visitPatientOrganization/delete', data)
    },
    // 组织管理
    originList (data) {
        return fetch('get', '/manage/upmsOrganization/list', data)
    },
    patientList (data) {
        return fetch('get', '/manage/visitPatientInfo/patientList', data)
    },
    patientImport (data) {
        return fetch('post', '/manage/visitPatientInfo/patientImport', data)
    },
    // 修改
    patientUpdate (data) {
        return fetch('put', '/manage/visitPatientInfo/update', data)
    },
    // 新增
    patientAdd (data) {
        return fetch('post', '/manage/visitPatientInfo/add', data)
    },

    // 详情
    patientDetail (data) {
        return fetch('get', '/manage/visitPatientInfo/info/' + data.id, {})
    }
}
// 计划管理
export const planManage = {
    // 计划列表和计划记录结果的tab
    tabChange (data) {
        return fetch('get', '/manage/visitPlanType', data)
    },
    // 相同设置类型的编辑
    addSameField (data) {
        return fetch('get', '/manage/visitPlanTypeSame/list', data)
    },
    // 关键词的编辑
    addKeyField (data) {
        return fetch('get', '/manage/visitPlanTypeKey/list', data)
    },
    addList (data) {
        return fetch('get', '/manage/visitPlanTypeType/list', data)
    },
    // 随访分类
    upmsParamDataList (data) {
        return fetch('get', '/manage/upmsParamData/list', data)
    },
    // 组织管理
    originList (data) {
        return fetch('get', '/manage/visitPlanType/planTypeOrganizaList', data)
    },
    // 列表
    planTypeList (data) {
        return fetch('get', '/manage/visitPlanType/list', data)
    },
    planTypeInfo (data) {
        return fetch('get', '/manage/visitPlanType/info/' + data.id, {})
    },
    // 新增
    planTypeAdd (data) {
        return fetch('post', '/manage/visitPlanType/add', data)
    },
    // 修改
    planTypeEdit (data) {
        return fetch('post', '/manage/visitPlanType/update', data)
    },
    // 删除
    planTypeDelete (data) {
        return fetch('get', '/manage/visitPlanType/delete/' + data.ids, {})
    },
    // 用户列表
    userList (data) {
        return fetch('get', '/manage/visitPlanType/planTypeUserList', data)
    },
    // 角色列表
    roleList (data) {
        return fetch('get', '/manage/upmsRole/list', data)
    },
    // 患者信息下拉框
    patientSelect (data) {
        return fetch('get', '/manage/visitPlanType/planTypeTableColumn', data)
    },
    // 医生端管理端字段添加
    visiFieldList (data) {
        return fetch('get', '/manage/visitFieldSettings/list', data)
    },
    visiFieldSave (data) {
        return fetch('post', '/manage/visitFieldSettings/save', data)
    },
    // 编辑
    visiFieldUpdate (data) {
        return fetch('post', '/manage/visitFieldSettings/update', data)
    },
    // 医生端管理端字段删除
    visiFieldDelete (data) {
        return fetch('delete', '/manage/visitFieldSettings/delete/' + data.ids, {})
    },
    // 字段的添加的列表
    visiFieldShow (data) {
        return fetch('get', '/manage/visitFieldSettings/showField', data)
    },
    // 字段新增
    visiFieldAdd (data) {
        return fetch('post', '/manage/visitFieldSettings/add', data)
    }
}
// 计划列表
export const planList = {
    followPlanList (data) {
        return fetch('get', '/manage/visitFollowupPlan/list', data)
    },
    // 删除
    followPlanDelete (data) {
        return fetch('delete', '/manage/visitFollowupPlan/delete/' + data.id, {})
    },
    // 方案测试
    followPlanTest (data) {
        return fetch('get', '/manage/visitFollowupPlan/scheme/test', data)
    },
    // 终止计划
    followEndPlay (data) {
        return fetch('post', '/manage/visitFollowupPlan/cancleAll', data)
    },
    // 批量终止传计划id
    batchEndPlay (data) {
        return fetch('post', '/manage/visitFollowupPlan/batchCanclePlanIds', data)
    },
    // 批量终止所有页
    batchCancleAll (data) {
        return fetch('post', '/manage/visitFollowupPlan/batchCancleAll', data)
    },
    // 查看
    followPlanDetail (data) {
        return fetch('get', '/manage/visitFollowupPlan/info/' + data.id, {})
    },
    // 计划匹配重复审核--排期 yugou
    planBegin (data) {
        return fetch('post', '/manage/visitFollowupPlan/begin', data)
    },
    // 计划匹配重复审核列表 yugou
    repeatList (data) {
        return fetch('get', '/manage/visitFollowupPlan/repeatList', data)
    },
    // 计划匹配重复审核列表 终止详情查看 按钮权限
    stopReasonInfo () {
    	return '/manage/visitFollowupPlan/frontEndBtnPermission'
    },
    // 菜单块的红点待办提示
    checkTips (data) {
    	return fetch('get', '/manage/check/tips', data)
    }
}
// 记录结果列表
export const recordResult = {
    followRecordList (data) {
        return fetch('get', '/manage/visitFollowupRecord/list', data)
    },
    // 记录详情
    followRecordDetail (data) {
        return fetch('get', '/manage/visitFollowupRecord/allInfo/' + data.id, {})
    }
}
// 人工外呼
export const phoneCalls = {
    // 列表(人工外呼)
    phoneCallsList (data) {
        return fetch('get', '/manage/visitFollowupRecordCall/allocated', data)
    },
    // 详情
    phoneCallsDetail (data) {
        return fetch('get', '/manage/visitFollowupRecordCall/detail', data)
    },
    // 提交
    phoneCallsSubmit (data) {
        return fetch('post', '/manage/visitFollowupRecordCall/submit', data)
    },
    // 全选所有的分配
    callRecordList (data) {
        return fetch('get', '/manage/visitFollowupRecordCall/all/allocating', data)
    },
    // 数据分配
    callDataDistribute (data) {
        return fetch('post', '/manage/visitFollowupRecordCall/allocating', data)
    },
    // 外呼数据查看
    callDataList (data) {
        return fetch('get', '/manage/visitFollowupRecordCall/artificialCall', data)
    },
    // 外呼记录分配列表
    callRecordDistribute (data) {
        return fetch('get', '/manage/visitFollowupRecordCall/distributableRecords', data)
    }
}
// 组织管理-字段属性管理
export const fieldManage = {
    list (data) {
        return fetch('get', '/manage/upmsField/list', data)
    },
    show (data) {
        return fetch('get', '/manage/upmsField/info/' + data.id, {})
    },
    create (data) {
        return fetch('post', '/manage/upmsField/add', data)
    },
    update (data) {
        return fetch('post', '/manage/upmsField/update', data)
    },
    delete (data) {
        return fetch('delete', '/manage/upmsField/delete/' + data.ids, {})
    }
}

// 组织管理-组织管理
export const organizeManage = {
     // 带数据权限的组织
     newOrangeTree (data) {
        return fetch('get', '/manage/upmsOrg/list', data)
    },
    // 组织树--返回树形
    newNumberTree (data) {
        return fetch('get', '/manage/upmsOrg/tree', data)
    },
    // 带数据权限的组织
    orangeList (data) {
        return fetch('get', '/manage/upmsOrganization/user/organization', data)
    },
    list (data) {
        return fetch('get', '/manage/upmsOrganization/list', data)
    },
    show (data) {
        return fetch('get', '/manage/upmsOrganization/info/' + data.id, {})
    },
    create (data) {
        return fetch('post', '/manage/upmsOrganization/create', data)
    },
    update (data) {
        return fetch('post', '/manage/upmsOrganization/update', data)
    },
    delete (data) {
        return fetch('delete', '/manage/upmsOrganization/delete/' + data.id, {})
    }
}

// 方案配置-语音
export const proConfig = {
    // 语音文件管理
    voiceList (data) {
        return fetch('get', '/manage/followupVoice/list', data)
    },
    // 语音文件删除
    voiceDelete (data) {
        return fetch('post', '/manage/followupVoice/delete', data)
    },
    // 添加语音文件
    addVoiceFile (data) {
        return fetch('post', '/manage/followupVoice/add', data)
    },
    // 编辑语音文件
    editVoiceFile (data) {
        return fetch('put', '/manage/followupVoice/update', data)
    },
    // 语音分类列表
    voiceSortList (data) {
        return fetch('get', '/manage/followupClassify/list', data)
    },
    // 添加语音分类
    addVoiceSort (data) {
        return fetch('post', '/manage/followupClassify/add', data)
    },
    // 语音分类删除
    DelVoiceSort (data) {
        return fetch('post', '/manage/followupClassify/delete', data)
    },
    // 批量新增
    batchVoiceAdd (data) {
        return fetch('post', '/manage/followupVoice/batchAdd', data)
    },
    // 下载
    batchImport (data) {
        return fetch('get', '/manage/followupVoice/uploadVoice', data)
    },
    // 覆盖重名的语音文件
    coverVoiceFile (data) {
        return fetch('post', '/manage/followupVoice/coverFile', data)
    },
    // 错误信息导出
    errMesExport (data) {
        return fetch('get', '/manage/followupVoice/VoiceErrorExcel', data)
    },
    // 清除缓存语音文件
    clearCache (data) {
        return fetch('post', '/manage/followupVoice/deleteCacheFile', data)
    }

}

// 方案配置-通用库
export const commonLib = {
    // 通用库列表
    commonList (data) {
        return fetch('get', '/manage/followupLib/list', data)
    },
    // 导入
    commonImport (data) {
        return fetch('post', '/import/lib', data)
    },
    // 修改
    commonEdit (data) {
        return fetch('put', '/manage/followupLib/update', data)
    },
    // 删除
    commonDelete (data) {
        return fetch('delete', '/manage/followupLib/delete/' + data.id, {})
    },
    // 导出
    commonExport (data) {
        return fetch('get', '/export/lib/' + data.id, {})
    },
    // 新增
    commonAdd (data) {
        return fetch('post', '/manage/followupLib/add', data)
    },
    // 查看
    commonDetail (data) {
        return fetch('get', '/manage/followupLib/info/' + data.id, {})
    }
}

// 短信管理- 短信平台配置
export const mesConfig = {
    // 列表
    mesList (data) {
        return fetch('get', '/manage/followupSmsCenter/list', data)
    },
    // 添加
    mesAdd (data) {
        return fetch('post', '/manage/followupSmsCenter/add', data)
    },
    // 修改
    mesEdit (data) {
        return fetch('put', '/manage/followupSmsCenter/update', data)
    },
    // 删除
    mesDelete (data) {
        return fetch('post', '/manage/followupSmsCenter/delete', data)
    }
}
// 短信管理- 短信模板
export const mesTemplate = {
    templateList (data) {
        return fetch('get', '/manage/followupSmsTemplate/list', data)
    },
    // 删除
    templateDel (data) {
        return fetch('post', '/manage/followupSmsTemplate/delete', data)
    },
    // 新增
    templateAdd (data) {
        return fetch('post', '/manage/followupSmsTemplate/add', data)
    },
    // 修改
    templateEdit (data) {
        return fetch('put', '/manage/followupSmsTemplate/update', data)
    }
}
// 系统设置-合成语音管理
export const composeVoice = {
    composeList (data) {
        return fetch('get', '/manage/followupVariable/list', data)
    },
    composeAdd (data) {
        return fetch('post', '/manage/followupVariable/add', data)
    },
    composeEdit (data) {
        return fetch('post', '/manage/followupVariable/update', data)
    },
    composeDelete (data) {
        return fetch('delete', '/manage/followupVariable/delete/' + data.id, data)
    },
    // 对应字段下拉框
    fileDropDown (data) {
        return fetch('get', '/manage/followupVariable/showTableInfo', data)
    }
}

// 系统设置-机器人配置
export const robotConfig = {
    robotList (data) {
        return fetch('get', '/manage/followupSchemeAi/list', data)
    },
    // 修改
    robotEdit (data) {
        return fetch('post', '/manage/followupSchemeAi/update', data)
    },
    // 添加
    robotAdd (data) {
        return fetch('post', '/manage/followupSchemeAi/add', data)
    },
    // 移除
    robotDelete (data) {
        return fetch('delete', '/manage/followupSchemeAi/delete/' + data.aiId, {})
    }
}

// 数据统计-统计汇总结果项设置
export const countResult = {
    resultList (data) {
        return fetch('get', '/manage/reportCollectResult/list', data)
    },
    resultAdd (data) {
        return fetch('post', '/manage/reportCollectResult/add', data)
    },
    resultDelete (data) {
        return fetch('post', '/manage/reportCollectResult/delete', data)
    },
    resultEdit (data) {
        return fetch('post', '/manage/reportCollectResult/update', data)
    }
}
// 数据统计-统计汇总模版设置
export const countTemp = {
    countTempList (data) {
        return fetch('get', '/manage/reportSummaryTemplate/list', data)
    },
    countTempDel (data) {
        return fetch('delete', '/manage/reportSummaryTemplate/delete/' + data.ids, {})
    },
    countTempAdd (data) {
        return fetch('post', '/manage/reportSummaryTemplate/add', data)
    },
    // 查看模板的所有信息
    countTempMes (data) {
        return fetch('get', '/manage/reportSummaryTemplate/allinfo/' + data.id, {})
    },
    // 编辑
    countTempEdit (data) {
        return fetch('post', '/manage/reportSummaryTemplate/update', data)
    }
}

// 数据统计-随访明细模版设置
export const followTemp = {
    followTempList (data) {
        return fetch('get', '/manage/reportFollowupMould/list', data)
    },
    followTempDel (data) {
        return fetch('post', '/manage/reportFollowupMould/delete', data)
    },
    followTempField (data) {
        return fetch('get', '/manage/reportFollowupMould/fieldInfo', data)
    },
    followTempAdd (data) {
        return fetch('post', '/manage/reportFollowupMould/add', data)
    },
    followTempEdit (data) {
        return fetch('put', '/manage/reportFollowupMould/update', data)
    },
    followTempDetail (data) {
        return fetch('get', '/manage/reportFollowupMould/info/' + data.id, {})
    },
    // 数据明细列表
    dataDetailList (data) {
        return fetch('post', '/manage/reportFollowupMould/statistics', data)
    },
    // 导出报表
    dataDetailExport (data) {
        return fetch('post', '/manage/reportFollowupMould/statisticsExcel', data)
    },
    // 疾病
    dataDisease (data) {
        return fetch('get', '/manage/upmsDisease/list', data)
    }

}

// 用户角色与权限-系统配置
export const systemSet = {
    list (data) {
        return fetch('get', '/manage/upmsSystem/list', data)
    },
    create (data) {
        return fetch('post', '/manage/upmsSystem/create', data)
    },
    update (data) {
        return fetch('post', '/manage/upmsSystem/update', data)
    },
    delete (data) {
        return fetch('delete', '/manage/upmsSystem/delete/' + data.ids, {})
    }
}
// 用户角色与权限-菜单管理
export const menuManage = {
    list (data) {
        return fetch('get', '/manage/upmsMenu/list', data)
    },
    add (data) {
        return fetch('post', '/manage/upmsMenu/add', data)
    },
    update (data) {
        return fetch('put', '/manage/upmsMenu/update', data)
    },
    delete (data) {
        return fetch('delete', '/manage/upmsMenu/delete/' + data.ids, {})
    }
}
// 用户角色与权限-角色管理
export const roleManage = {
    list (data) {
        return fetch('get', '/manage/upmsRole/list', data)
    },
    create (data) {
        return fetch('post', '/manage/upmsRole/create', data)
    },
    update (data) {
        return fetch('put', '/manage/upmsRole/update', data)
    },
    delete (data) {
        return fetch('delete', '/manage/upmsRole/delete/' + data.ids, {})
    },
    getActiveTypeSelected (data) {
        return fetch('get', '/manage/upmsRoleActive/list', data)
    },
    getMenuSelected (data) {
        return fetch('get', '/manage/upmsRoleMenu/list', data)
    }
}
// 用户角色与权限-用户管理
export const userManage = {
    list (data) {
        return fetch('get', '/manage/upmsUser/list', data)
    },
    delete (data) {
    	return fetch('delete', '/manage/upmsUser/delete/' + data.ids, {})
    },
    // 新的复制权限
    copyPermission (data) {
        return fetch('post', '/manage/upmsUser/copy', data)
    },
    // 新的基本信息的添加
    infoAdd (data) {
        return fetch('post', '/manage/upmsUser/add', data)
    },
    // 新的列表的查看
    infoListLook (data) {
        return fetch('get', '/manage/upmsUser/info/' + data.id, {})
    },
    // 新的用户角色管理
    upmsUserRole (data) {
        return fetch('get', '/manage/upmsUserRole/list', data)
    },
    // 新的角色管理
    upmsRole (data) {
        return fetch('get', '/manage/upmsRole/list', data)
    },
    // 新的新增或修改用户角色
    upmsRoleAdd (data) {
        return fetch('post', '/manage/upmsUserRole/addOrUpdate', data)
    },
    create (data) {
        return fetch('post', '/manage/upmsUser/create', data)
    },
    // 注意：修改的时候，密码如果没有修改，不要传密码了(因为密码是加密的)
    update (data) {
        return fetch('put', '/manage/upmsUser/update', data)
    },
    baseInfo (data) {
        return fetch('get', '/manage/upmsUser/info/' + data.id, {})
    },
    allInfo (data) {
        return fetch('get', '/manage/upmsUser/allinfo/' + data.id, {})
    },
    // tab2 角色
    updateRole (data) {
        return fetch('post', '/manage/upmsUser/userrole', data)
    },
    // tab3 组织数据权限
    updateOrg (data) {
        return fetch('post', '/manage/upmsUser/userorganization', data)
    },
    addOrg (data) {
        return fetch('post', '/manage/upmsUserOrg/addOrUpdate', data)
    },
    // tab4 关联用户数据
    // 新的数据关联
    upmsUserUserAdd (data) {
        return fetch('post', '/manage/upmsUserUser/add', data)
    },
    // 新的数据已关联
    upmsUserUserDelete (data) {
        return fetch('delete', '/manage/upmsUserUser/delete', data)
    },
    updateUserData (data) {
        return fetch('post', '/manage/upmsUser/useruser', data)
    },
    deleteUserData (data) {
        return fetch('post', '/manage/upmsUser/userUserDelete', data)
    },
    // tab5 方案
    updateScheme (data) {
        return fetch('post', '/manage/upmsUser/userscheme', data)
    },
    // tab6 疾病
    updateDisease (data) {
        return fetch('post', '/manage/upmsUser/usersdisease', data)
    },
    // 新的关联用户的列表
    relatedUserList (data) {
        return fetch('get', '/manage/upmsUserUser/list', data)
    },
    userUserList (data) {
        return fetch('get', '/manage/upmsUser/userUserList', data)
    }
}
// 医疗机构
export const medicalManage = {
    list (data) {
        return fetch('get', '/manage/upmsMedical/list', data)
    }
}
// 用户角色与权限--系统参数类型
export const systemParamType = {
    list (data) {
        return fetch('get', '/manage/upmsParamType/list', data)
    },
    add (data) {
        return fetch('post', '/manage/upmsParamType/add', data)
    },
    update (data) {
        return fetch('post', '/manage/upmsParamType/update', data)
    },
    delete (data) {
        return fetch('delete', '/manage/upmsParamType/delete/' + data.ids, {})
    }
}
// 用户角色与权限--系统参数管理
export const systemParamManage = {
    list (data) {
        return fetch('get', '/manage/upmsParamData/list', data)
    },
    add (data) {
        return fetch('post', '/manage/upmsParamData/add', data)
    },
    update (data) {
        return fetch('post', '/manage/upmsParamData/update', data)
    },
    delete (data) {
        return fetch('delete', '/manage/upmsParamData/delete/' + data.ids, {})
    }
}
// 随访记录/审核管理
export const followupRecord = {
    checkList (data) {
        return fetch('get', '/manage/visitFollowupRecord/checkList', data)
    },
    allInfo (data) {
        return fetch('get', '/manage/visitFollowupRecord/allInfo/' + data.id, {})
    },
    // 随访记录详情审核--提交
    recordVet (data) {
    	return fetch('post', '/manage/visitFollowupRecord/vet', data)
    },
    allCheckList (data) {
        return fetch('get', '/manage/visitFollowupRecord/allCheckList', data)
    }
}
// 随访记录分配审核管理
export const followupDistribute = {
    list (data) {
        return fetch('get', '/manage/visitFollowupRecordDistribution/list', data)
    },
    add (data) {
        return fetch('post', '/manage/visitFollowupRecordDistribution/add', data)
    }
}

// 随访模板管理
export const templateManage = {
    list (data) {
        return fetch('get', '/manage/followupTemplate/list', data)
    },
    add (data) {
        return fetch('post', '/manage/followupTemplate/add', data)
    },
    update (data) {
        return fetch('post', '/manage/followupTemplate/update', data)
    },
    delete (data) {
        return fetch('delete', '/manage/followupTemplate/delete/' + data.id, {})
    },
    import (data) {
        return fetch('post', '/manage/followupTemplate/import', data)
    },
    allInfo (data) {
    	return fetch('get', '/manage/followupTemplate/allInfo/' + data.id, {})
    },
    download (data) {
    	return '/manage/followupTemplate/export'
    }
}
// 随访指标管理
export const indexManage = {
    list (data) {
        return fetch('get', '/manage/followupTarget/list', data)
    },
    delete (data) {
        return fetch('delete', '/manage/followupTarget/delete/' + data.id, {})
    },
    add (data) {
        return fetch('post', '/manage/followupTarget/add', data)
    },
    update (data) {
        return fetch('put', '/manage/followupTarget/update', data)
    },
    info (data) {
        return fetch('get', '/manage/followupTarget/info/' + data.id, {})
    }
}
// 随访问题管理
export const questionManage = {
    list (data) {
        return fetch('get', '/manage/followupQuestion/list', data)
    },
    delete (data) {
        return fetch('delete', '/manage/followupQuestion/delete/' + data.id, {})
    },
    add (data) {
        return fetch('post', '/manage/followupQuestion/add', data)
    },
    update (data) {
        return fetch('put', '/manage/followupQuestion/update', data)
    },
    info (data) {
        return fetch('get', '/manage/followupQuestion/info/' + data.id, {})
    }
}
// 随访问题管理--话术编辑
export const questionEdit = {
    info (data) {
        return fetch('get', '/manage/followupQuestionCallScript/info/' + data.id, {})
    },
    add (data) {
        return fetch('post', '/manage/followupQuestionCallScript/add', data)
    }
}
// 方案配置-方案管理
export const schemeManage = {
    list (data) {
        return fetch('get', '/manage/followupScheme/list', data)
    },
    add (data) {
        return fetch('post', '/manage/followupScheme/add', data)
    },
    update (data) {
        return fetch('post', '/manage/followupScheme/update', data)
    },
    delete (data) {
        return fetch('delete', '/manage/followupScheme/delete/' + data.id, {})
    },
    authorization (data) {
        return fetch('post', '/followupScheme/authorization', data)
    },
    allInfo (data) {
        return fetch('get', '/manage/followupScheme/allInfo/' + data.id, {})
    },
    preview (data) {
    	return fetch('post', '/manage/followupScheme/preview', data)
    }
}
// 临时随访
export const followupTemporary = {
    temporaryPatient (data) {
        return fetch('get', '/manage/FollowupTemporary/temporaryPatient', data)
    },
    activeList (data) {
    	return fetch('get', '/manage/FollowupTemporary/activeList', data)
    },
    userList (data) {
    	return fetch('get', '/manage/FollowupTemporary/userList', data)
    },
    add (data) {
    	return fetch('post', '/manage/FollowupTemporary/add', data)
    },
    // step3 随访信息
    listById (data) {
    	return fetch('get', '/manage/followupSchemeWav/listById', data)
    }
}
// 疾病管理
export const diseaseManage = {
    add (data) {
        return fetch('post', '/manage/upmsDisease/add', data)
    },
    list (data) {
        return fetch('get', '/manage/upmsDisease/list', data)
    },
    update (data) {
        return fetch('post', '/manage/upmsDisease/update', data)
    },
    delete (data) {
        return fetch('delete', '/manage/upmsDisease/delete/' + data.ids, {})
    }
}
// 医疗机构
export const InstitutionalManage = {
    add (data) {
        return fetch('post', '/manage/upmsMedical/add', data)
    },
    list (data) {
        return fetch('get', '/manage/upmsMedical/list', data)
    },
    update (data) {
        return fetch('post', '/manage/upmsMedical/update', data)
    },
    delete (data) {
        return fetch('delete', '/manage/upmsMedical/delete/' + data.ids, {})
    }
}
// 数据汇总统计
export const dataCollect = {
    list (data) {
        return fetch('get', '/manage/reportSummaryTemplate/list', data)
    },
    summary (data) {
        return fetch('get', '/manage/reportSummaryTemplate/summary', data)
    },
    columns (data) {
    	return fetch('get', '/manage/reportSummaryTemplate/columns', data)
    },
    export () {
    	return '/manage/reportSummaryTemplate/export'
    }
}
