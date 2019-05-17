<template lang="pug">
  .cytoscape(ref="cytoscape")
    .buttons
      .checkbox(v-for="(gr, index) in groups", onselectstart="return false;", @click="checkboxChange(index)")
        span.color(:style="{ 'background': checkBoxModel[index] ? colorByGroup[gr] : 'none', border: `1px solid ${colorByGroup[gr]}` }")
          img(:src="imgByGroup[gr]", height="100%;", v-if="checkBoxModel[index]")
        span.text {{gr}}
      //- button(@click="reset") reset
      //- button(@click="$cy && $cy.filterEdgesByFunction(edge => edge.data('time'))") 边过滤
</template>
<script>
import mockdata from '../mock/data';
import Cytoscape from './cytoscape'
import { merge, mergeArrayFindSelector, mergeArrayReplace, isObject, isArray } from './util'
import defaultOption from './defaultOption.js'

export default {
  name: 'cytoscape',
  props: {
    options: {
      type: Object,
      default: () => {
        return {}
      }
    },
    data: {
      type: Array,
      default: () => {
        return mockdata
      }
    }
  },
  data () {
    return {
      $cy: null,
      timeStamp: 0,
      checkBoxModel: [],
      filterIds: {}
    };
  },
  computed: {
    grid () {
      let grid = JSON.parse(JSON.stringify(defaultOption.grid || {}))
      return mergeArrayReplace(grid, this.options.grid) || {}
    },
    colors () {
      if (this.options.group && this.options.group.colors) {
        let colors = JSON.parse(JSON.stringify(this.options.group.colors))
        if (isArray(colors)) {
          return merge(colors, defaultOption.colors)
        } else if (isObject(colors)) {
          return colors
        }
      }
      return defaultOption.group && defaultOption.group.colors || {}
    },
    images () {
      if (this.options.group && this.options.group.images) {
        let images = JSON.parse(JSON.stringify(this.options.group.images))
        if (isArray(images)) {
          return merge(images, defaultOption.colors)
        } else if (isObject(images)) {
          return images
        }
      }
      return defaultOption.group && defaultOption.group.images || {}
    },
    legend () {
      let legend = JSON.parse(JSON.stringify(defaultOption.legend || {}))
      return mergeArrayReplace(legend, this.options.legend || {}) || {}
    },
    cytoscapeOptions () {
      let cytoscapeOptions = JSON.parse(JSON.stringify(defaultOption.cytoscape || {}))
      return mergeArrayFindSelector(cytoscapeOptions, {
        style: [{
          selector: 'node',
          style: {
            'content': 'data(name)',
            'shape': 'barrel',
            'background-color': (ele) => {
              return ele.data(this.legend.key)
                ? this.colorByGroup[ele.data(this.legend.key)] || '#ccc'
                : '#ccc'
            },
            'background-image': (ele) => {
              return ele.data(this.legend.key)
                ? this.imgByGroup[ele.data(this.legend.key)] || 'none'
                : 'none'
            },
            'background-width': '80%',
            'background-height': '80%',
            'background-repeat': 'no-repeat',
            'background-opacity': 0.6,
            'z-index-compare': 'manual',
            'z-index': 2
          }
        }]
      }, this.options.cytoscape || {})
    },
    groups () {
      return Array.from(
        new Set(this.data.filter(dat => dat.group === 'nodes').map(dat => dat.data[this.legend.key]).filter(g => !!g))
      )
    },
    colorByGroup () {
      if (isObject(this.colors)) {
        return this.colors
      }
      let colorGroup = {}
      this.groups.forEach((g, idx) => {
        idx = idx % this.colors.length
        colorGroup[g] = this.colors[idx]
      })
      return colorGroup
    },
    imgByGroup () {
      if (isObject(this.images)) {
        return this.images
      }
      let imgGroup = {}
      this.groups.forEach((g, idx) => {
        idx = idx % this.images.length
        imgGroup[g] = this.images[idx]
      })
      return imgGroup
    }
  },
  watch: {
    data: {
      handler (newValue) {
        if (this.$cy) {
          this.$cy.data(newValue)
          this.checkBoxModel = this.groups.map(() => true)
        }
      },
      deep: true
    }
  },
  methods: {
    checkboxChange (index) {
      let ntime = new Date().getTime()
      if (ntime - this.timeStamp < 200) {
        this.timeStamp = ntime
        clearTimeout(this.timeout)
        let isChecked = this.checkBoxModel[index]
        this.groups.forEach((gr, idx) => {
          if (idx === index) {
            this.$set(this.checkBoxModel, idx, !isChecked)
          } else {
            this.$set(this.checkBoxModel, idx, isChecked)
          }
          if (this.checkBoxModel[idx] && this.filterIds[gr]) {
            this.$cy.reset(this.filterIds[gr])
            delete this.filterIds[gr]
          } else if (!this.checkBoxModel[idx] && !this.filterIds[gr]) {
            this.filterIds[gr] = this.$cy.filterNodesByFunction(ele => ele.data(this.legend.key) !== gr)
          }
        })
      } else {
        this.timeStamp = ntime
        let gr = this.groups[index]
        this.timeout = setTimeout(() => {
          this.$set(this.checkBoxModel, index, !this.checkBoxModel[index])
          if (this.checkBoxModel[index] && this.filterIds[gr]) {
            this.$cy.reset(this.filterIds[gr])
            delete this.filterIds[gr]
          } else {
            this.filterIds[gr] = this.$cy.filterNodesByFunction(ele => ele.data(this.legend.key) !== gr)
          }
        }, 200)
      }
    },
    reset (id) {
      this.$cy && this.$cy.reset(id)
    },
    filterEdgesByFunction (func) {
      return this.$cy && this.$cy.filterEdgesByFunction(func)
    },
    filterNodesByFunction (func) {
      return this.$cy && this.$cy.filterNodesByFunction(func)
    },
    createContextMenu (e) {
      let element = e.target
      if (element.isNode || element.isEdge) {
        this.$contextMenus && this.$contextMenus.destroy()
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
    this.checkBoxModel = this.groups.map(() => true)
    this.$cy = new Cytoscape(container, this.data, this.cytoscapeOptions)
    this.$cy.cytoscape.on('mouseover', this.createContextMenu)
  },
  beforeDestroy () {
    this.$contextMenus && this.$contextMenus.destroy()
    this.$cy.cytoscape.off('mouseover', this.createContextMenu)
    this.$cy.destroy()
  }
};
</script>
<style lang="less" scoped>
.cytoscape {
  text-align: left;
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 999;
}
.buttons {
  position: absolute;
  left: 0;
  top: 0;
  text-align: center;
  z-index: 1000;
  .checkbox {
    margin: 0 5px;
    display: inline-block;
    vertical-align: middle;
    cursor: pointer;
    input {
      display: none;
    }
    .color {
      display: inline-block;
      vertical-align: middle;
      width: 30px;
      height: 15px;
      border-radius: 3px;
      margin-right: 3px;
    }
    .text {
      font-size: 12px;
      vertical-align: middle;
    }
  }
  i {
    display: block;
    width: 100%;
    height: 100%;
  }
}
</style>

