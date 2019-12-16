<template lang="pug">
  .cytoscape--container
    .cytoscape--container__graph(ref="cytoscapeBox")
    .cytoscape--container__loading(v-if="loading.layoutPregress < 100 || !loading.rendered")
      .progress-bar(v-if="loading.layoutPregress < 100")
        .progress-bar__outer
          .progress-bar__inner(:style="{width: progressText}")
        .text 正在计算布局，请稍后 {{progressText}}
      .center(v-else)
        svg.circular(viewBox="25 25 50 50")
          circle.path(cx="50" cy="50" r="20" fill="none")
        .text 正在渲染图，请稍后...
</template>
<script>
import cytoscape from 'cytoscape'
// import mockdata from '../mock/data';
// import createCytoscape from './createCytoscape'
import createEvents from './createEvents'
import { merge, mergeArrayConcat, isObject, isArray, isFunction, debounce, createId } from './util'
import { categoryOption, cytoscapeOption } from './config.js'
import webWorker from './file.worker.js'
export default {
  name: 'vueCytoscape',
  props: {
    options: {
      type: Object,
      default: () => {}
    },
    category: {
      type: Object,
      default: () => {}
    },
    data: {
      type: Array,
      default: () => []
    },
    preLayout: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      $cytoscapeInstance: null,
      events: [],
      preLayoutOption: {
        name: 'preset',
        fit: true,
        // positions: function (node) {
        //   return node.position
        // }
      },
      $webWorker: null,
      loading: this.reLoading(),
      cacheRandomIdMap: {},
      filters: {},
      $layout: null,
      $removeData: null
    }
  },
  computed: {
    progressText () {
      return (this.loading.layoutPregress * 100).toFixed(1) + '%'
    },
    nodesCategorys () {
      let _categorys = Array.from(
        new Set(this.data.filter(dat => dat.group === 'nodes').map(dat => this.dataByCategory(dat.data, 'nodes')).filter(g => !!g))
      )
      return _categorys
    },
    nodesCategoryBy () {
      if (this.category && this.category.nodes) {
        if (isArray(this.category.nodes)) {
          return this.category.nodes
        } else if (isObject(this.category.nodes)) {
          return this.category.nodes.key
        }
      }
      return null
    },
    edgesCategorys () {
      let _categorys = Array.from(
        new Set(this.data.filter(dat => dat.group === 'edges').map(dat => this.dataByCategory(dat.data, 'edges')).filter(g => !!g))
      )
      return _categorys
    },
    edgesCategoryBy () {
      if (this.category && this.category.edges) {
        if (isArray(this.category.edges)) {
          return this.category.edges
        } else if (isObject(this.category.edges)) {
          return this.category.edges.key
        }
      }
      return null
    },
    categoryNameToClass () {
      let _categoryNameToClass = {}
      this.nodesCategorys.forEach(key => {
        _categoryNameToClass[key] = this.getCacheRandomId(key, 'node_class_')
      })
      this.edgesCategorys.forEach(key => {
        _categoryNameToClass[key] = this.getCacheRandomId(key, 'edge_class_')
      })
      return _categoryNameToClass
    },
    styles () {
      let _categoryStyles = []
      if (this.category) {
        Object.keys(this.category).forEach(key => {
          const _option = this.category[key]
          const _defaultStyle = categoryOption[key].styles
          const _categorys = this[`${key}Categorys`]
          if (isArray(_option)) {
            /****
             * 分类配置为 { data: [{ name: '', style: {}, matching: function () {} }] }
             */
            _categoryStyles = _categoryStyles.concat(_option.map(({ name, style }, _idx) => {
              let _baseIdx = _idx % _defaultStyle.length
              return {
                selector: `.${this.categoryNameToClass[name]}`,
                style: merge({}, _defaultStyle[_baseIdx], style)
              }
            }))
          } else {
            const _styles = _option.styles
            if (_styles) {
              if (isArray(_styles)) {
                /****
                 * 分类配置为 { key: '', styles: [] }
                 */
                _categoryStyles = _categoryStyles.concat(_categorys.map((name, _idx) => {
                  let _optIdx = _idx % _styles.length
                  let _baseIdx = _idx % _defaultStyle.length
                  return {
                    selector: `.${this.categoryNameToClass[name]}`,
                    style: merge({}, _defaultStyle[_baseIdx], _styles[_optIdx])
                  }
                }))
              } else if (isObject(_styles)) {
                /****
                 * 分类配置为 { name: '', data: [] }
                 */
                _categoryStyles = _categoryStyles.concat(_categorys.map((name, _idx) => {
                  let _baseIdx = _idx % _defaultStyle.length
                  return {
                    selector: `.${this.categoryNameToClass[name]}`,
                    style: merge({}, _defaultStyle[_baseIdx], _styles[name] || {})
                  }
                }))
              }
            }
          }
        })
      }
      return _categoryStyles
    },
    cytoscapeOptions () {
      let _mergeOption = mergeArrayConcat({}, cytoscapeOption, {
        style: this.styles
      }, this.options || {})
      if (this.preLayout) {
        _mergeOption.layout = this.preLayoutOption
      }
      return _mergeOption
    }
  },
  watch: {
    data: {
      handler (newValue) {
        this.reCalcGraph()
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
    getCacheRandomId (key, salt, num) {
      this.cacheRandomIdMap[key] = this.cacheRandomIdMap[key] || createId(salt, num)
      return this.cacheRandomIdMap[key]
    },
    dataByCategory (data, type) {
      if (isArray(this[`${type}CategoryBy`])) {
        let _category = this[`${type}CategoryBy`].find(category => category.matching && category.matching(data))
        return _category ? (isFunction(_category.name) ? _category.name(data) : _category.name) : undefined
      } else {
        return data[this[`${type}CategoryBy`]]
      }
    },
    getDataWithClasses (data) {
      const _data = JSON.parse(JSON.stringify(data || []))
      return _data.map(_item => {
        let _categoryName = this.dataByCategory(_item.data, _item.group)
        _item.classes = _item.classes || []
        _item.classes.push(this.categoryNameToClass[_categoryName])
        return _item
      }) 
    },
    /****
     * cytoscape option设置只有拆分的放法
     */
    setOptions: debounce(function (option) {
      this.$cytoscapeInstance.startBatch()
      Object.keys(option).forEach(key => {
        this.$cytoscapeInstance[key] && this.$cytoscapeInstance[key](option[key])
      })
      this.$cytoscapeInstance.endBatch()
    }, 100, this),
    /****
     * cytoscape并不支持数据重置，
     * 所以手动了一个方法
     */
    setData: debounce(function (data) {
      this.$removeData = null
      let _dataWithClasses = this.getDataWithClasses(data)
      if (!this.$cytoscapeInstance) return this.createCytoscape(_dataWithClasses)
      this.$cytoscapeInstance.startBatch()
      // 图中不存在的数据清除
      let _allElements = this.$cytoscapeInstance.$()
      let _removeData = _allElements.filter(ele => !_dataWithClasses.some(item => ele.id() === item.data.id))
      this.$cytoscapeInstance.remove(_removeData)
      let _addData = []
      _dataWithClasses.forEach(_data => {
        let _eleIn = _allElements.$id(_data.data.id)
        if (!_eleIn || !_eleIn.length) { // 添加到图中
          _addData.push(_data)
        } else if (_eleIn.isNode() && this.preLayout) { // 已有数据的位置更新（todo：信息更新）
          // _eleIn.animate(_data)
          // Object.keys(_data).forEach(key => {
          //   console.log('_eleIn[key] && _eleIn[key]() !== _data[key] = ', key_eleIn[key] && _eleIn[key]() !== _data[key], _data[key])
          //   _eleIn[key] && _eleIn[key]() !== _data[key] && _eleIn[key](_data[key])
          // })
          let _x = _eleIn.position('x')
          let _y = _eleIn.position('y')
          const { x, y } = _data.position || {}
          ;(_x !== x || _y !== y) && _eleIn.position({ x, y })
        }
      })
      this.$cytoscapeInstance.add(_addData)
      this.renderFilter()
      this.$cytoscapeInstance.endBatch()
      this.reLayout()
    }, 100, this),
    createCytoscape: debounce(function (data) {
      let _option = mergeArrayConcat({}, this.cytoscapeOptions || {}, {
        container: this.$refs.cytoscapeBox,
        elements: data,
        layout: this.preLayoutOption
      })
      this.$cytoscapeInstance = cytoscape(_option)
      this.reLayout()
      // register all the component events as cytoscape ones
      this.events = this.events.concat(createEvents(this.$cytoscapeInstance))
      for (const [eventType, callback] of Object.entries(this.$listeners)) {
        const func = function (event) {
          callback(event)
        }
        this.$cytoscapeInstance.on(eventType, func)
        this.events.push(() => {
          this.$cytoscapeInstance.off(eventType, func)
        })
      }
      this.$cytoscapeInstance.on('render', this.rendered)
      this.events.push(() => {
        this.$cytoscapeInstance.off('render', this.rendered)
      })

      this.$emit('init', this.$cytoscapeInstance)
    }, 100, this),
    reLayout () {
      this.$layout && this.$layout.stop()
      this.$layout = this.$cytoscapeInstance.layout(this.cytoscapeOptions.layout)
      this.$layout.run()
    },
    async destroy () {
      if (this.$cytoscapeInstance) {
        await this.events.forEach(func => {
          func()
        })
        this.events = []
        await this.$cytoscapeInstance.destroy()
      }
      if (this.$webWorker) {
        this.$webWorker.terminate()
        this.$webWorker = null
      }
    },
    resetFilter (id, relayout) {
      if (id) {
        delete this.filters[id]
      } else {
        this.filters = {}
      }
      this.renderFilter(relayout)
    },
    filterByFunction (func, id, relayout) {
      let _randomId = id || createId('func')
      this.filters[_randomId] = func
      this.renderFilter(relayout)
      return _randomId
    },
    renderFilter: debounce(function (relayout) {
      if (!this.$cytoscapeInstance) return
      this.$cytoscapeInstance.startBatch()
      let _removeData = this.$removeData || this.$cytoscapeInstance.collection()
      let _inviewData = this.$cytoscapeInstance.elements()
      let _allElements = _inviewData.merge(_removeData)
      let _filterElements = _allElements
      Object.keys(this.filters).forEach(key => {
        _filterElements = this.filters[key](_filterElements)
      })
      let _filterNodes = _filterElements.nodes()
      let _filterEdges = _filterElements.edges().filter(ele => {
        return _filterNodes.contains(ele.target()) && _filterNodes.contains(ele.source())
      })
      _filterElements = _filterNodes.merge(_filterEdges)
      this.$cytoscapeInstance.remove(_inviewData)
      this.$removeData = _allElements.difference(_filterElements)
      this.$cytoscapeInstance.add(_filterElements)
      this.$cytoscapeInstance.endBatch()
      relayout && this.reLayout()
      return _filterElements
    }, 100, this),
    webWorkerCallBack (event) {
      switch (event.data.type) {
        case "tick":
          this.loading.layoutPregress = event.data.progress
          break;
        case "end":
          this.loading.layoutPregress = 100
          this.setData(event.data.data)
          break;
      }
    },
    reCalcGraph: debounce(function () {
      this.loading = this.reLoading()
      if (this.preLayout) {
        this.createWebWorker()
      } else {
        this.setData(this.data)
      }
    }, 100, this),
    reLoading () {
      return {
        layoutPregress: this.preLayout ? 0 : 100,
        rendered: false
      }
    },
    rendered () {
      this.loading.rendered = true
    },
    transData (data) {
      if (!data || !data.length || !this.$webWorker) return
      // let _nodes = data.filter(_d => _d.group === 'nodes' && (_d.data.group === 'house' || _d.data.group === 'cup' || _d.data.group === 'tree' || _d.data.group === 'person'))
      // let _edges = data.filter(_d => _d.group === 'edges' && [_d.data.source, _d.data.target].every(_id => _nodes.find(n => n.data.id === _id)))
      this.$webWorker.postMessage({ data, steps: [], width: this.$el.clientWidth, height: this.$el.clientHeight })
    },
    createWebWorker () {
      if (!this.$webWorker) {
        this.$webWorker = new webWorker()
        this.$webWorker.onmessage = this.webWorkerCallBack
      }
      this.transData(this.data)
    }
  },
  mounted () {
    this.reCalcGraph()
  },
  beforeDestroy () {
    this.destroy()
  }
}
</script>
<style lang="less" scoped>
.cytoscape--container {
  text-align: left;
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  .cytoscape--container__graph, .cytoscape--container__loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    .text{
      padding: 10px;
    }
  }
  .cytoscape--container__loading{
    background: #fff;
    .progress-bar{
      top: 50%;
      margin-top: -15px;
      left: 20%;
      width: 60%;
      text-align: center;
      position: absolute;
      overflow: hidden;
      .progress-bar__outer{
        width: 100%;
        border-radius: 100px;
        margin: 16px 0;
        height: 10px;
        background-color: #ebeef5;
        overflow: hidden;
        position: relative;
        vertical-align: middle;
        .progress-bar__inner{
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          background-color: #409eff;
          text-align: right;
          border-radius: 100px;
          line-height: 1;
          white-space: nowrap;
        }
      }
    }
    .center{
      top: 50%;
      margin-top: -21px;
      width: 100%;
      text-align: center;
      position: absolute;
      .circular{
        height: 42px;
        width: 42px;
        animation: loading-rotate 2s linear infinite;
        .path {
          animation: loading-dash 1.5s ease-in-out infinite;
          stroke-dasharray: 90,150;
          stroke-dashoffset: 0;
          stroke-width: 2;
          stroke: #409eff;
          stroke-linecap: round;
        }
      }
    }
  }
}
</style>

