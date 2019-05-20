import cytoscape from 'cytoscape'
import { mergeArrayConcat, createId } from './util'
class Cytoscape {
  constructor(el, data, option) {
    this._el = el
    this._data = data
    this._filterData = {}
    this._cytoscape = null
    this._event = []
    this._init(option)
  }
  _init(option) {
    this.option = option || {}
    let _option = mergeArrayConcat({}, this.option, {
      container: this._el,
      elements: this._data
    })
    this._cytoscape = cytoscape(_option)
    let selector = ''
    ;['mouseover', 'mouseout', 'click', 'cxttap'].forEach(item => {
      this._event.push({ type: item, selector, handler: this[`_${item}`] })
      selector
        ? this._cytoscape.on(item, selector, this[`_${item}`])
        : this._cytoscape.on(item, this[`_${item}`])
    })
  }
  _cxttap(e) {
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
    return (
      this._cytoscape &&
      this._cytoscape.elements('node').merge(
        Object.keys(this._filterData).reduce((result, currentValue) => {
          return result.merge(this._filterData[currentValue].nodes)
        }, this._cytoscape.collection())
      )
    )
  }
  _getAllEdges() {
    return (
      this._cytoscape &&
      this._cytoscape.elements('edge').merge(
        Object.keys(this._filterData).reduce((result, currentValue) => {
          return result.merge(this._filterData[currentValue].edges)
        }, this._cytoscape.collection())
      )
    )
  }
  _canDrawEdge(edge) {
    return (
      edge.target() &&
      edge.target().inside() &&
      edge.source() &&
      edge.source().inside() &&
      !edge.inside()
    )
  }
  _canDrawNode(node) {
    return !node.inside()
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
    this._cytoscape && this._cytoscape.unmount()
    this._cytoscape && this._cytoscape.destroy()
    this._cytoscape = null
  }
  setOptions(option) {
    this.destroy()
    this._init(option)
  }
  data(data) {
    if (this._cytoscape) {
      this._cytoscape.resize()
      this.remove()
      this._data = data
      this._cytoscape.add(data)
      let layout = this._cytoscape.layout(this.option.layout)
      layout.run()
    }
  }
  remove() {
    this._cytoscape && this._cytoscape.remove(this._cytoscape.elements())
  }
  filterNodesByFunction(func) {
    let allNodes = this._getAllNodes()
    if (!allNodes) return
    let removeNodes = allNodes.filter(node => !func(node) && node.inside())
    let removeEdges = removeNodes.connectedEdges().filter(edge => edge.inside())
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
    if (!allEdges) return
    let removeEdges = allEdges.filter(edge => !func(edge) && edge.inside())
    let removeNodes = removeEdges
      .sources()
      .merge(removeEdges.targets())
      .filter(
        node => removeEdges.contains(node.connectedEdges()) && node.inside()
      )
    let _randomId = createId('func')
    this._filterData[_randomId] = {
      nodes: removeNodes,
      edges: removeEdges
    }
    this._cytoscape.remove(removeNodes)
    this._cytoscape.remove(removeEdges)
    return _randomId
  }
  reset(id) {
    let _filterMergeData
    if (id) {
      _filterMergeData = this._filterData[id]
    } else {
      _filterMergeData = this._getMergedData(this._filterData)
    }
    this._cytoscape.add(
      _filterMergeData.nodes.filter(node => this._canDrawNode(node))
    )
    let _canDrawEdges = _filterMergeData.edges.filter(edge =>
      this._canDrawEdge(edge)
    )
    // 把画不出来的线归到其他的集合里面。因为线有两个属性（source， target）
    let _cannotDrawEdges = _filterMergeData.edges.difference(_canDrawEdges)
    Object.keys(this._filterData).forEach(key => {
      this._filterData[key].edges.merge(
        _cannotDrawEdges.filter(
          edge =>
            this._filterData[key].nodes.getElementById(edge.data('source')) ||
            this._filterData[key].nodes.getElementById(edge.data('target'))
        )
      )
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
