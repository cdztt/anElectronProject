import Vue from 'vue'
import Vuex from 'vuex'
import localServer from './modules/localServer.js'
// import handleExcel from './modules/handleExcel.js'


Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		appVersion: '',
		userDataPath: '',
		msgOpts: {//$message的配置项
			duration: 1500,
			center: true,
			offset: 60
		},
		clicked: false,
	},
	mutations: {
		SET_APP_VERSION(state, appVersion) {
			state.appVersion = appVersion
		},
		SET_USER_DATA_PATH(state, userDataPath) {
			state.userDataPath = userDataPath
		},
		setClickedTrue(state) {
			state.clicked = true
		},
		setClickedFalse(state) {
			state.clicked = false
		},
	},
	actions: {
		endClick({ commit }) {
			setTimeout(() => { commit('setClickedFalse') }, 1500)
		},
	},
	modules: {
		localServer,
		// handleExcel,
	}
})
