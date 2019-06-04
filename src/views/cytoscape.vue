<template lang="pug">
   cytoscape.cytoscape(ref="cytoscape", :options="options", :data="graphData", @init="cytoscapeInit")
   
</template>
<script>
import data from '../mock/data';
import cytoscape from '../cytoscape/index.vue'
import hospital from '../assets/svg/hospital.svg'
import person from '../assets/svg/person.svg'
import computer from '../assets/svg/computer.svg'
import clothes from '../assets/svg/clothes.svg'
import Cytoscape from 'cytoscape'
import fcose from 'cytoscape-fcose'
// import contextMenus from 'cytoscape-context-menus'
// import $ from 'jquery'
import 'cytoscape-context-menus/cytoscape-context-menus.css'
Cytoscape.use(fcose)
// Cytoscape.use(contextMenus, $)
export default {
  name: 'cytoscapePage',
  components: { cytoscape },
  data () {
    return {
      $contextMenus: null,
      contextMenusItems: [],
      options: {
        legend: {
          show: true,
          formatter: str => {
            let translate = {
              hospital: '医院',
              clothes: '衣服',
              computer: '电脑',
              person: '个人'
            }
            Object.keys(translate).forEach(key => {
              str = str.replace(key, translate[key])
            })
            return str
          }
        },
        contextMenus: {
          menuItems: target => {
            if (target.data) {
              return Object.keys(target.data()).map(key => {
                return {
                  id: key,
                  content: `${key}: ${target.data(key)}`,
                  selector: 'node, edge',
                  onClickFunction: function () {
                    console.log('remove target');
                  },
                  disabled: false,
                  show: true,
                  hasTrailingDivider: true,
                  coreAsWell: false
                }
              })
            } else {
              return []
            }
          }
        },
        tooltip: {
          selector: 'node, edge',
          content: element => {
            return `${element.id()}`
          },
          animation: 'fade',
          theme: 'light-border',
          trigger: 'mouseover'
        },
        category: {
          key: 'group',
          images: {
            hospital,
            clothes,
            computer,
            person
          },
        }
      },
      graphData: [],
      $cy: null
    };
  },
  methods: {
    cytoscapeInit (cytoscape) {
      this.$cy = cytoscape
      // this.$contextMenus = this.$cy.contextMenus({
      //   menuItems: this.contextMenusItems
      // })
      // this.$cy.on('cxttapstart', this.createContextMenu)
    },
    createContextMenu (e) {
      let element = e.target
      if (element.isNode || element.isEdge) {
        if (this.$contextMenus) {
          this.contextMenusItems.forEach(({id}) => {
            this.$contextMenus.removeMenuItem(id)
          })
          this.contextMenusItems = Object.keys(element.data()).map(key => {
            return {
              id: key, // ID of menu item
              content: `${key}: ${element.data(key)}`, // Display content of menu item
              // tooltipText: 'remove', // Tooltip text for menu item
              // image: {src : "remove.svg", width : 12, height : 12, x : 6, y : 4}, // menu icon
              // Filters the elements to have this menu item on cxttap
              // If the selector is not truthy no elements will have this menu item on cxttap
              selector: 'node, edge',
              onClickFunction: function () { // The function to be executed on click
                console.log('remove element');
              },
              disabled: false, // Whether the item will be created as disabled
              show: true, // Whether the item will be shown or not
              hasTrailingDivider: true, // Whether the item will have a trailing divider
              coreAsWell: false // Whether core instance have this item on cxttap
            }
          })
          this.$contextMenus.appendMenuItems(this.contextMenusItems)
        }
      }
    }
  },
  mounted () {
    this.graphData = data
  },
  beforeDestroy () {
    // this.$contextMenus && this.$contextMenus.destroy()
    // this.$cy && this.$cy.off('cxttapstart', this.createContextMenu)
  }
};
</script>
<style lang="less" scoped>
.cytoscape {
  text-align: left;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 999;
}
</style>

