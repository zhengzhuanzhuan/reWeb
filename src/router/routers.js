import Main from '@/components/main'

/**
 * iview-admin中meta除了原生参数外可配置的参数:
 * meta: {
 *  title: { String|Number|Function }
 *         显示在侧边栏、面包屑和标签栏的文字
 *         使用'{{ 多语言字段 }}'形式结合多语言使用，例子看多语言的路由配置;
 *         可以传入一个回调函数，参数是当前路由对象，例子看动态路由和带参路由
 *  hideInBread: (false) 设为true后此级路由将不会出现在面包屑中，示例看QQ群路由配置
 *  hideInMenu: (false) 设为true后在左侧菜单不会显示该页面选项
 *  notCache: (false) 设为true后页面在切换标签后不会缓存，如果需要缓存，无需设置这个字段，而且需要设置页面组件name属性和路由配置的name一致
 *  access: (null) 可访问该页面的权限数组，当前路由设置的权限会影响子路由
 *  icon: (-) 该页面在左侧菜单、面包屑和标签导航处显示的图标，如果是自定义图标，需要在图标名称前加下划线'_'
 *  beforeCloseName: (-) 设置该字段，则在关闭当前tab页时会去'@/router/before-close.js'里寻找该字段名对应的方法，作为关闭前的钩子函数
 * }
 */
