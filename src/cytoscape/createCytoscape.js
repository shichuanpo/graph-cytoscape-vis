import cytoscape from 'cytoscape'
import { mergeArrayConcat, createId } from './util'
function createCytoscape (el, data, option) {
  let _option = mergeArrayConcat({}, option || {}, {
    container: el,
    elements: data
  })
  let cy = cytoscape(_option)
  extend(cy)
  return cy
}
function extend (cy) {
  extendFunc(cy)
  extendData(cy)
}
function extendFunc (cy) {
  !cy.filterNodesByFunction && cytoscape('core', 'filterNodesByFunction', filterNodesByFunction)
  !cy.filterEdgesByFunction && cytoscape('core', 'filterEdgesByFunction', filterEdgesByFunction)
  !cy.resetFilter && cytoscape('core', 'resetFilter', resetFilter)
  // cytoscape( 'collection', 'filterNodesByFunction', filterNodesByFunction )
  // cytoscape( 'collection', 'filterNodesByFunction', filterNodesByFunction )
  // cytoscape( 'collection', 'resetFilter', resetFilter )
}
function extendData (cy) {
  cy.scratch('filterData', {})
  cy.scratch('legend', {})
}
function _getMergedData (cy, data) {
  return Object.keys(data).reduce(
    (result, currentValue) => {
      Object.keys(result).forEach(key => {
        result[key].merge(data[currentValue][key])
      })
      return result
    },
    {
      nodes: cy.collection(),
      edges: cy.collection()
    }
  )
}
function _getAllNodes (cy) {
  let _filterData = cy.scratch('filterData')
  return (
    cy.nodes().merge(
      Object.keys(_filterData).reduce((result, currentValue) => {
        return result.merge(_filterData[currentValue].nodes)
      }, cy.collection())
    )
  )
}
function _getAllEdges (cy) {
  let _filterData = cy.scratch('filterData')
  return (
    cy.edges().merge(
      Object.keys(_filterData).reduce((result, currentValue) => {
        return result.merge(_filterData[currentValue].edges)
      }, cy.collection())
    )
  )
}
function _canDrawEdge (edge) {
  return (
    edge.target() &&
    edge.target().inside() &&
    edge.source() &&
    edge.source().inside() &&
    !edge.inside()
  )
}
function _canDrawNode (node) {
  return !node.inside()
}
function filterNodesByFunction (func) {
  let allNodes = _getAllNodes(this)
  if (!allNodes) return
  let removeNodes = allNodes.filter(node => !func(node) && node.inside())
  let removeEdges = removeNodes.connectedEdges().filter(edge => edge.inside())
  let _randomId = createId('func')
  let _filterData = this.scratch('filterData')
  _filterData[_randomId] = {
    nodes: removeNodes,
    edges: removeEdges
  }
  this.remove(removeNodes)
  return _randomId
}
function filterEdgesByFunction (func) {
  let allEdges = _getAllEdges(this)
  if (!allEdges) return
  let removeEdges = allEdges.filter(edge => !func(edge) && edge.inside())
  let removeNodes = removeEdges
    .sources()
    .merge(removeEdges.targets())
    .filter(
      node => removeEdges.contains(node.connectedEdges()) && node.inside()
    )
  let _randomId = createId('func')
  let _filterData = this.scratch('filterData')
  _filterData[_randomId] = {
    nodes: removeNodes,
    edges: removeEdges
  }
  this.remove(this.collection().merge(removeNodes).merge(removeEdges))
  return _randomId
}
function resetFilter (id) {
  let _filterMergeData = {}
  let _filterData = this.scratch('filterData')
  if (id) {
    _filterMergeData = _filterData[id] || {
      nodes: this.collection(),
      edges: this.collection()
    }
  } else {
    _filterMergeData = _getMergedData(this, _filterData)
  }
  this.add(
    _filterMergeData.nodes.filter(node => _canDrawNode(node))
  )
  let _canDrawEdges = _filterMergeData.edges.filter(edge => _canDrawEdge(edge))
  // 把画不出来的线归到其他的集合里面。因为线有两个属性（source， target）
  let _cannotDrawEdges = _filterMergeData.edges.difference(_canDrawEdges)
  Object.keys(_filterData).forEach(key => {
    _filterData[key].edges.merge(
      _cannotDrawEdges.filter(
        edge =>
          _filterData[key].nodes.getElementById(edge.data('source')) ||
          _filterData[key].nodes.getElementById(edge.data('target'))
      )
    )
  })
  this.add(_canDrawEdges)
  if (id) {
    delete _filterData[id]
  } else {
    _filterData = {}
  }
  this.scratch('filterData', _filterData)
  return null
}
export default createCytoscape
