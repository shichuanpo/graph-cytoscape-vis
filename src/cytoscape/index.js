
import VueCytoscape from './cytoscape.vue'
import cytoscape from 'cytoscape'

export default {
  install (Vue, options) {
    Vue.component(VueCytoscape.name, VueCytoscape)
    options.beforeCreate && options.beforeCreate(cytoscape)
  }
}
