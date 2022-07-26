import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
	{
		path: '/jjzk',
		component: () => import('../views/Jjzk.vue')
	},
	{
		path: '/tester',
		component: () => import('../views/Tester.vue')
	},
	{
		path: '/roster',
		component: () => import('../views/Roster.vue')
	},
	{
		path: '/scoretable',
		component: () => import('../views/ScoreTable.vue')
	},
	{
		path: '/localserver',
		component: () => import('../views/PadData.vue')
	},
	{
		path: '/',
		name: 'Home',
		component: Home
	},
  // {
  //   path: '/about',
  //   name: 'About',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  // }
]

const router = new VueRouter({
  routes
})

export default router
