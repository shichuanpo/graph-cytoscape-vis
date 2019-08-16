import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import cytoscape from '@/cytoscape'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import cola from 'cytoscape-cola'
import fcose from 'cytoscape-fcose'
import contextMenus from 'cytoscape-context-menus'
import $ from 'jquery'
import 'cytoscape-context-menus/cytoscape-context-menus.css'
import popper from 'cytoscape-popper'
import coseBilkent from 'cytoscape-cose-bilkent'
import klay from 'cytoscape-klay'

Vue.config.productionTip = false
Vue.use(cytoscape, {
  beforeCreate: Cytoscape => {
    Cytoscape.use(fcose)
    Cytoscape.use(coseBilkent)
    Cytoscape.use(klay)
    Cytoscape.use(contextMenus, $)
    Cytoscape.use( popper )
    Cytoscape.use(cola)
  }
})
Vue.use(ElementUI)
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
