import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'root',
      component: {
        name: 'routerPlaceholder',
        render(h) {
          return h('router-view')
        }
      },
      redirect: '/cytoscape',
      children: [
        {
          path: '/cytoscape',
          name: 'cytoscape',
          // route level code-splitting
          // this generates a separate chunk (about.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () =>
            import(/* webpackChunkName: "about" */ './views/cytoscape.vue')
        },
        {
          path: '/vis',
          name: 'vis',
          // route level code-splitting
          // this generates a separate chunk (about.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () =>
            import(/* webpackChunkName: "about" */ './views/vis.vue')
        }, {
          path: '/g6',
          name: 'g6',
          // route level code-splitting
          // this generates a separate chunk (about.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () =>
            import(/* webpackChunkName: "about" */ './views/g6.vue')
        }
      ]
    }
  ]
})
