<template lang="pug">
  .cytoscapeContainer
    slot
    .cytoscape(ref="cytoscapeContainer")
</template>
<script>
import cytoscape from 'cytoscape'
// import mockdata from '../mock/data';
import createCytoscape from './createCytoscape'
import createEvents from './createEvents'
import { merge, mergeArrayFindSelector, isObject, isArray, isFunction } from './util'
import { categoryOption, cytoscapeOption } from './defaultOption.js'
export default {
  name: 'vueCytoscape',
  props: {
    options: {
      type: Object,
      default: () => {
        return {}
      }
    },
    category: {
      type: Object,
      default: () => {
        return {}
      }
    },
    data: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data () {
    return {
      $cytoscapeInstance: null,
      defaultColor: '#ccc',
      defaultImage: '#ccc',
      events: []
    }
  },
  computed: {
    colors () {
      if (this.category && this.category.colors) {
        let colors = this.category.colors
        if (isArray(colors)) {
          return merge([], categoryOption.colors, colors || [])
        } else if (isObject(colors)) {
          return colors
        }
      }
      return categoryOption.colors || {}
    },
    images () {
      if (this.category && this.category.images) {
        let images = this.category.images
        if (isArray(images)) {
          return merge([], categoryOption.images, images || [])
        } else if (isObject(images)) {
          return images
        }
      }
      return categoryOption.images || {}
    },
    categoryBy () {
      return this.category && (this.category.data || this.category.key) || categoryOption.key
    },
    cytoscapeOptions () {
      return mergeArrayFindSelector({}, cytoscapeOption, {
        style: [{
          selector: 'node',
          style: {
            'shape': 'barrel',
            'background-color': (ele) => {
              let categoryName = this.dataByCategory(ele.data())
              return this.colorByCategory[categoryName] || this.defaultColor
            },
            'background-image': (ele) => {
              let categoryName = this.dataByCategory(ele.data())
              return this.imgByCategory[categoryName] || this.defaultImage
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
      }, this.options || {})
    },
    categorys () {
      let _categorys = Array.from(
        new Set(this.data.filter(dat => dat.group === 'nodes').map(dat => this.dataByCategory(dat.data)).filter(g => !!g))
      )
      return _categorys
    },
    colorByCategory () {
      let colorCategory = {}
      if (isArray(this.colors)) {
        this.categorys.forEach((g, idx) => {
          idx = idx % this.colors.length
          colorCategory[g] = this.colors[idx]
        })
      } else if (isObject(this.colors)) {
        colorCategory = this.colors
      }
      if (isArray(this.categoryBy)) {
        this.categoryBy.forEach(({ color, name, matching }) => {
          let _color = color
          if (isFunction(color)) {
            let datas = this.data.map(d => d.data).filter(d => matching && matching(d))
            _color = color(datas)
          }
          colorCategory[name] = _color || colorCategory[name] || this.defaultColor
        })
      }
      return colorCategory
    },
    imgByCategory () {
      let imgCategory = {}
      if (isArray(this.images)) {
        this.categorys.forEach((g, idx) => {
          idx = idx % this.images.length
          imgCategory[g] = this.images[idx]
        })
      } else if (isObject(this.images)) {
        imgCategory = this.images
      }
      if (isArray(this.categoryBy)) {
        this.categoryBy.forEach(({ image, name, matching }) => {
          let _image = image
          if (isFunction(image)) {
            let datas = this.data.map(d => d.data).filter(d => matching && matching(d))
            _image = image(datas)
          }
          imgCategory[name] = _image || imgCategory[name] || this.defaultImage
        })
      }
      return imgCategory
    }
  },
  watch: {
    data: {
      handler (newValue) {
        this.setData(newValue)
      },
      deep: true
    },
    cytoscapeOptions: {
      handler (newValue) {
        this.$cytoscapeInstance && this.setOptions(newValue)
      },
      deep: true
    }
  },
  methods: {
    dataByCategory (data) {
      if (isArray(this.categoryBy)) {
        let _category = this.categoryBy.find(category => category.matching && category.matching(data))
        return _category ? (isFunction(_category.name) ? _category.name(data) : _category.name) : undefined
      } else {
        return data[this.categoryBy]
      }
    },
    filterByLegend (categoryName, isFilter) {
      let legendModel = this.$cytoscapeInstance.scratch('legend')
      this.$cytoscapeInstance.startBatch()
      if (categoryName) {
        legendModel[categoryName] && this.$cytoscapeInstance.resetFilter(legendModel[categoryName])
        legendModel[categoryName] = isFilter ? this.$cytoscapeInstance.filterNodesByFunction(ele => this.dataByCategory(ele.data()) !== categoryName) : null
      } else {
        Object.keys(legendModel).forEach(_categoryName => {
          if (_categoryName && legendModel[_categoryName]) {
            legendModel[_categoryName] && this.$cytoscapeInstance.resetFilter(legendModel[_categoryName])
            legendModel[_categoryName] = isFilter ? this.$cytoscapeInstance.filterNodesByFunction(ele => this.dataByCategory(ele.data()) !== _categoryName) : null
          }
        })
      }
      this.$cytoscapeInstance.scratch('legend', legendModel)
      this.$cytoscapeInstance.endBatch()
    },
    /****
     * cytoscape option设置只有拆分的放法
     */
    async setOptions (option) {
      await this.$nextTick()
      this.$cytoscapeInstance.startBatch()
      Object.keys(option).forEach(key => {
        this.$cytoscapeInstance[key] && this.$cytoscapeInstance[key](option[key])
      })
      this.$cytoscapeInstance.endBatch()
    },
    /****
     * cytoscape并不支持数据重置，
     * 所以手动了一个方法
     */
    async setData (data) {
      if (!this.$cytoscapeInstance) return this.createCytoscape()
      await this.$nextTick()
      this.$cytoscapeInstance.resetFilter()
      let _data = data.filter(d => !this.$cytoscapeInstance.$(`#${d.data.id}`).inside())
      this.$cytoscapeInstance.add(_data)
      let layout = this.$cytoscapeInstance.layout(this.cytoscapeOptions.layout)
      layout.run()
    },
    createCytoscape () {
      this.$cytoscapeInstance && this.$cytoscapeInstance.destroy()
      let container = this.$refs.cytoscapeContainer
      this.$cytoscapeInstance = createCytoscape(container, this.data, this.cytoscapeOptions)
      !this.$cytoscapeInstance.filterByLegend && cytoscape('core', 'filterByLegend', this.filterByLegend)
      // register all the component events as cytoscape ones
      let _events = createEvents(this.$cytoscapeInstance)
      this.events.concat(_events)
      for (const [eventType, callback] of Object.entries(this.$listeners)) {
        const func = function (event) {
          callback(event)
        }
        this.$cytoscapeInstance.on(eventType, func)
        this.events.push(() => {
          this.$cytoscapeInstance.off(eventType, func)
        })
      }
      this.$emit('init', this.$cytoscapeInstance)
    },
    async destroy () {
      if (this.$cytoscapeInstance) {
        await this.events.forEach(func => {
          func()
        })
        await this.$cytoscapeInstance.destroy()
      }
    }
  },
  mounted () {
    this.data && this.data.length && this.createCytoscape()
  },
  beforeDestroy () {
    this.destroy()
  }
}
</script>
<style lang="less" scoped>
.cytoscapeContainer {
  text-align: left;
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  .cytoscape {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
}
</style>

