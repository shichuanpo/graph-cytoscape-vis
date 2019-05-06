import cytoscape from 'cytoscape'
import fcose from 'cytoscape-fcose'
import euler from 'cytoscape-euler'
import cxtmenu from 'cytoscape-cxtmenu'
import { createChildren } from '../mock/data'
cytoscape.use(cxtmenu)
cytoscape.use(fcose)
cytoscape.use(euler)
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
            style: { label: 'data(label)', 'font-size': '9px', color: '#666', 'z-index': 2 }
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
      },
      option || {}
    )
    this._originalData = null
    this._clusterData = null
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
    ;['mouseover', 'mouseout', 'select'].forEach(item => {
      this._event.push({ type: item, handler: this[`_${item}`] })
      this._cytoscape.on(item, this[`_${item}`])
    })
  }
  _select(e) {
    let element = e.target
    if (element.isNode || element.isEdge) {
      this._cytoscapeCxtmenu && this._cytoscapeCxtmenu.destroy()
      cxtmenuOption.commands = Object.keys(element.data()).map(item => {
        return {
          content: item,
          select: function(ele) {
            let cy = ele.cy()
            let collection = cy.collection(createChildren(ele.data().id, 10))
            let elements = cy.add(collection)
            let num = -1
            let degreeCalc = function(
              num,
              defalutCount = 10,
              count = 10,
              concentric = 0
            ) {
              if (num === 0) {
                return concentric
              } else if (Math.floor(num / (count + 1)) > 0) {
                return degreeCalc(
                  num - count,
                  defalutCount,
                  Math.floor(count + defalutCount / 2),
                  concentric - 1
                )
              } else {
                return concentric - 1
              }
            }
            var layoutOption = {
              name: 'concentric',
              fit: false,
              boundingBox: {
                x1: ele.position().x - 50,
                y1: ele.position().y - 50,
                w: 100,
                h: 100
              },
              concentric: function(node) {
                num++
                return degreeCalc(num)
              },
              levelWidth: function(nodes) {
                return 1
              },
              animateFilter: function(node, i) {
                return false
              }
            }
            let elementsWithOwner = cy.elements(ele).merge(elements)
            var layout = elementsWithOwner.layout(layoutOption)
            layout.run()
          }
        }
      })
      this._cytoscapeCxtmenu = this.cxtmenu(cxtmenuOption)
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
  reset() {
    if (this._clusterData && this._originalData) {
      this._cytoscape.remove(this._clusterData)
      this._cytoscape.add(this._originalData)
    }
  }
  remove() {
    this._cytoscape.remove(this._cytoscape.elements())
  }
  clusterByProps(prop, value) {
    let nodes = this._cytoscape.elements(`node[${prop}="${value}"]`)
    let elseNodes = this._cytoscape.elements(`node[${prop}!="${value}"]`)
    let edgesFrom = nodes.edgesTo(elseNodes)
    let edgesTo = nodes.edgesWith(elseNodes).difference(edgesFrom)
    if (nodes.length < 1) return
    this._originalData = this._originalData || this._cytoscape.collection()
    this._originalData
      .merge(nodes)
      .merge(
        nodes.edgesWith(
          this._cytoscape
            .elements()
            .filter(ele => !~ele.data('id').indexOf('cluster_'))
        )
      )
    this._cytoscape.remove(nodes)
    let randomId = this._createId('cluster_')
    let datass = [
      {
        group: 'nodes',
        data: {
          id: randomId,
          label: `node[${prop}="${value}"]`,
          group: 'cluster'
        },
        position: nodes.reduce((prevVal, ele, i) => {
          if (prevVal) {
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
          } else {
            return {
              x: ele ? ele.position('x') : 0,
              y: ele ? ele.position('y') : 0
            }
          }
        })
      }
    ]
    for (let i = 0; i < edgesTo.length; i++) {
      let dataJson = edgesTo[i].data()
      datass.push({
        group: 'edges',
        data: {
          id: this._createId('edges_'),
          source: dataJson.source,
          target: randomId
        }
      })
    }
    for (let i = 0; i < edgesFrom.length; i++) {
      let dataJson = edgesFrom[i].data()
      datass.push({
        group: 'edges',
        data: {
          id: this._createId('edges_'),
          source: randomId,
          target: dataJson.target
        }
      })
    }
    let dataCollection = this._cytoscape.collection(datass)
    this._clusterData = this._clusterData || this._cytoscape.collection()
    this._clusterData.merge(dataCollection)
    this._cytoscape.add(dataCollection)
  }
}
export default Cytoscape
