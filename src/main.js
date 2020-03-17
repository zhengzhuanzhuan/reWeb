// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import iView from 'iview'
import i18n from '@/locale'
import config from '@/config'
import importDirective from '@/directive'
import installPlugin from '@/plugin'
import './index.less'
import '@/assets/icons/iconfont.css'
import TreeTable from 'tree-table-vue'
import { API } from '@/services'
import validate from './validate.js'
// import { Collapse } from 'element-ui'
// todo
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

// 实际打包时应该不引入mock
/* eslint-disable */
// if (process.env.NODE_ENV !== 'production') require('@/mock')
// 为实现模板编辑页的拖拽功能，引入element的Collapse
Vue.use(ElementUI)
Vue.use(iView, {
  i18n: (key, value) => i18n.t(key, value)
})
Vue.use(TreeTable)
/**
 * @description 注册admin内置插件
 */
installPlugin(Vue)
/**
 * @description 生产环境关掉提示
 */
Vue.config.productionTip = false
/**
 * @description 全局注册应用配置
 */
/**
 * @description 全局注册API接口
 */
Vue.prototype.$config = config
Vue.prototype.$API = API
Vue.prototype.validate = validate;
// 注册一个全局自定义指令 `v-permission`，来控制按钮权限,有权限则显示，否则隐藏
Vue.directive('permission', {
	inserted: function (el, binding) {
		// 指令传入值即为调用的接口的方法，获取接口的 URL，来判断是否有该操作权限
		// const temp = binding.value.toString().split('\'/')[1]
		// let resUrl = temp.split('\'')[0]
		// if (resUrl[resUrl.length -1] === '/') {
		// 	resUrl = resUrl.substring(0, resUrl.length - 1);
		// }
		// const btnMenuData = sessionStorage.getItem('rsysBtnPermission')
		// if (btnMenuData.indexOf(resUrl) === -1) {
		// 	el.classList.add('btn-permission-hide')
		// } else {
		// 	el.classList.remove('btn-permission-hide')
		// }
	}
})
/**
 * 注册指令
 */
importDirective(Vue)

/* eslint-disable no-new */
window.RSYS = new Vue({
  el: '#app',
  router,
  i18n,
  store,
  render: h => h(App)
})
