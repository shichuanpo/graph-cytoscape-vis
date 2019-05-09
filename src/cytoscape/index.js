import cytoscape from 'cytoscape'
import fcose from 'cytoscape-fcose'
import euler from 'cytoscape-euler'
import cxtmenu from 'cytoscape-cxtmenu'
import $ from 'jquery'
import contextMenus from 'cytoscape-context-menus'

import 'cytoscape-context-menus/cytoscape-context-menus.css'
import { createChildren } from '../mock/data'
cytoscape.use(cxtmenu)
cytoscape.use(contextMenus, $)
cytoscape.use(fcose)
cytoscape.use(euler)
var options = {
  // List of initial menu items
  menuItems: [
    {
      id: 'remove', // ID of menu item
      content: 'remove', // Display content of menu item
      tooltipText: 'remove', // Tooltip text for menu item
      image: { src: 'remove.svg', width: 12, height: 12, x: 6, y: 4 }, // menu icon
      // Filters the elements to have this menu item on cxttap
      // If the selector is not truthy no elements will have this menu item on cxttap
      selector: 'node, edge',
      onClickFunction: function() {
        // The function to be executed on click
        console.log('remove element = ', arguments)
      },
      disabled: false, // Whether the item will be created as disabled
      show: true, // Whether the item will be shown or not
      hasTrailingDivider: true, // Whether the item will have a trailing divider
      coreAsWell: false // Whether core instance have this item on cxttap
    },
    {
      id: 'hide',
      content: 'hide',
      tooltipText: 'hide',
      selector: 'node, edge',
      onClickFunction: function() {
        console.log('hide element')
      },
      disabled: true
    },
    {
      id: 'add-node',
      content: 'add node',
      tooltipText: 'add node',
      image: { src: 'add.svg', width: 12, height: 12, x: 6, y: 4 },
      selector: 'node',
      coreAsWell: false,
      onClickFunction: function() {
        console.log('add node')
      }
    }
  ],
  // css classes that menu items will have
  menuItemClasses: [
    // add class names to this list
  ],
  // css classes that context menu will have
  contextMenuClasses: [
    // add class names to this list
  ]
}