// 菜单 0  左边显示
// 页面 1
import { handleMenus } from '@/libs/businessUtil'
const menusNum = JSON.parse(localStorage.getItem('rsysMenus'))
// console.log(menusNum, '原始数据')
const menusLable = handleMenus(menusNum)
// console.log(menusLable, '修改过得数据')
// const menuArray = menusLable.map((item) => ({
//     path: (item.children.length ? item.menuUrl : (item.menuUrl && `/${item.menuUrl.split('/')[1]}`)) || '/',
//     name: item.children.length ? (item.menuUrl && item.menuUrl.slice(1)) : (item.menuUrl && item.menuUrl.split('/')[1]),
//     meta: {
//         icon: item.menuLogo || 'md-menu',
//         title: item.menuName,
//         hideInBread: !item.children.length,
//         keepAlive: false
//     },
//     component: Main,
//     children: item.children.length
//         ? (item.children.map(e => ({
//             path: ((e.menuUrl && e.menuUrl.split('/')[2]) || '/'),
//             name: ((e.menuUrl && e.menuUrl.split('/')[2]) || '/'),
//             meta: {
//                 icon: e.menuLogo || 'md-menu',
//                 title: e.menuName,
//                 hideInMenu: !!e.menuType
//             },
//             component: () => import(`@/view${e.menuUrl}`)
//         })))
//         :		([
//             {
//                 path: ((item.menuUrl && item.menuUrl.split('/')[2]) || '/'),
//                 name: ((item.menuUrl && item.menuUrl.split('/')[2]) || '/'),
//                 meta: {
//                     icon: 'md-menu',
//                     title: item.menuName,
//                     hideInMenu: !!item.menuType
//                 },
//                 component: () => import(`@/view${item.menuUrl}`)
//             }
//         ])
// }))
// 计划管理
const oldRouter = [
    {
        path: '/planManage',
        meta: {
            title: '计划管理'
        },
        name: 'planManage',
        component: Main,
        children: [
            {
                path: 'planType',
                meta: {
                    title: '计划类型管理'
                },
                name: 'planType',
                component: () => import('@/view/planManage/planType.vue')
            },
            {
                path: 'manageFilesAdd',
                meta: { title: '管理台字段添加', hideInMenu: true },
                name: 'manageFilesAdd',
                component: () => import('@/view/planManage/manageFileAdd.vue')
            },
            {
                path: 'addPlanType',
                meta: { title: '添加计划类型', hideInMenu: true },
                name: 'addPlanType',
                component: () => import('@/view/planManage/addPlanType.vue')
            },
            {
                path: 'planList',
                meta: { title: '计划列表' },
                name: 'planList',
                component: () => import('@/view/planManage/planList.vue')
            },
            {
                path: 'recordResult',
                meta: { title: '记录结果列表' },
                name: 'recordResult',
                component: () => import('@/view/planManage/recordResult.vue')
            }
        ]
    },
    // 组织管理
    {
        path: '/organization',
        name: 'organization',
        meta: {
            icon: 'md-menu',
            title: '组织管理'
        },
        component: Main,
        children: [
            {
                path: 'field-page',
                name: 'field-page',
                meta: {
                    icon: '',
                    title: '字段属性管理'
                },
                component: () => import('@/view/organization/field-page.vue')
            },
            {
                path: 'organization-page',
                name: 'organization-page',
                meta: {
                    icon: '',
                    title: '组织管理'
                },
                component: () => import('@/view/organization/organization-page.vue')
            }
        ]
    },
    {
        path: '/user-role',
        meta: {
            title: '用户与权限'
        },
        name: 'user-role',
        component: Main,
        children: [
            {
                path: 'system-set',
                meta: { title: '系统配置' },
                name: 'system-set',
                component: () => import('@/view/user-role/system-set.vue')
            },
            {
                path: 'menu-manage',
                meta: { title: '菜单管理' },
                name: 'menu-manage',
                component: () => import('@/view/user-role/menu-manage.vue')
            },
            {
                path: 'role-manage',
                meta: { title: '角色管理' },
                name: 'role-manage',
                component: () => import('@/view/user-role/role-manage.vue')
            },
            {
                path: 'role-edit',
                meta: { title: '角色编辑', hideInMenu: true },
                name: 'role-edit',
                component: () => import('@/view/user-role/role-edit.vue')
            },
            {
                path: 'user-manage',
                meta: { title: '用户管理' },
                name: 'user-manage',
                component: () => import('@/view/user-role/user-manage.vue')
            },
            {
                path: 'user-edit',
                meta: { title: '用户编辑', hideInMenu: true, keepAlive: false },
                name: 'user-edit',
                component: () => import('@/view/user-role/user-edit.vue')
            },
            {
                path: 'system-param-type',
                meta: { title: '系统参数类型' },
                name: 'system-param-type',
                component: () => import('@/view/user-role/system-param-type.vue')
            },
            {
                path: 'system-param-manage',
                meta: { title: '系统参数管理' },
                name: 'system-param-manage',
                component: () => import('@/view/user-role/system-param-manage.vue')
            }
        ]
    },
    // 人工审核
    {
        path: '/manualAudit',
        meta: {
            title: '人工审核'
        },
        name: 'manualAudit',
        component: Main,
        children: [
            {
                path: 'planMatchRepeatReview',
                meta: {
                    title: '计划匹配重复审核'
                },
                name: 'planMatchRepeatReview',
                component: () => import('@/view/manualAudit/planMatchRepeatReview.vue')
            },
            {
                path: 'followUpRecordReview',
                meta: {
                    title: '随访记录审核'
                },
                name: 'followUpRecordReview',
                component: () => import('@/view/manualAudit/followUpRecordReview.vue')
            },
            {
                path: 'outSideCall',
                meta: {
                    title: '人工电话外呼'
                },
                name: 'outSideCall',
                component: () => import('@/view/manualAudit/outSideCall.vue')
            },
            {
                path: 'followUpRecordDistribute',
                meta: {
                    title: '审核记录分配'
                },
                name: 'followUpRecordDistribute',
                component: () => import('@/view/manualAudit/followUpRecordDistribute.vue')
            },
            {
                path: 'auditDataLook',
                meta: {
                    title: '审核数据查看'
                },
                name: 'auditDataLook',
                component: () => import('@/view/manualAudit/auditDataLook.vue')
            }
        ]
    },
    // 方案配置
    {
        path: '/proConfig',
        meta: {
            title: '方案配置'
        },
        name: 'proConfig',
        component: Main,
        children: [
            {
                path: 'voiceManage',
                meta: {
                    title: '语音文件管理'
                },
                name: 'voiceManage',
                component: () => import('@/view/proConfig/voiceManage.vue')
            },
            {
                path: 'comManage',
                meta: {
                    title: '通用库管理',
                    keepAlive: true
                },
                name: 'comManage',
                component: () => import('@/view/proConfig/commonManage.vue')
            },
            {
                path: 'addCommonLib',
                meta: { title: '添加通用库', hideInMenu: true, keepAlive: true },
                name: 'addCommonLib',
                component: () => import('@/view/proConfig/addCommonLib.vue')
            },
            {
                path: 'indexManage',
                meta: {
                    title: '指标管理'
                },
                name: 'indexManage',
                component: () => import('@/view/proConfig/indexManage.vue')
            },
            {
                path: 'questionManage',
                meta: {
                    title: '问题管理'
                },
                name: 'questionManage',
                component: () => import('@/view/proConfig/questionManage.vue')
            },
            {
                path: 'questionEdit',
                meta: { title: '编辑话术', hideInMenu: true, keepAlive: false },
                name: 'questionEdit',
                component: () => import('@/view/proConfig/questionEdit.vue')
            },
            {
                path: 'templateManage',
                meta: {
                    title: '模板管理'
                },
                name: 'templateManage',
                component: () => import('@/view/proConfig/templateManage.vue')
            },
            {
                path: 'templateEdit',
                meta: { title: '编辑模板', hideInMenu: true, keepAlive: false },
                name: 'templateEdit',
                component: () => import('@/view/proConfig/templateEdit.vue')
            },
            {
                path: 'schemeManage',
                meta: {
                    title: '方案管理'
                },
                name: 'schemeManage',
                component: () => import('@/view/proConfig/schemeManage.vue')
            },
            {
                path: 'schemeEdit',
                meta: { title: '编辑方案', hideInMenu: true, keepAlive: false },
                name: 'schemeEdit',
                component: () => import('@/view/proConfig/schemeEdit.vue')
            }
        ]
    },
    // 短信管理
    {
        path: '/mesManage',
        meta: {
            title: '短信管理'
        },
        name: 'mesManage',
        component: Main,
        children: [
            {
                path: 'mesPlatform',
                meta: {
                    title: '短信平台配置'
                },
                name: 'mesPlatform',
                component: () => import('@/view/mesManage/mesPlatform.vue')
            },
            {
                path: 'mesTemplate',
                meta: {
                    title: '短信模版'
                },
                name: 'mesTemplate',
                component: () => import('@/view/mesManage/mesTemplate.vue')

            }
        ]
    },
    // 系统设置
    {
        path: '/systemSetup',
        meta: {
            title: '系统设置'
        },
        name: 'systemSetup',
        component: Main,
        children: [
            {
                path: 'composeVoice',
                meta: {
                    title: '随访语音变量'
                },
                name: 'composeVoice',
                component: () => import('@/view/systemSetup/composeVoice.vue')
            },
            {
                path: 'robotConfig',
                meta: {
                    title: '机器人配置'
                },
                name: 'robotConfig',
                component: () => import('@/view/systemSetup/robotConfig.vue')
            }
    	]
    },
    // 数据统计
    {
        path: '/dataCount',
        meta: {
            title: '数据统计'
        },
        name: 'dataCount',
        component: Main,
        children: [
            {
                path: 'countResultSet',
                meta: {
                    title: '统计汇总结果项设置'
                },
                name: 'countResultSet',
                component: () => import('@/view/systemSetup/composeVoice.vue')
            },
            {
                path: 'countTempSet',
                meta: {
                    title: '统计汇总模版设置'
                },
                name: 'countTempSet',
                component: () => import('@/view/systemSetup/robotConfig.vue')
            },
            {
                path: 'followTempSet',
                meta: {
                    title: '随访明细模板设置'
                },
                name: 'followTempSet',
                component: () => import('@/view/systemSetup/robotConfig.vue')
            }
    	]
    }]
