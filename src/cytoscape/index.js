
import vueCytoscape from './cytoscape.vue'
import vueCytoscapeLegend from './legend.vue'
import cytoscape from 'cytoscape'

export default {
  install (Vue, options) {
    Vue.component(vueCytoscape.name, vueCytoscape)
    Vue.component(vueCytoscapeLegend.name, vueCytoscapeLegend)
    options.beforeCreate && options.beforeCreate(cytoscape)
  }
}
