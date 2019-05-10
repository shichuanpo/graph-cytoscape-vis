import cytoscape from 'cytoscape'
// import fcose from 'cytoscape-fcose'
import euler from 'cytoscape-euler'
import $ from 'jquery'
import contextMenus from 'cytoscape-context-menus'
import 'cytoscape-context-menus/cytoscape-context-menus.css'
import defaultOptions from './defaultOption'
import { merge, createId } from './util'
cytoscape.use(contextMenus, $)
// cytoscape.use(fcose)
cytoscape.use(euler)
class Cytoscape {
  constructor(el, data, option) {
    this._el = el
    this._data = data
    this.option = merge(defaultOptions, option || {})
    this._originalData = {}
    this._clusterData = {}
    this._cytoscape = null
    this._event = []
    this._init()
  }
  _init() {
    let option = merge({}, this.option, {
      container: this._el,
      elements: this._data
    })
    this._cytoscape = cytoscape(option)
    let selector = ''
    ;['mouseover', 'mouseout', 'click'].forEach(item => {
      this._event.push({ type: item, selector, handler: this[`_${item}`] })
      selector
        ? this._cytoscape.on(item, selector, this[`_${item}`])
        : this._cytoscape.on(item, this[`_${item}`])
    })
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
  _getMergedOriginalData() {
    return Object.keys(this._originalData).reduce(
      (result, currentValue) => {
        Object.keys(result).forEach(key => {
          result[key].merge(this._originalData[currentValue][key])
        })
        return result
      },
      {
        nodes: this._cytoscape.collection(),
        edgesSource: this._cytoscape.collection(),
        edgesTarget: this._cytoscape.collection()
      }
    )
  }
  _getMergedClusterData() {
    return Object.keys(this._clusterData).reduce(
      (result, currentValue) => {
        Object.keys(result).forEach(key => {
          result[key].merge(this._clusterData[currentValue][key])
        })
        return result
      },
      {
        nodes: this._cytoscape.collection(),
        edgesSource: this._cytoscape.collection(),
        edgesTarget: this._cytoscape.collection()
      }
    )
  }
  _getAllNodes() {
    return this._cytoscape.elements('node').merge(
      Object.keys(this._originalData).reduce((result, currentValue) => {
        return result.merge(this._originalData[currentValue].nodes)
      }, this._cytoscape.collection())
    )
  }
  _getAllEdges() {
    return this._cytoscape.elements('edge').merge(
      Object.keys(this._originalData).reduce((result, currentValue) => {
        return result
          .merge(this._originalData[currentValue].edgesSource)
          .merge(this._originalData[currentValue].edgesTarget)
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
    this.remove()
    this._cytoscape.add(this._cytoscape.collection(data))
  }
  remove() {
    this._cytoscape.remove(this._cytoscape.elements())
  }
  /****
   * 点聚合（图例操作，单个聚合，是否有聚合点）
   */
  clusterNodesByProps(prop, value, createNode = false) {
    if (this._clusterData[`${prop}=${value}`]) return
    let allNodes = this._cytoscape.elements()
    let nodes = allNodes.filter(ele => ele.data(prop) === value)
    let elseNodes = allNodes.filter(ele => ele.data(prop) !== value)
    let edgesSource = nodes.edgesTo(elseNodes)
    let edgesTarget = nodes.edgesWith(elseNodes).difference(edgesSource)
    if (nodes.length < 1) return
    let _ids = nodes.filter(node => node.isNode()).map(node => node.id())
    if (createNode) {
      let randomId = createId('cluster_')
      let _clusterNodes = [
        {
          group: 'nodes',
          data: {
            _ids,
            id: randomId,
            label: `node[${prop}="${value}"]`,
            group: 'cluster'
          },
          position: this._calcCenterFromNodes(nodes)
        }
      ]
      let dataCollection = this._cytoscape.collection(_clusterNodes)
      this._cytoscape.add(dataCollection)
      edgesSource.forEach(collection => {
        collection.forEach(ele => ele.data({ _source: ele.data('source') }))
        collection.move({ source: randomId })
      })
      edgesTarget.forEach(collection => {
        collection.forEach(ele => ele.data({ _target: ele.data('target') }))
        collection.move({ target: randomId })
      })
      this._clusterData[`${prop}=${value}`] = {
        nodes: dataCollection,
        edgesSource: edgesSource.merge(
          this._getAllEdges().filter(edge => _ids.includes(edge.data('source')))
        ),
        edgesTarget: edgesTarget.merge(
          this._getAllEdges().filter(edge => _ids.includes(edge.data('target')))
        )
      }
    }
    this._originalData[`${prop}=${value}`] = {
      nodes,
      edgesSource: edgesSource.merge(
        this._getAllEdges().filter(edge => _ids.includes(edge.data('source')))
      ),
      edgesTarget: edgesTarget.merge(
        this._getAllEdges().filter(edge => _ids.includes(edge.data('target')))
      )
    }
    this._cytoscape.remove(nodes)
  }
  filterNodesByFunction(func) {
    let allNodes = this._getAllNodes()
    let removeNodes = allNodes.filter(node => !func(node))
    let removeEdges = removeNodes.connectedEdges()
    let _randomId = createId('func')
    this._originalData[_randomId] = {
      nodes: removeNodes,
      edgesSource: removeEdges,
      edgesTarget: removeEdges
    }
    this._cytoscape.remove(removeNodes)
    return _randomId
  }
  filterEdgesByFunction(func) {
    let allEdges = this._getAllEdges()
    let removeEdges = allEdges.filter(edge => !func(edge))
    let removeNodes = removeEdges
      .sources()
      .merge(removeEdges.targets())
      .filter(node => node.connectedEdges().length === 1)
    let _randomId = createId('func')
    this._originalData[_randomId] = {
      nodes: removeNodes,
      edgesSource: removeEdges,
      edgesTarget: removeEdges
    }
    this._cytoscape.remove(removeNodes)
    return _randomId
  }
  /****
   * 重置聚合（图例操作，单个重置，是否有聚合点）
   */
  reset(prop, value) {
    if (prop === undefined || value === undefined) {
      // 全部重置
      let _originalMergeData = this._getMergedOriginalData()
      let _clusterData = this._getMergedClusterData()
      this._cytoscape.add(_originalMergeData.nodes)
      this._cytoscape.add(_originalMergeData.edgesSource)
      this._cytoscape.add(_originalMergeData.edgesTarget)
      _clusterData.edgesSource.forEach(edge => {
        this._cytoscape.collection(edge).move({ source: edge.data('_source') })
      })
      _clusterData.edgesTarget.forEach(edge => {
        this._cytoscape.collection(edge).move({ target: edge.data('_target') })
      })
      this._cytoscape.remove(_clusterData.nodes)
      this._clusterData = {}
      this._originalData = {}
    } else if (this._originalData && this._originalData[`${prop}=${value}`]) {
      // 单个聚合
      let _originalData = this._originalData[`${prop}=${value}`]
      this._cytoscape.add(_originalData.nodes)
      if (this._clusterData[`${prop}=${value}`]) {
        // 有聚合点的时候
        this._clusterData[`${prop}=${value}`].edgesSource.forEach(edge => {
          if (this._hasIdInGraph(edge.id(), 'edge')) {
            this._cytoscape
              .collection(edge)
              .move({ source: edge.data('_source') })
          } else {
            let ejson = edge.data()
            ejson.source = ejson._source || ejson.source
            this._canDrawEdge(ejson) &&
              this._cytoscape.add({
                type: 'edges',
                data: ejson
              })
          }
        })
        this._clusterData[`${prop}=${value}`].edgesTarget.forEach(edge => {
          if (this._hasIdInGraph(edge.id(), 'edge')) {
            this._cytoscape
              .collection(edge)
              .move({ target: edge.data('_target') })
          } else {
            let ejson = edge.data()
            ejson.target = ejson._target || ejson.target
            this._canDrawEdge(ejson) &&
              this._cytoscape.add({
                type: 'edges',
                data: ejson
              })
          }
        })
        this._cytoscape.remove(this._clusterData[`${prop}=${value}`].nodes)
      }
      this._cytoscape.add(
        _originalData.edgesSource.filter(edge => this._canDrawEdge(edge.data()))
      )
      this._cytoscape.add(
        _originalData.edgesTarget.filter(edge => this._canDrawEdge(edge.data()))
      )
      delete this._clusterData[`${prop}=${value}`]
      delete this._originalData[`${prop}=${value}`]
    }
  }
}
export default Cytoscape
