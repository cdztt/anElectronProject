import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import {
	Row,
	Col,
	Card,
	Input,
	Button,
	Form,
	FormItem,
	Radio,
	Message,
	Tooltip,
	Menu,
	Submenu,
	MenuItem,
	Tag,
	Table,
	TableColumn,
} from 'element-ui'

Vue.use(Row)
Vue.use(Col)
Vue.use(Card)
Vue.use(Input)
Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Radio)
Vue.prototype.$message = Message
Vue.use(Tooltip)
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItem)
Vue.use(Tag)
Vue.use(Table)
Vue.use(TableColumn)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
