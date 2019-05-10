<template lang="pug">
  div
   .cytoscape(ref="cytoscape")
   .buttons
      label.checkbox(
        v-for="(gr, index) in groups",
        @click="$cy && checkBoxModel[index] ? $cy.reset('group', gr) : $cy.clusterNodesByProps('group', gr)")
        input(type="checkbox", v-model="checkBoxModel[index]")
        span.color(:style="{background: checkBoxModel[index] ? 'none' : colorByGroup[gr], border: `1px solid ${colorByGroup[gr]}`}")
        span.text {{gr}}
      button(@click="checkBoxModel=[];$cy && $cy.reset()") reset
      button(@click="$cy && $cy.filterEdgesByFunction(edge => edge.data('time'))") 边过滤
</template>
<script>
import data from '../mock/data';
import Cytoscape from '../cytoscape'
import { merge } from '../cytoscape/util'
export default {
  name: 'cytoscape',
  props: {
    options: {
      type: Object,
      default: () => {
        return {}
      }
    },
    colors: {
      type: Array,
      default: () => {
        return [
          '#c23531',
          '#2f4554',
          '#61a0a8',
          '#d48265',
          '#91c7ae',
          '#749f83',
          '#ca8622',
          '#bda29a',
          '#6e7074',
          '#546570',
          '#c4ccd3'
        ]
      }
    }
  },
  data () {
    return {
      $cy: null,
      groups: Array.from(
        new Set(data.map(dat => dat.data.group).filter(g => !!g))
      ),
      checkBoxModel: []
    };
  },
  computed: {
    colorByGroup () {
      let colorGroup = {}
      this.groups.forEach((g, idx) => {
        idx = idx % this.colors.length
        colorGroup[g] = this.colors[idx]
      })
      return colorGroup
    }
  },
  methods: {
    createContextMenu (e) {
      let element = e.target
      if (element.isNode || element.isEdge) {
        this.$contextMenus = this.$cy.cytoscape.contextMenus({
          menuItems: Object.keys(element.data()).map(key => {
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
        })
      }
    }
  },
  mounted () {
    let container = this.$refs.cytoscape
    var options = {
      style: [
        {
          selector: 'node:selected',
          style: {
            'border-color': 'rgba(5, 161, 140, 1)',
            'border-width': 2
          }
        },
        {
          selector: 'node',
          style: {
            content: 'data(name)',
            'background-color': (ele) => {
              return ele.data('group')
                ? this.colorByGroup[ele.data('group')] || '#ccc'
                : '#ccc'
            },
            'background-opacity': 0.6,
            'z-index-compare': 'manual',
            'z-index': 2
          }
        },
        {
          selector: 'node[label]',
          style: {
            label: 'data(label)',
            'font-size': '9px',
            color: '#666',
            'z-index': 2
          }
        },
        {
          selector: 'edge',
          style: {
            width: 1,
            'curve-style': 'bezier',
            'target-arrow-shape': 'vee',
            'target-arrow-color': '#dddddd',
            'line-color': '#dddddd',
            'z-index': 1
          }
        },
        {
          selector: 'edge[label]',
          style: { 'font-size': '9px', color: '#666', 'z-index': 1 }
        },
        {
          selector: '.hover',
          style: {
            'target-arrow-color': '#aaa',
            'line-color': '#aaa',
            color: '#333',
            'background-opacity': 1,
            'z-index': 99
          }
        },
        {
          selector: 'edge.hover',
          style: {
            width: 2,
            'z-index': 98
          }
        },
        {
          selector: '.unhover',
          style: {
            'target-arrow-color': '#eee',
            'line-color': '#eee',
            color: '#eee',
            'background-opacity': 0.3,
            'z-index': 0
          }
        },
        {
          selector: 'edge.unhover',
          style: {
            width: 1
          }
        }
      ]
    }
    this.$cy = new Cytoscape(container, data, merge(options, this.options))
    this.$cy.cytoscape.on('mouseover', this.createContextMenu)
  },
  beforeDestroy () {
    this.$cy.cytoscape.off('mouseover', this.createContextMenu)
    this.$cy.destroy()
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
.buttons {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1000;
  .checkbox {
    margin: 0 5px;
    input {
      display: none;
    }
    .color {
      display: inline-block;
      vertical-align: middle;
      width: 25px;
      height: 12px;
      border-radius: 3px;
      margin-right: 3px;
    }
    .text {
      font-size: 12px;
      vertical-align: middle;
    }
  }
}
</style>
