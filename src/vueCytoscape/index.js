
import VueCytoscape from './cytoscape.vue'
import VueCytoscapeLegend from './legend.vue'
import cytoscape from 'cytoscape'

export default {
  install (Vue, options) {
    Vue.component(VueCytoscape.name, VueCytoscape)
    Vue.component(VueCytoscapeLegend.name, VueCytoscapeLegend)
    options.beforeCreate && options.beforeCreate(cytoscape)
  }
}
