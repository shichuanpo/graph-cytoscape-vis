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
import { categoryOption, cytoscapeOption, nodesBaseStyle, edgesBaseStyle } from './defaultOption.js'
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
      events: []
    }
  },
  computed: {
    nodesCategorys () {
      let _categorys = Array.from(
        new Set(this.data.filter(dat => dat.group === 'nodes').map(dat => this.dataByCategory(dat.data, 'nodes')).filter(g => !!g))
      )
      return _categorys
    },
    nodesCategoryBy () {
      return this.category && this.category.nodes && (this.category.nodes.data || this.category.nodes.key) || categoryOption.nodes.key
    },
    nodesStyles () {
      if (this.category && this.category.nodes && this.category.nodes.styles) {
        let _styles = this.category.nodes.styles
        if (isArray(_styles) && isArray(categoryOption.nodes.styles)) {
          return merge([], categoryOption.nodes.styles, _styles || [])
        } else if (isObject(_styles) && isObject(categoryOption.nodes.styles)) {
          return merge({}, categoryOption.nodes.styles, _styles || {})
        } else if (isObject(_styles) && isArray(categoryOption.nodes.styles)) {
          let _newStyles = {}
          this.nodesCategorys.forEach((key, idx) => {
            let _idx = idx % categoryOption.nodes.styles.length
            _newStyles[key] = merge({}, categoryOption.nodes.styles[_idx], _styles[key] || {})
          })
          return _newStyles
        }
      }
      return categoryOption.nodes.styles || {}
    },
    nodesStyleByCategory () {
      let _styleCategory = {}
      if (isArray(this.nodesStyles)) {
        this.nodesCategorys.forEach((g, idx) => {
          idx = idx % this.nodesStyles.length
          _styleCategory[g] = this.nodesStyles[idx]
        })
      } else if (isObject(this.nodesStyles)) {
        _styleCategory = this.nodesStyles
      }
      if (isArray(this.nodesCategoryBy)) {
        this.nodesCategoryBy.forEach(({ style, name, matching }) => {
          let _style = style
          if (isFunction(style)) {
            let datas = this.data.filter(d => d.data.group === 'nodes').map(d => d.data).filter(d => matching && matching(d))
            _style = style(datas)
          }
          _styleCategory[name] = _style || _styleCategory[name] || nodesBaseStyle
        })
      }
      return _styleCategory
    },
    edgesCategorys () {
      let _categorys = Array.from(
        new Set(this.data.filter(dat => dat.group === 'edges').map(dat => this.dataByCategory(dat.data, 'edges')).filter(g => !!g))
      )
      return _categorys
    },
    edgesCategoryBy () {
      return this.category && this.category.edges && (this.category.edges.data || this.category.edges.key) || categoryOption.edges.key
    },
    edgesStyles () {
      if (this.category && this.category.edges && this.category.edges.styles) {
        let _styles = this.category.edges.styles
        if (isArray(_styles) && isArray(categoryOption.edges.styles)) {
          return merge([], categoryOption.edges.styles, _styles || [])
        } else if (isObject(_styles) && isObject(categoryOption.edges.styles)) {
          return merge({}, categoryOption.edges.styles, _styles || {})
        } else if (isObject(_styles) && isArray(categoryOption.edges.styles)) {
          let _newStyles = {}
          this.edgesCategorys.forEach((key, idx) => {
            let _idx = idx % categoryOption.edges.styles.length
            _newStyles[key] = merge({}, categoryOption.edges.styles[_idx], _styles[key] || {})
          })
          return _newStyles
        }
      }
      return categoryOption.edges.styles || {}
    },
    edgesStyleByCategory () {
      let _styleCategory = {}
      if (isArray(this.edgesStyles)) {
        this.edgesCategorys.forEach((g, idx) => {
          idx = idx % this.edgesStyles.length
          _styleCategory[g] = this.edgesStyles[idx]
        })
      } else if (isObject(this.edgesStyles)) {
        _styleCategory = this.edgesStyles
      }
      if (isArray(this.edgesCategoryBy)) {
        this.edgesCategoryBy.forEach(({ style, name, matching }) => {
          let _style = style
          if (isFunction(style)) {
            let datas = this.data.filter(d => d.data.group === 'edges').map(d => d.data).filter(d => matching && matching(d))
            _style = style(datas)
          }
          _styleCategory[name] = _style || _styleCategory[name] || edgesBaseStyle
        })
      }
      return _styleCategory
    },
    cytoscapeOptions () {
      let _nodeStyle = {}
      Object.keys(nodesBaseStyle).forEach(key => {
        _nodeStyle[key] = (ele) => this.findStylePropertyByEle(ele, key)
      })
      let _edgeStyle = {}
      Object.keys(edgesBaseStyle).forEach(key => {
        _edgeStyle[key] = (ele) => this.findStylePropertyByEle(ele, key)
      })
      return mergeArrayFindSelector({}, cytoscapeOption, {
        style: [{
          selector: 'node',
          style: _nodeStyle
        }, {
          selector: 'edge',
          style: _edgeStyle
        }]
      }, this.options || {})
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
    findStylePropertyByEle (ele, prop) {
      let _categoryName = this.dataByCategory(ele.data(), ele.group())
      let _isNode = ele.isNode()
      return _isNode
        ? (this.nodesStyleByCategory[_categoryName] && this.nodesStyleByCategory[_categoryName][prop]) || nodesBaseStyle[prop]
        : (this.edgesStyleByCategory[_categoryName] && this.edgesStyleByCategory[_categoryName][prop]) || edgesBaseStyle[prop]
    },
    dataByCategory (data, type) {
      if (isArray(this[`${type}CategoryBy`])) {
        let _category = this[`${type}CategoryBy`].find(category => category.matching && category.matching(data))
        return _category ? (isFunction(_category.name) ? _category.name(data) : _category.name) : undefined
      } else {
        return data[this[`${type}CategoryBy`]]
      }
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
      let _data = merge([], data)
      this.$cytoscapeInstance.startBatch()
      let _allElements = this.$cytoscapeInstance.elements()
      let _removeData = _allElements.filter(ele => !_data.some(item => ele.id() === item.data.id))
      this.$cytoscapeInstance.remove(_removeData)
      let _addData = _data.filter(d => !_allElements.some(_ele => _ele.id() === d.data.id))
      this.$cytoscapeInstance.add(_addData)
      this.$cytoscapeInstance.renderFilter()
      let layout = this.$cytoscapeInstance.layout(this.cytoscapeOptions.layout)
      this.$cytoscapeInstance.endBatch()
      layout.run()
    },
    createCytoscape () {
      this.$cytoscapeInstance && this.$cytoscapeInstance.destroy()
      let container = this.$refs.cytoscapeContainer
      this.$cytoscapeInstance = createCytoscape(container, this.data, this.cytoscapeOptions)
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
    },
    resetFilter (id) {
      return this.$cytoscapeInstance && this.$cytoscapeInstance.resetFilter(id)
    },
    filterByFunction (func) {
      return this.$cytoscapeInstance && this.$cytoscapeInstance.filterByFunction(func)
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

