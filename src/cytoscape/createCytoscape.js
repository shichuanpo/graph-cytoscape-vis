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
  !cy.filterByFunction && cytoscape('core', 'filterByFunction', filterByFunction)
  !cy.resetFilter && cytoscape('core', 'resetFilter', resetFilter)
  !cy.renderFilter && cytoscape('core', 'renderFilter', renderFilter)
}
function extendData (cy) {
  cy.scratch('filters', {})
}
function filterByFunction (func) {
  let _filterFuncs = this.scratch('filters')
  let _randomId = createId('func')
  _filterFuncs[_randomId] = func
  this.renderFilter()
  return _randomId
}
function renderFilter () {
  let _filterFuncs = this.scratch('filters')
  let _allElements = this.elements()
  let _filterElements = _allElements
  Object.keys(_filterFuncs).forEach(key => {
    _filterElements = _filterElements.filter(ele => _filterFuncs[key](ele, _allElements))
  })
  let _filterNodes = _filterElements.nodes()
  let _filterEdges = _filterElements.edges().filter(ele => {
    return _filterNodes.contains(ele.target()) && _filterNodes.contains(ele.source())
  })
  _filterElements = _filterNodes.merge(_filterEdges)
  const _removeElements = _allElements.difference(_filterElements)
  _filterElements.removeClass('hide')
  _removeElements.addClass('hide')
  return _filterElements
}
function resetFilter (id) {
  let _filterFuncs = this.scratch('filters')
  if (id) {
    delete _filterFuncs[id]
  } else {
    this.scratch('filters', {})
  }
  this.renderFilter()
}
export default createCytoscape
