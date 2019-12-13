import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vueCytoscape from '@/components/vueCytoscape'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import cola from 'cytoscape-cola'
// import fcose from 'cytoscape-fcose'
// import euler from 'cytoscape-euler';
// import cyforcelayout from 'cytoscape-ngraph.forcelayout'
import contextMenus from 'cytoscape-context-menus'
import $ from 'jquery'
import 'cytoscape-context-menus/cytoscape-context-menus.css'
import popper from 'cytoscape-popper'
// import coseBilkent from 'cytoscape-cose-bilkent'
// import klay from 'cytoscape-klay'
// import navigator from 'cytoscape-navigator'
Vue.config.productionTip = false
Vue.use(vueCytoscape, {
  beforeCreate: (Cytoscape: any) => {
    // Cytoscape.use(fcose)
    // Cytoscape.use(coseBilkent)
    // Cytoscape.use(klay)
    Cytoscape.use(contextMenus, $)
    Cytoscape.use( popper )
    Cytoscape.use(cola)
    // Cytoscape.use(euler)
    // cyforcelayout(Cytoscape)
    // navigator(Cytoscape)
  }
})
Vue.use(ElementUI)
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