export default [
    {
        path: '/login',
        name: 'login',
        meta: {
            title: 'Login - 登录',
            hideInMenu: true
        },
        component: () => import('@/view/login/login.vue')
    },
    {
        path: '*',
        name: 'error_404',
        meta: {
            hideInMenu: true
        },
        component: () => import('@/view/error-page/404.vue')
    },
    {
        path: '/',
        name: '_home',
        redirect: '/home',
        component: Main,
        meta: {
            hideInMenu: true,
            notCache: true
        },
        children: [
            {
                path: '/home',
                name: 'home',
                meta: {
                    hideInMenu: true,
                    title: '首页',
                    notCache: true,
                    icon: 'md-home'
                },
                component: () => import('@/view/single-page/home')
            }
        ]
    },
    // ...menuArray
    // // 患者管理
    // {
    // 	path: '/patient',
    // 	name: 'patient',
    // 	meta: {
    // 		// 无子集
    // 		title: '患者管理',
    // 		hideInBread: true
    // 	},
    // 	component: Main,
    // 	children: [
    // 		{
    // 			path: 'manage',
    // 			name: 'manage',
    // 			meta: {
    // 				title: '患者管理'
    // 			},
    // 			component: () => import('@/view/patient/manage.vue')
    // 		}
    // 	]
    // },

    // // 计划管理
    // {
    // 	path: '/planManage',
    // 	meta: {
    // 		title: '计划管理',
    // 		// 隐藏父及
    // 		hideInBread: false,
    // 		keepAlive: false,
    // 	},
    // 	name: 'planManage',
    // 	component: Main,
    // 	children: [
    // 		{
    // 			path: 'planType',
    // 			meta: {
    // 				icon: '',
    // 				title: '计划类型管理',
    // 				// 显示和隐藏侧边栏
    // 				hideInMenu: false,
    // 			},
    // 			name: 'planType',
    // 			component: () => import('@/view/planManage/planType.vue')
    // 		},
    // 		{
    // 			path: 'manageFilesAdd',
    // 			meta: {
    // 				title: '管理台字段添加',
    // 				// 隐藏侧边栏
    // 				hideInMenu: true
    // 			},
    // 			name: 'manageFilesAdd',
    // 			component: () => import('@/view/planManage/manageFileAdd.vue')
    // 		},
    // 		{
    // 			path: 'addPlanType',
    // 			meta: { title: '添加计划类型', hideInMenu: true },
    // 			name: 'addPlanType',
    // 			component: () => import('@/view/planManage/addPlanType.vue')
    // 		},
    // 		{
    // 			path: 'planList',
    // 			meta: { title: '计划列表' },
    // 			name: 'planList',
    // 			component: () => import('@/view/planManage/planList.vue')
    // 		},
    // 		{
    // 			path: 'recordResult',
    // 			meta: { title: '记录结果列表' },
    // 			name: 'recordResult',
    // 			component: () => import('@/view/planManage/recordResult.vue')
    // 		}
    // 	]
    // },
    // // 组织管理
    // {
    // 	path: '/organization',
    // 	name: 'organization',
    // 	meta: {
    // 		icon: 'md-menu',
    // 		title: '组织管理'
    // 	},
    // 	component: Main,
    // 	children: [
    // 		{
    // 			path: 'field-page',
    // 			name: 'field-page',
    // 			meta: {
    // 				icon: '',
    // 				title: '字段属性管理'
    // 			},
    // 			component: () => import('@/view/organization/field-page.vue')
    // 		},
    // 		{
    // 			path: 'organization-page',
    // 			name: 'organization-page',
    // 			meta: {
    // 				icon: '',
    // 				title: '组织管理'
    // 			},
    // 			component: () => import('@/view/organization/organization-page.vue')
    // 		}
    // 	]
    // },
    {
    	path: '/user-role',
    	meta: {
    		title: '用户角色与权限'
    	},
    	name: 'user-role',
    	component: Main,
    	children: [
    		{
    			path: 'system-set',
    			meta: { title: '系统配置' },
    			name: 'system-set',
    			component: () => import('@/view/user-role/system-set.vue')
    		},
    		{
    			path: 'menu-manage',
    			meta: { title: '菜单管理' },
    			name: 'menu-manage',
    			component: () => import('@/view/user-role/menu-manage.vue')
    		},
    		{
    			path: 'role-manage',
    			meta: { title: '角色管理' },
    			name: 'role-manage',
    			component: () => import('@/view/user-role/role-manage.vue')
    		},
    		{
    			path: 'role-edit',
    			meta: { title: '角色编辑', hideInMenu: true },
    			name: 'role-edit',
    			component: () => import('@/view/user-role/role-edit.vue')
    		},
    		{
    			path: 'user-manage',
    			meta: { title: '用户管理' },
    			name: 'user-manage',
    			component: () => import('@/view/user-role/user-manage.vue')
    		},
    		{
    			path: 'user-edit',
    			meta: { title: '用户编辑', hideInMenu: true, keepAlive: false },
    			name: 'user-edit',
    			component: () => import('@/view/user-role/user-edit.vue')
    		},
    		{
    			path: 'system-param-type',
    			meta: { title: '系统参数类型' },
    			name: 'system-param-type',
    			component: () => import('@/view/user-role/system-param-type.vue')
    		},
    		{
    			path: 'system-param-manage',
    			meta: { title: '系统参数管理' },
    			name: 'system-param-manage',
    			component: () => import('@/view/user-role/system-param-manage.vue')
    		}
    	]
    },
    //   // 人工审核
    // {
    // 	path: '/manualAudit',
    // 	meta: {
    // 		title: '人工审核'
    // 	},
    // 	name: 'manualAudit',
    // 	component: Main,
    // 	children: [
    // 		{
    // 			path: 'planMatchRepeatReview',
    // 			meta: {
    // 				title: '计划匹配重复审核'
    // 			},
    // 			name: 'planMatchRepeatReview',
    // 			component: () => import('@/view/manualAudit/planMatchRepeatReview.vue')
    // 		},
    // 		{
    // 			path: 'followUpRecordReview',
    // 			meta: {
    // 				title: '随访记录审核'
    // 			},
    // 			name: 'followUpRecordReview',
    // 			component: () => import('@/view/manualAudit/followUpRecordReview.vue')
    // 		},
    // 		{
    // 			path: 'outSideCall',
    // 			meta: {
    // 				title: '人工电话外呼'
    // 			},
    // 			name: 'outSideCall',
    // 			component: () => import('@/view/manualAudit/outSideCall.vue')
    // 		},
    // 		{
    // 			path: 'followUpRecordDistribute',
    // 			meta: {
    // 				title: '审核记录分配'
    // 			},
    // 			name: 'followUpRecordDistribute',
    // 			component: () => import('@/view/manualAudit/followUpRecordDistribute.vue')
    // 		},
    // 		{
    // 			path: 'auditDataLook',
    // 			meta: {
    // 				title: '审核数据查看'
    // 			},
    // 			name: 'auditDataLook',
    // 			component: () => import('@/view/manualAudit/auditDataLook.vue')
    // 		}
    // 	]
    // },
    //   // 方案配置
    // {
    // 	path: '/proConfig',
    // 	meta: {
    // 		title: '方案配置'
    // 	},
    // 	name: 'proConfig',
    // 	component: Main,
    // 	children: [
    // 		{
    // 			path: 'voiceManage',
    // 			meta: {
    // 					title: '语音文件管理'
    // 			},
    // 			name: 'voiceManage',
    // 			component: () => import('@/view/proConfig/voiceManage.vue')
    // 		},
    // 		{
    // 			path: 'comManage',
    // 			meta: {
    // 				title: '通用库管理'
    // 			},
    // 			name: 'comManage',
    // 			component: () => import('@/view/proConfig/commonManage.vue')
    // 		},
    // 		{
    // 			path: 'addCommonLib',
    // 			meta: { title: '添加通用库', hideInMenu: true },
    // 			name: 'addCommonLib',
    // 			component: () => import('@/view/proConfig/addCommonLib.vue')
    // 		},
    // 		{
    // 			path: 'indexManage',
    // 			meta: {
    // 					title: '指标管理'
    // 			},
    // 			name: 'indexManage',
    // 			component: () => import('@/view/proConfig/indexManage.vue')
    // 		},
    // 		{
    // 			path: 'questionManage',
    // 			meta: {
    // 					title: '问题管理'
    // 			},
    // 			name: 'questionManage',
    // 			component: () => import('@/view/proConfig/questionManage.vue')
    // 		},
    // 		{
    // 			path: 'questionEdit',
    // 			meta: { title: '编辑话术', hideInMenu: true, keepAlive: false },
    // 			name: 'questionEdit',
    // 			component: () => import('@/view/proConfig/questionEdit.vue')
    // 		},
    // 		{
    // 			path: 'templateManage',
    // 			meta: {
    // 					title: '模板管理'
    // 			},
    // 			name: 'templateManage',
    // 			component: () => import('@/view/proConfig/templateManage.vue')
    // 		},
    // 		{
    // 			path: 'templateEdit',
    // 			meta: { title: '编辑模板', hideInMenu: true, keepAlive: false },
    // 			name: 'templateEdit',
    // 			component: () => import('@/view/proConfig/templateEdit.vue')
    // 		}
    // 	]
    // },
    // // 短信管理
    // {
    // 	path: '/mesManage',
    // 	meta: {
    // 		title: '短信管理'
    // 	},
    // 	name: 'mesManage',
    // 	component: Main,
    // 	children: [
    // 		{
    // 			path: 'mesPlatform',
    // 			meta: {
    // 				title: '短信平台配置'
    // 			},
    // 			name: 'mesPlatform',
    // 			component: () => import('@/view/mesManage/mesPlatform.vue')
    // 		},
    // 		{
    // 			path: 'mesTemplate',
    // 			meta: {
    // 				title: '短信模版'
    // 			},
    // 			name: 'mesTemplate',
    // 			component: () => import('@/view/mesManage/mesTemplate.vue')
    // 		}
    // 	]
    // },
    //   // 系统设置
    // {
    // 	path: '/systemSetup',
    // 	meta: {
    // 		title: '系统设置'
    // 	},
    // 	name: 'systemSetup',
    // 	component: Main,
    // 	children: [
    // 		{
    // 			path: 'composeVoice',
    // 			meta: {
    // 				title: '随访语音变量'
    // 			},
    // 			name: 'composeVoice',
    // 			component: () => import('@/view/systemSetup/composeVoice.vue')
    // 		},
    // 		{
    // 			path: 'robotConfig',
    // 			meta: {
    // 				title: '机器人配置'
    // 			},
    // 			name: 'robotConfig',
    // 			component: () => import('@/view/systemSetup/robotConfig.vue')
    // 		},
    // 	]
    // },
    // 	// 数据统计
    // 	{
    // 		path: '/dataCount',
    // 		meta: {
    // 			title: '数据统计'
    // 		},
    // 		name: 'dataCount',
    // 		component: Main,
    // 		children: [
    // 		{
    // 			path: 'countResultSet',
    // 			meta: {
    // 				title: '统计汇总结果项设置'
    // 			},
    // 			name: 'countResultSet',
    // 			component: () => import('@/view/dataCount/countResultSet.vue')
    // 		},
    // 		{
    // 			path: 'countTempSet',
    // 			meta: {
    // 				title: '统计汇总模版设置'
    // 			},
    // 			name: 'countTempSet',
    // 			component: () => import('@/view/dataCount/countTempSet.vue')
    // 		},
    // 		{
    // 			path: 'followTempSet',
    // 			meta: {
    // 				title: '随访明细模板设置'
    // 			},
    // 			name: 'followTempSet',
    // 			component: () => import('@/view/dataCount/followTempSet.vue')
    // 		},
    // 	]
    // }
]
