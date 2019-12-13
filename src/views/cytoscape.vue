<template lang="pug">
.cytoscape
  vue-cytoscape.cytoscape(ref="cytoscape", :options="options.cytoscape", :category="options.category", :data="graphData", @init="cytoscapeInit", @mouseover="createTippy")
  vue-cytoscape-legend.legend(:data="graphData", v-model="legendNodeModel", :options="options.nodeLegend", :category="options.category.nodes")
  vue-cytoscape-legend.legend(:data="graphData", v-model="legendEdgeModel", type="edges", :options="options.edgeLegend", :category="options.category.edges")
    //- .navigator
</template>

<script>
import data from '../mock/data';
import { createChildren } from '../mock/data';
import hospital from '../assets/svg/hospital.svg'
import person from '../assets/svg/person.svg'
import computer from '../assets/svg/computer.svg'
import clothes from '../assets/svg/clothes.svg'
import tippy from 'tippy.js'
import 'tippy.js/themes/light.css'
import 'tippy.js/themes/light-border.css'
import 'tippy.js/themes/google.css'
import 'tippy.js/themes/translucent.css'
import cytoscape from 'cytoscape'
export default {
  name: 'cytoscapePage',
  data () {
    return {
      tooltip: {},
      options: {
        nodeLegend: {
          show: true,
          formatter: str => {
            let translate = {
              hospital: '医院',
              clothes: '衣服',
              computer: '电脑',
              person: '个人'
            }
            Object.keys(translate).forEach(key => {
              str = str.replace(key, translate[key])
            })
            return str
          },
          orient: 'vertical',
          style: {
            padding: '10px',
            top: 0,
            left: 0
          },
          tagStyle: {
            borderWidth: '1px',
            borderStyle: 'solid'
          },
          inactiveTagStyle: {
            borderColor: '#ccc'
          }
        },
        edgeLegend: {
          show: true,
          style: {
            padding: '10px',
            top: 0,
            right: 0
          },
          tagStyle: {
            borderRadius: 0,
            borderWidth: 0,
            borderTopWidth: '2px',
            height: '0px',
            'line-height': '10px'
          },
          inactiveTagStyle: {
            borderColor: '#ccc',
            backgroundColor: 'none'
          },
          formatter: str => {
            let translate = {
              has: '拥有',
              love: '喜欢',
              goto: '去过'
            }
            Object.keys(translate).forEach(key => {
              str = str.replace(key, translate[key])
            })
            return str
          }
        },
/****
 * 支持的基础edge样式(cytoscape不支持驼峰)
 */
        cytoscape: {
          style: [{
              selector: 'node',
              style: {
                'shape': 'round-rectangle'
              }
            }, {
              selector: 'node:parent',
              style: {
                'background-opacity': 0,
                'border-width': 0
              }
            }, {
              selector: 'edge',
              style: {
                width: 1,
                'curve-style': 'bezier',
                'target-arrow-shape': 'vee'
              }
            }],
          layout: {
            name: 'cola',
            animate: true, // whether to show the layout as it's running
            refresh: 10, // number of ticks per frame; higher is faster but more jerky
            maxSimulationTime: 3000, // max length in ms to run the layout
            ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
            fit: false, // on every layout reposition of nodes, fit the viewport
            padding: 30, // padding around the simulation
            boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
            nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node

            // layout event callbacks
            ready: function(e){
              // let _hasLocked = 0
              // while (_hasLocked < 3) {
              //   _hasLocked++
              //   let _maxDegreeNode = e.cy.nodes().filter(node => !node.locked()).max(ele => ele.degree())
              //   _maxDegreeNode.ele.lock()
              // }
            }, // on layoutready
            stop: function(e){
              e.cy.nodes().unlock()
            }, // on layoutstop

            // positioning options
            randomize: false, // use random node positions at beginning of layout
            avoidOverlap: true, // if true, prevents overlap of node bounding boxes
            handleDisconnected: true, // if true, avoids disconnected components from overlapping
            convergenceThreshold: 0.01, // when the alpha value (system energy) falls below this value, the layout stops
            // nodeSpacing: function( node ){ return node.degree(); }, // extra spacing around nodes
            flow: undefined, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
            alignment: undefined, // relative alignment constraints on nodes, e.g. function( node ){ return { x: 0, y: 1 } }
            gapInequalities: undefined, // list of inequality constraints for the gap between the nodes, e.g. [{"axis":"y", "left":node1, "right":node2, "gap":25}]

            // different methods of specifying edge length
            // each can be a constant numerical value or a function like `function( edge ){ return 2; }`
            edgeLength: function(edge){
              let degrees = edge.connectedNodes().map(node => node.degree())
              return 60 + (Math.min(degrees[0], degrees[1]) - 1) * 60 * 0.3 + (Math.max(degrees[0], degrees[1]) - 1) * 10 * 0.3
            }, // sets edge length directly in simulation
            edgeSymDiffLength: undefined, // symmetric diff edge length in simulation
            edgeJaccardLength: undefined, // jaccard edge length in simulation

            // iterations of cola algorithm; uses default values on undefined
            unconstrIter: undefined, // unconstrained initial layout iterations
            userConstIter: undefined, // initial layout iterations with user-specified constraints
            allConstIter: undefined, // initial layout iterations with all constraints including non-overlap

            // infinite layout options
            infinite: true
          }},
        contextMenus: {
          menuItems: [{
            id: 'nextlevel',
            content: `查询下一级`,
            selector: 'node',
            onClickFunction: (e) => {
              this.addNode(e)
            },
            disabled: false,
            show: true,
            hasTrailingDivider: false
          }]
        },
        tooltip: {
          trigger: 'mouseenter',
          content: function (e) {
            let target = e.target
            if (!target || target === e.cy) return
            if (target.isEdge()) {
              return `<div style="text-align: left"><div>名称： ${target.data('name')}</div><div>时间： ${target.data('time')}</div></div>`
            } else if (target.isNode()) {
              return `<div style="text-align: left"><div>id： ${target.data('id')}</div><div>position： ${target.position('x')}, ${target.position('y')}</div><div>renderedPosition： ${target.renderedPosition('x')}, ${target.renderedPosition('y')}</div><div>虚拟位置： ${target.data('x')}, ${target.data('y')}</div></div>`
            }
          },
          animation: 'fade',
          theme: 'light-border'
        },
        category: {
          nodes: {
            key: 'group',
            styles: {
              hospital: {
                'background-image': hospital,
                'background-width': '80%',
                'background-height': '80%',
                'background-repeat': 'no-repeat'
              },
              clothes: {
                'background-image': clothes,
                'background-width': '80%',
                'background-height': '80%',
                'background-repeat': 'no-repeat'
              },
              computer: {
                'background-image': computer,
                'background-width': '80%',
                'background-height': '80%',
                'background-repeat': 'no-repeat'
              },
              person: {
                'background-image': person,
                'background-width': '80%',
                'background-height': '80%',
                'background-repeat': 'no-repeat'
              }
            },
          },
          edges: [{
            name: 'love',
            matching: data => data.group === 'love',
            style: {
              'source-arrow-shape': 'vee',
              'line-style': 'dashed',
              'line-color': '#61a0a8',
              'width': 1
            }
          }, {
            name: 'goto',
            matching: data => data.group === 'goto',
            style: {
              'line-style': 'dashed',
              'line-color': '#2f4554',
              'width': 1
            }
          }, {
            name: 'has',
            matching: data => data.group === 'has',
            style: {
              'line-style': 'dashed',
              'line-color': '#c23531',
              'width': 1
            }
          }]
        }
      },
      graphData: [],
      legendNodeFilterId: '',
      legendEdgeFilterId: '',
      legendNodeModel: {},
      legendEdgeModel: {}
    };
  },
  watch: {
    legendNodeModel: {
      handler (newVal) {
        this.legendChange(newVal, 'nodes')
      },
      deep: true
    },
    legendEdgeModel: {
      handler (newVal) {
        this.legendChange(newVal, 'edges')
      },
      deep: true
    }
  },
  methods: {
    legendChange (legendModel, type) {
      let _cy = this.$refs.cytoscape
      let _categoryNames = Object.keys(legendModel).filter(key => !legendModel[key])
      if (type === 'nodes') {
        if (_categoryNames.length) {
          this.legendNodeFilterId = _cy.filterByFunction(ele => {
            return ele.isEdge() || (ele.isNode() && !_categoryNames.includes(ele.data('group')))
          }, this.legendNodeFilterId)
        } else {
          this.legendNodeFilterId && _cy.resetFilter(this.legendNodeFilterId)
        }
      } else {
        if (_categoryNames.length) {
          this.legendEdgeFilterId = _cy.filterByFunction((ele, allEle) => {
            let _filterEdges = allEle.filter(ele => ele.isEdge() && !_categoryNames.includes(ele.data('group')))
            return _filterEdges.contains(ele) || _filterEdges.some(_edge => _edge.source() === ele || _edge.target() === ele)
          }, this.legendEdgeFilterId, true)
        } else {
          this.legendEdgeFilterId && _cy.resetFilter(this.legendEdgeFilterId, true)
        }
      }
    },
    cytoscapeInit (cy) {
      // cy.contextMenus(this.options.contextMenus)
    },
    addNode (e) {
      // e.target.lock()
      let _targetId = e.target.id()
      let _children = createChildren(_targetId, 2)
      // _children.forEach(c => {
      //   c.data.parent = _targetId
      // })
      this.graphData = this.graphData.concat(_children)
      console.log('this.graphData = ', this.graphData)
      // console.log('e.target.data = ', _datas)
    },
    createTippy (e) {
      if (!this.options.tooltip) {
        return
      }
      let element = e.target
      if (element === e.cy) return
      let content = Object.prototype.toString.call(this.options.tooltip.content) === '[object Function]' ? this.options.tooltip.content(e) : this.options.tooltip.content
      let tippyOpt = { content }
      Object.keys(this.options.tooltip).forEach(key => {
        if (key !== 'content' && key !== 'selector') {
          tippyOpt[key] = this.options.tooltip[key]
        }
      })
      if (this.tooltip[element.id()]) {
        this.tooltip[element.id()].setContent(content)
      } else {
        this.tooltip[element.id()] = tippy(element.popperRef(), tippyOpt)
      }
      setTimeout(() => {
        tippy.hideAll()
        this.tooltip[element.id()].show()
      }, 10)
    }
  },
  mounted () {
    this.graphData = data
  }
}
</script>
<style lang="less" scoped>
.cytoscape {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 1;
}
.legend{
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
}
// .navigator{
//   position: absolute;
//   width: 100px;
//   height: 100px;
//   right: 0;
//   bottom: 0;
//   border: 1px solid #ccc;
// }
</style>