const colors = [
  '#c23531',
  '#2f4554',
  '#61a0a8',
  '#d48265',
  '#91c7ae',
  '#749f83',
  '#ca8622',
  '#bda29a',
  '#6e7074',
  '#546570',
  '#c4ccd3'
]
const cxtmenuOption = {
  menuRadius: 100, // the radius of the circular menu in pixels
  selector: 'node', // elements matching this Cytoscape.js selector will trigger cxtmenus
  commands: [
    // an array of commands to list in the menu or a function that returns the array
    /*
    { // example command
      fillColor: 'rgba(200, 200, 200, 0.75)', // optional: custom background color for item
      content: 'a command name' // html/text content to be displayed in the menu
      contentStyle: {}, // css key:value pairs to set the command's css in js if you want
      select: function(ele){ // a function to execute when the command is selected
        console.log( ele.id() ) // `ele` holds the reference to the active element
      },
      enabled: true // whether the command is selectable
    }
    */
  ],
  fillColor: 'rgba(0, 0, 0, 0.75)', // the background colour of the menu
  activeFillColor: 'rgba(5, 161, 140, 0.75)', // the colour used to indicate the selected command
  activePadding: 0, // additional size in pixels for the active command
  indicatorSize: 24, // the size in pixels of the pointer to the active command
  separatorWidth: 3, // the empty spacing in pixels between successive commands
  spotlightPadding: 4, // extra spacing in pixels between the element and the spotlight
  minSpotlightRadius: 24, // the minimum radius in pixels of the spotlight
  maxSpotlightRadius: 38, // the maximum radius in pixels of the spotlight
  openMenuEvents: 'cxttapstart taphold', // space-separated cytoscape events that will open the menu; only `cxttapstart` and/or `taphold` work here
  itemColor: 'white', // the colour of text in the command's content
  itemTextShadowColor: 'transparent', // the text shadow colour of the command's content
  zIndex: 9999, // the z-index of the ui div
  atMouse: false // draw menu at mouse position
}
class Cytoscape {
  constructor(el, data, option) {
    this._el = el
    this._data = data
    this.groups = Array.from(
      new Set(data.map(dat => dat.data.group).filter(g => !!g))
    )
    let colorByGroup = {}
    this.groups.forEach((group, idx) => {
      idx = idx % colors.length
      colorByGroup[group] = colors[idx]
    })
    colorByGroup.cluster = 'red'
    this.option = this._merge(
      {
        layout: {
          name: 'euler',
          randomize: true,
          animate: false
        },
        style: [
          {
            selector: ':active',
            style: {
              'overlay-opacity': 0
            }
          },
          {
            selector: 'node:selected',
            style: {
              'border-color': 'rgba(5, 161, 140, 1)',
              'border-width': 2
            }
          },
          {
            selector: 'node',
            style: {
              content: 'data(name)',
              'background-color': function(ele) {
                return ele.data('group')
                  ? colorByGroup[ele.data('group')] || '#ccc'
                  : '#ccc'
              },
              'background-opacity': 0.6,
              'z-index-compare': 'manual',
              'z-index': 2
            }
          },
          {
            selector: 'node[label]',
            style: {
              label: 'data(label)',
              'font-size': '9px',
              color: '#666',
              'z-index': 2
            }
          },
          {
            selector: 'edge',
            style: {
              width: 1,
              'curve-style': 'bezier',
              'target-arrow-shape': 'vee',
              'target-arrow-color': '#dddddd',
              'line-color': '#dddddd',
              'z-index': 1
            }
          },
          {
            selector: 'edge[label]',
            style: { 'font-size': '9px', color: '#666', 'z-index': 1 }
          },
          {
            selector: '.hover',
            style: {
              'target-arrow-color': '#aaa',
              'line-color': '#aaa',
              color: '#333',
              'background-opacity': 1,
              'z-index': 99
            }
          },
          {
            selector: 'edge.hover',
            style: {
              width: 2,
              'z-index': 98
            }
          },
          {
            selector: '.unhover',
            style: {
              'target-arrow-color': '#eee',
              'line-color': '#eee',
              color: '#eee',
              'background-opacity': 0.3,
              'z-index': 0
            }
          },
          {
            selector: 'edge.unhover',
            style: {
              width: 1
            }
          }
        ],
        minZoom: 0.5,
        maxZoom: 10
        // userPanningEnabled: false,
        // boxSelectionEnabled: true
      },
      option || {}
    )
    this._originalData = {}
    this._clusterData = {}
    this._originalElements = null
    this._cytoscape = null
    this._event = []
    this._init()
  }
  _isObject(item) {
    return Object.prototype.toString.call(item) === '[object Object]'
  }
  __merge(target, source) {
    if (this._isObject(target) && this._isObject(source)) {
      for (let key in source) {
        if (this._isObject(source[key]) && this._isObject(target[key])) {
          target[key] = this.__merge(target[key], source[key])
        } else {
          target[key] = source[key]
        }
      }
      return target
    } else {
      console.error('target or source must be Object')
    }
  }
  _merge() {
    let objs = Array.from(arguments)
    if (objs.length < 1) {
      console.error('target or source must be Object')
    }
    objs[0] = this.__merge(...objs)
    objs.splice(1, 1)
    if (objs.length > 1) {
      return this._merge(...objs)
    } else if (objs.length === 1) {
      return objs[0]
    } else {
      console.error('target or source must be Object')
    }
  }
  _createId(salt, randomLength = 8) {
    return (
      (salt || '') +
      Number(
        Math.random()
          .toString()
          .substr(3, randomLength) + Date.now()
      ).toString(36)
    )
  }
  _init() {
    let option = this._merge({}, this.option, {
      container: this._el,
      elements: this._data
    })
    this._cytoscape = cytoscape(option)
    this._originalElements = this._cytoscape.elements()
    ;['mouseover', 'mouseout', 'select'].forEach(item => {
      this._event.push({ type: item, handler: this[`_${item}`] })
      this._cytoscape.on(item, this[`_${item}`])
    })
  }
  _select(e) {
    let element = e.target
    if (element.isNode || element.isEdge) {
      // this._cytoscapeCxtmenu && this._cytoscapeCxtmenu.destroy()
      // cxtmenuOption.commands = Object.keys(element.data()).map(item => {
      //   return {
      //     content: item,
      //     select: function(ele) {
      //       let cy = ele.cy()
      //       let collection = cy.collection(createChildren(ele.data().id, 100))
      //       let elements = cy.add(collection)
      //       let num = -1
      //       let degreeCalc = function(
      //         num,
      //         defalutCount = 10,
      //         count = 10,
      //         concentric = 0
      //       ) {
      //         if (num === 0) {
      //           return concentric
      //         } else if (Math.floor(num / (count + 1)) > 0) {
      //           return degreeCalc(
      //             num - count,
      //             defalutCount,
      //             Math.floor(count + defalutCount / 2),
      //             concentric - 1
      //           )
      //         } else {
      //           return concentric - 1
      //         }
      //       }
      //       var layoutOption = {
      //         name: 'concentric',
      //         fit: false,
      //         boundingBox: {
      //           x1: ele.position().x - 50,
      //           y1: ele.position().y - 50,
      //           w: 100,
      //           h: 100
      //         },
      //         concentric: function(node) {
      //           num++
      //           return degreeCalc(num)
      //         },
      //         levelWidth: function(nodes) {
      //           return 1
      //         },
      //         animateFilter: function(node, i) {
      //           return false
      //         }
      //       }
      //       let elementsWithOwner = cy.elements(ele).merge(elements)
      //       var layout = elementsWithOwner.layout(layoutOption)
      //       layout.run()
      //     }
      //   }
      // })
      // this._cytoscapeCxtmenu = this.cxtmenu(cxtmenuOption)
      var instance = this.contextMenus(options)
      console.log('instance = ', instance)
    }
  }
  _mouseover(e) {
    let element = e.target
    this.elements().unselect()
    if (element.isNode || element.isEdge) {
      this.elements(element).select()
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
    this.elements().unselect()
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
  _destory() {
    this._event.forEach(e => this._cytoscape.off(e.type, e.handler))
    this._event = []
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
  clusterByProps(prop, value, createNode = false) {
    if (this._clusterData[`${prop}=${value}`]) return
    let allNodes = this._cytoscape.elements()
    let nodes = allNodes.filter(ele => ele.data(prop) === value)
    let elseNodes = allNodes.filter(ele => ele.data(prop) !== value)
    let edgesSource = nodes.edgesTo(elseNodes)
    let edgesTarget = nodes.edgesWith(elseNodes).difference(edgesSource)
    if (nodes.length < 1) return
    let _ids = nodes.filter(node => node.isNode()).map(node => node.id())
    if (createNode) {
      let randomId = this._createId('cluster_')
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
