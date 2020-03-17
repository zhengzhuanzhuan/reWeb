import axios from 'axios'
import qs from 'qs'
import Cookies from 'js-cookie'

export const postExportExcelFunc = function (data, url, exportName = '导出') {
    // console.log(data);
    axios({ // 用axios发送post请求
        method: 'post',
        url: url, // 请求地址
        data: data, // 参数
        responseType: 'blob', // 表明返回服务器返回的数据类型
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => {
        // console.log(res);
        const blob = new Blob([res.data], {
            type: res.headers['Content-Type']
        })
        const fileName = exportName + '.xls'
        const elink = document.createElement('a')
        elink.download = fileName
        elink.style.display = 'none'
        elink.href = URL.createObjectURL(blob)
        document.body.appendChild(elink)
        elink.click()
        URL.revokeObjectURL(elink.href) // 释放URL 对象
        document.body.removeChild(elink)
    })
}

let JsonData = [
    '/manage/upmsUserRole/addOrUpdate',
    // '/manage/visitPlanType/add',
    // '/manage/visitPlanType/update',
    // '/manage/visitFieldSettings/save',
    // '/manage/visitFollowupRecord/vet',
    // '/manage/visitFollowupRecordCall/submit',
    // '/manage/visitFollowupRecordDistribution/add',
    // '/manage/followupTarget/add',
    // '/manage/followupTarget/update',
    // '/manage/followupQuestion/add',
    // '/manage/followupQuestion/update',
    // '/manage/followupQuestionCallScript/add',
    // '/manage/followupTemplate/add',
    // '/manage/followupTemplate/update',
    // '/manage/followupLib/add',
    // '/manage/followupLib/update',
    // '/manage/reportSummaryTemplate/add',
    // '/manage/reportSummaryTemplate/update',
    // '/manage/followupScheme/add',
    // '/manage/followupScheme/update',
    // '/manage/reportFollowupMould/update',
    // '/manage/reportFollowupMould/add',
    // '/manage/followupScheme/preview',
    // '/followupScheme/authorization',
    // '/manage/reportFollowupMould/statistics',
    // '/manage/FollowupTemporary/add',
    // '/manage/reportFollowupMould/statisticsExcel'
]
// post multipart/form-data格式上传的接口
let FormData = [
    // '/manage/upmsUser/create',
    // '/manage/upmsUser/add',
    // '/manage/upmsUser/update',
    // '/manage/upmsOrganization/update',
    // '/manage/upmsOrganization/create',
    // '/manage/followupVoice/add',
    // '/manage/followupVoice/update',
    // '/manage/followupVoice/batchAdd',
    // '/manage/upmsSystem/create',
    // '/manage/upmsSystem/update',
    // '/manage/visitPatientInfo/patientImport',
    // '/manage/followupTemplate/import'
]
// 添加请求拦截器
axios.interceptors.request.use(
    function (config) {
        let flag = 0
        for (let item of JsonData) {
            if (config.url.indexOf(item) !== -1) {
                flag++
                break
            }
        }
        let flagSecond = 0
        for (let item of FormData) {
            if (config.url.indexOf(item) !== -1) {
                flagSecond++
                break
            }
        }
        // 在发送请求之前做些什么
        if (flag > 0) {
        console.log(1)
            config.headers = {
                'Content-Type': 'application/json;charset=utf-8'
            }
        } else if (flagSecond > 0) {
            console.log(2)
            config.headers = {
                // 'Content-Type': 'multipart/form-data;charset=utf-8'
                // 'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundary04KoNV9lwMWGnAq1'
            }
        } else {
            console.log(3)
            config.data = qs.stringify(config.data)
            config.headers = {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            }
        }
        // 设置cookie
        config.params = config.params || {}
        // config.params['rs-upms-server-session-id'] = Cookies.get('rs-upms-server-session-id') // todo to check
        config.params['rs-upms-server-session-id'] = sessionStorage.getItem('rsysSessionId')
        return config
    },
    function (error) {
    // 对请求错误做些什么
        return Promise.reject(error)
    }
)
const codeMessage = {
    200: '服务器成功返回请求的数据。',
    201: '新建或修改数据成功。',
    202: '一个请求已经进入后台排队（异步任务）。',
    204: '删除数据成功。',
    400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
    401: '用户没有权限（令牌、用户名、密码错误）。',
    403: '用户得到授权，但是访问是被禁止的。',
    404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
    406: '请求的格式不可得。',
    410: '请求的资源被永久删除，且不会再得到的。',
    422: '当创建一个对象时，发生一个验证错误。',
    500: '服务器发生错误，请检查服务器。',
    502: '网关错误。',
    503: '服务不可用，服务器暂时过载或维护。',
    504: '网关超时。'
}
/**
 * @function 请求状态码检测
 * @param  {type} response {description}
 * @return {type} {description}
 */
const checkStatus = response => {
    if (response.status >= 200 && response.status < 300) {
        return response
    }
    const errortext = codeMessage[response.status] || response.statusText
    window.RSYS.$Message.warning(
        `请求错误 ${response.status}: ${response.url},${errortext}`
    )
    const error = new Error(errortext)
    error.name = response.status
    error.response = response
    throw error
}
/* 返回一个Promise(发送post请求) */
export const fetch = (type, url, params) => {
    return new Promise((resolve, reject) => {
        let data = type === 'get' ? { params: params } : params
        axios[type](url, data)
            .then(checkStatus)
            .then(response => {
            	// todo logout接口的传参
            	if (response.data === '' || response.data.code === 10107 || (typeof response.data === 'string' && response.data.indexOf('DOCTYPE') !== -1)) {
                    sessionStorage.setItem('rsysSessionId', '')
                    window.RSYS.$router.push('/login')
                }
                if (response.data.code === undefined) {
                    response.data = JSON.parse(response.data)
                }
                let code
                window.RSYS.$Spin.hide()
                try {
                    code = response.data.code
                } catch (error) {
                    resolve(response.data)
                }
                if (code === 2 || code === 21) {
                    window.RSYS.$router.push('/login')
                } else if (code === 1) {
                    resolve(response.data)
                } else {
                	if (response.message || response.data.message) {
                        window.RSYS.$Message.warning(response.message || response.data.message)
                    } else {
                		// 解决长时间不使用(登录超时？？？)导致请求302，跳转至登录页重新登录
                        sessionStorage.setItem('rsysSessionId', '')
                        window.RSYS.$router.push('/login')
                    }
                    reject(response)
                }
            })
    })
}

// 需要额外传类似get方式传参的时候用上
export const putParamsFormat = (url, idKey, data) => {
    let str = url + '/?'
    if (idKey) {
        str = url + '/' + data[idKey] + '?'
    }
    for (const key in data) {
        str += key + '=' + (data[key] ? data[key] : '') + '&'
    }
    return fetch('put', str, {})
}

// 需要额外传类似get方式传参的时候用上
export const dataFormFormat = (type, url, idKey, data, dataFormData) => {
    let str = url + '/?'
    if (idKey) {
        str = url + '/' + data[idKey] + '?'
    }
    for (const key in data) {
        str += key + '=' + (data[key] ? data[key] : '') + '&'
    }
    return fetch(type, str, dataFormData)
}
if (process.env.NODE_ENV === 'development') {
    // axios.defaults.baseURL = 'http://192.168.1.218:9011'
    // axios.defaults.baseURL = 'http://192.168.1.215:8011'
    // axios.defaults.baseURL = 'http://192.168.3.25:8001'
    // axios.defaults.baseURL = 'http://192.168.3.29:8001'
    // axios.defaults.baseURL = 'http://192.168.3.69:8001'
    // axios.defaults.baseURL = 'http://112.17.124.29:8018'
}
