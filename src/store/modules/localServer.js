const state = () => ({
	port: 55555,
	isServerOn: false,
})

const mutations = {
	SET_PORT(state, port) {
		state.port = port
	},
	SET_IS_SERVER_ON(state, isServerOn) {
		state.isServerOn = isServerOn
	},
}

export default {
	state,
	mutations,
}