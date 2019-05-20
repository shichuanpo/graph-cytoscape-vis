<template lang="pug">
.cytoscapeContainer
  .cytoscape(ref="cytoscapeContainer")
  .buttons(v-if="legend.show")
    .checkbox(v-for="(gr, index) in groups", onselectstart="return false;", @click="checkboxChange(index)")
      span.color(:style="{ 'background': checkBoxModel[index] ? colorByGroup[gr] : 'none', border: `1px solid ${colorByGroup[gr]}` }")
        img(:src="imgByGroup[gr]", height="100%;", v-if="checkBoxModel[index]")
      span.text {{gr}}
</template>
<script>
import mockdata from '../mock/data';
import Cytoscape from './cytoscape'
import { merge, mergeArrayFindSelector, mergeArrayReplace, isObject, isArray } from './util'
import defaultOption from './defaultOption.js'

export default {
  name: 'vue-cytoscape',
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
      filterIds: {},
      defaultColor: '#ccc',
      defaultImage: undefined
    };
  },
  computed: {
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
    groupBy () {
      return this.options.group && (this.options.group.data || this.options.group.key) || defaultOption.group.key
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
              let groupName = this.dataByGroup(ele.data())
              return this.colorByGroup[groupName] || this.defaultColor
            },
            'background-image': (ele) => {
              let groupName = this.dataByGroup(ele.data())
              return this.imgByGroup[groupName] || this.defaultImage
            },
            'background-width': '80%',
            'background-height': '80%',
            'background-repeat': 'no-repeat',
            'background-opacity': 0.6,
            'background-image-opacity': 0.6,
            'z-index-compare': 'manual',
            'z-index': 2
          }
        }]
      }, this.options.cytoscape || {})
    },
    groups () {
      return Array.from(
        new Set(this.data.filter(dat => dat.group === 'nodes').map(dat => this.dataByGroup(dat.data)).filter(g => !!g))
      )
    },
    colorByGroup () {
      let colorGroup = {}
      if (isArray(this.colors)) {
        this.groups.forEach((g, idx) => {
          idx = idx % this.colors.length
          colorGroup[g] = this.colors[idx]
        })
      } else if (isObject(this.colors)) {
        colorGroup = this.colors
      }
      if (isArray(this.groupBy)) {
        this.groupBy.forEach(({ color, name }) => {
          colorGroup[name] = color || colorGroup[name] || this.defaultColor
        })
      }
      return colorGroup
    },
    imgByGroup () {
      let imgGroup = {}
      if (isArray(this.images)) {
        this.groups.forEach((g, idx) => {
          idx = idx % this.images.length
          imgGroup[g] = this.images[idx]
        })
      } else if (isObject(this.images)) {
        imgGroup = this.images
      }
      if (isArray(this.groupBy)) {
        this.groupBy.forEach(({ image, name }) => {
          imgGroup[name] = image || imgGroup[name] || this.defaultImage
        })
      }
      return imgGroup
    }
  },
  watch: {
    data: {
      handler (newValue) {
        this.$cy && this.setData(newValue)
      },
      deep: true
    },
    options: {
      handler () {
        this.$cy && this.setOptions()
      },
      deep: true
    },
    groups: {
      handler (newGroups) {
        if (newGroups) {
          this.checkBoxModel = newGroups.map(() => true)
        }
      },
      deep: true
    }
  },
  methods: {
    dataByGroup (data) {
      if (isArray(this.groupBy)) {
        let _group = this.groupBy.find(group => group.matching(data))
        return _group ? _group.name : undefined
      } else {
        return data[this.groupBy]
      }
    },
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
            this.filterIds[gr] = this.$cy.filterNodesByFunction(ele => this.dataByGroup(ele.data()) !== gr)
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
            this.filterIds[gr] = this.$cy.filterNodesByFunction(ele => this.dataByGroup(ele.data()) !== gr)
          }
        }, 200)
      }
    },
    setData (data) {
      this.$nextTick(() => {
        this.$cy && this.$cy.data(data)
      })
    },
    setOptions () {
      this.$nextTick(() => {
        this.$cy && this.$cy.setOptions(this.cytoscapeOptions)
      })
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
    getCytoscape () {
      return this.$cy.cytoscape
    },
    createCytoscape () {
      this.$cy && this.$cy.destroy()
      let container = this.$refs.cytoscapeContainer
      this.$cy = new Cytoscape(container, this.data, this.cytoscapeOptions)
    }
  },
  mounted () {
    this.createCytoscape()
  },
  beforeDestroy () {
    this.$cy.destroy()
  }
};
</script>
<style lang="less" scoped>
.cytoscapeContainer {
  text-align: left;
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 999;
  .cytoscape {
    position: relative;
    width: 100%;
    height: 100%;
  }
}
.buttons {
  position: absolute;
  left: 0;
  top: 0;
  text-align: center;
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

