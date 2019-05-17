import cytoscape from 'cytoscape'
import fcose from 'cytoscape-fcose'
// import euler from 'cytoscape-euler'
import $ from 'jquery'
import contextMenus from 'cytoscape-context-menus'
import 'cytoscape-context-menus/cytoscape-context-menus.css'
import { mergeArrayConcat, createId } from './util'
cytoscape.use(contextMenus, $)
cytoscape.use(fcose)
// cytoscape.use(euler)
class Cytoscape {
  constructor(el, data, option) {
    this._el = el
    this._data = data
    this.option = option || {}
    this._filterData = {}
    this._cytoscape = null
    this._event = []
    this._init()
  }
  _init() {
    let option = mergeArrayConcat({}, this.option, {
      container: this._el,
      elements: this._data
    })
    this._cytoscape = cytoscape(option)
    let selector = ''
    ;['mouseover', 'mouseout', 'click', 'cxttap'].forEach(item => {
      this._event.push({ type: item, selector, handler: this[`_${item}`] })
      selector
        ? this._cytoscape.on(item, selector, this[`_${item}`])
        : this._cytoscape.on(item, this[`_${item}`])
    })
  }
  _cxttap(e){
    let element = e.target
    this.elements().unselect()
    if (element.isNode || element.isEdge) {
      this.elements(element).select()
    }
  }
  _click(e) {
    let element = e.target
    this.elements().unselect()
    if (element.isNode || element.isEdge) {
      this.elements(element).select()
    }
  }
  _mouseover(e) {
    let element = e.target
    if (element.isNode || element.isEdge) {
      let targetElement = this.elements(element)
      let neighborhood = targetElement.neighborhood()
      let connectedNodes = targetElement.connectedNodes()
      let hoverElements = targetElement
        .merge(neighborhood)
        .merge(connectedNodes)
      let elseElements = this.elements().difference(hoverElements)
      elseElements.addClass('unhover')
      hoverElements.addClass('hover')
    }
  }
  _mouseout(e) {
    let element = e.target
    if (element.isNode || element.isEdge) {
      let targetElement = this.elements(element)
      let neighborhood = targetElement.neighborhood()
      let connectedNodes = targetElement.connectedNodes()
      let hoverElements = targetElement
        .merge(neighborhood)
        .merge(connectedNodes)
      let elseElements = this.elements().difference(hoverElements)
      elseElements.removeClass('unhover')
      hoverElements.removeClass('hover')
    }
  }
  _getMergedData(data) {
    return Object.keys(data).reduce(
      (result, currentValue) => {
        Object.keys(result).forEach(key => {
          result[key].merge(data[currentValue][key])
        })
        return result
      },
      {
        nodes: this._cytoscape.collection(),
        edges: this._cytoscape.collection()
      }
    )
  }
  _getAllNodes() {
    return this._cytoscape.elements('node').merge(
      Object.keys(this._filterData).reduce((result, currentValue) => {
        return result.merge(this._filterData[currentValue].nodes)
      }, this._cytoscape.collection())
    )
  }
  _getAllEdges() {
    return this._cytoscape.elements('edge').merge(
      Object.keys(this._filterData).reduce((result, currentValue) => {
        return result
          .merge(this._filterData[currentValue].edges)
      }, this._cytoscape.collection())
    )
  }
  _hasIdInGraph(id, type = 'node') {
    return this._cytoscape.elements(`${type}#${id}`).length
  }
  _canDrawEdge(data) {
    return (
      this._hasIdInGraph(data.source) &&
      this._hasIdInGraph(data.target) &&
      !this._hasIdInGraph(data.id, 'edge')
    )
  }
  _canRemoveEdge (data) {
    return (
      this._hasIdInGraph(data.source) &&
      this._hasIdInGraph(data.target) &&
      this._hasIdInGraph(data.id, 'edge')
    )
  }
  _canDrawNode(data) {
    return !this._hasIdInGraph(data.id)
  }
  _calcCenterFromNodes(nodes) {
    return nodes.reduce(
      (prevVal, ele, i) => {
        return {
          x:
            (((prevVal && prevVal.x) ||
              (prevVal && prevVal.position && prevVal.position('x')) ||
              0) *
              i +
              (ele.position('x') || 0)) /
            (i + 1),
          y:
            (((prevVal && prevVal.y) ||
              (prevVal && prevVal.position && prevVal.position('y')) ||
              0) *
              i +
              (ele.position('y') || 0)) /
            (i + 1)
        }
      },
      {
        x: 0,
        y: 0
      }
    )
  }
  get cytoscape() {
    return this._cytoscape
  }
  destroy() {
    this._event.forEach(e =>
      e.selector
        ? this._cytoscape.off(e.type, e.selector, e.handler)
        : this._cytoscape.off(e.type, e.handler)
    )
    this._event = []
    this._cytoscape.destroy()
  }
  data(data) {
    if (this._cytoscape) {
      this._cytoscape.resize()
      this.remove()
      this._cytoscape.add(data)
      let layout = this._cytoscape.layout({name: 'fcose'})
      layout.run()
    }
  }
  remove() {
    this._cytoscape && this._cytoscape.remove(this._cytoscape.elements())
  }
  filterNodesByFunction(func) {
    let allNodes = this._getAllNodes()
    let removeNodes = allNodes.filter(node => !func(node) && this._hasIdInGraph(node.id()))
    let removeEdges = removeNodes.connectedEdges().filter(edge => this._canRemoveEdge(edge.data()))
    let _randomId = createId('func')
    this._filterData[_randomId] = {
      nodes: removeNodes,
      edges: removeEdges
    }
    this._cytoscape.remove(removeNodes)
    return _randomId
  }
  filterEdgesByFunction(func) {
    let allEdges = this._getAllEdges()
    let removeEdges = allEdges.filter(edge => !func(edge) && this._canRemoveEdge(edge.data()))
    let removeNodes = removeEdges
      .sources()
      .merge(removeEdges.targets())
      .filter(node => removeEdges.contains(node.connectedEdges()) && this._hasIdInGraph(node.id()))
    let _randomId = createId('func')
    this._filterData[_randomId] = {
      nodes: removeNodes,
      edges: removeEdges
    }
    this._cytoscape.remove(removeNodes)
    this._cytoscape.remove(removeEdges)
    return _randomId
  }
  reset (id) {
    let _filterMergeData
    if (id) {
      _filterMergeData = this._filterData[id]
    } else {
      _filterMergeData = this._getMergedData(this._filterData)
    }
    this._cytoscape.add(_filterMergeData.nodes.filter(node => this._canDrawNode(node.data())))
    let _canDrawEdges = _filterMergeData.edges.filter(edge => this._canDrawEdge(edge.data()))
    let _cannotDrawEdges = _filterMergeData.edges.difference(_canDrawEdges)
    Object.keys(this._filterData).forEach(key => {
      this._filterData[key].edges.merge(_cannotDrawEdges.filter(edge => this._filterData[key].nodes.getElementById(edge.data('source')) || this._filterData[key].nodes.getElementById(edge.data('target'))))
    })
    this._cytoscape.add(_canDrawEdges)
    if (id) {
      delete this._filterData[id]
    } else {
      this._filterData = {}
    }
  }
}
export default Cytoscape
