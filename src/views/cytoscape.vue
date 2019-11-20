<template lang="pug">
  cytoscape.cytoscape(ref="cytoscape", :options="options.cytoscape", :category="options.category", :data="graphData", @init="cytoscapeInit", @mouseover="createTippy")
    cylegend(:data="graphData", v-model="legendNodeModel", :options="options.nodeLegend", :category="options.category.nodes")
    cylegend(:data="graphData", v-model="legendEdgeModel", type="edges", :options="options.edgeLegend", :category="options.category.edges")
    //- .navigator
</template>
<script>
import data from '../mock/data';
import { createChildren } from '../mock/data';
import cytoscape from '../cytoscape/cytoscape.vue'
import cylegend from '../cytoscape/legend.vue'
import hospital from '../assets/svg/hospital.svg'
import person from '../assets/svg/person.svg'
import computer from '../assets/svg/computer.svg'
import clothes from '../assets/svg/clothes.svg'
import tippy from 'tippy.js'
import 'tippy.js/themes/light.css'
import 'tippy.js/themes/light-border.css'
import 'tippy.js/themes/google.css'
import 'tippy.js/themes/translucent.css'
export default {
  name: 'cytoscapePage',
  components: { cytoscape, cylegend },
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
          style: {
            padding: '10px',
            top: 0,
            left: 0
          },
        },
        edgeLegend: {
          show: true,
          style: {
            padding: '10px',
            top: 0,
            right: 0
          },
          tagStyle: {
            borderWidth: 0,
            borderTopWidth: '2px',
            height: '0px',
            'line-height': '10px',
            // padding: '1px',
            // width: '25px',
          },
          inactiveTagStyle: {
            borderColor: '#ccc',
            background: 'none'
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
        cytoscape: {
    layout: {
      name: 'cola',
            animate: true, // whether to show the layout as it's running
  refresh: 10, // number of ticks per frame; higher is faster but more jerky
  maxSimulationTime: 2000, // max length in ms to run the layout
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
  avoidOverlap: false, // if true, prevents overlap of node bounding boxes
  handleDisconnected: true, // if true, avoids disconnected components from overlapping
  convergenceThreshold: 0.01, // when the alpha value (system energy) falls below this value, the layout stops
  nodeSpacing: function( node ){ return node.degree(); }, // extra spacing around nodes
  flow: undefined, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
  alignment: undefined, // relative alignment constraints on nodes, e.g. function( node ){ return { x: 0, y: 1 } }
  gapInequalities: undefined, // list of inequality constraints for the gap between the nodes, e.g. [{"axis":"y", "left":node1, "right":node2, "gap":25}]

  // different methods of specifying edge length
  // each can be a constant numerical value or a function like `function( edge ){ return 2; }`
  edgeLength: undefined, // sets edge length directly in simulation
  edgeSymDiffLength: undefined, // symmetric diff edge length in simulation
  edgeJaccardLength: undefined, // jaccard edge length in simulation

  // iterations of cola algorithm; uses default values on undefined
  unconstrIter: undefined, // unconstrained initial layout iterations
  userConstIter: undefined, // initial layout iterations with user-specified constraints
  allConstIter: undefined, // initial layout iterations with all constraints including non-overlap

  // infinite layout options
  infinite: false
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
              return `${target.data('label')}`
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
                'background-image': hospital
              },
              clothes: {
                'background-image': clothes
              },
              computer: {
                'background-image': computer
              },
              person: {
                'background-image': person
              }
            },
          },
          edges: {
            data: [{
              name: 'love',
              matching: data => data.group === 'love',
              style: {
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
      let _categoryNames = Object.keys(legendModel).filter(key => legendModel[key])
      if (type === 'nodes') {
        this.legendNodeFilterId && _cy.resetFilter(this.legendNodeFilterId)
        this.legendNodeFilterId = _cy.filterByFunction(ele => {
          return ele.isEdge() || (ele.isNode() && !_categoryNames.includes(ele.data('group')))
        })
      } else {
        this.legendEdgeFilterId && _cy.resetFilter(this.legendEdgeFilterId)
        if (_categoryNames.length) {
          this.legendEdgeFilterId = _cy.filterByFunction((ele, allEle) => {
            let _filterEdges = allEle.filter(ele => ele.isEdge() && !_categoryNames.includes(ele.data('group')))
            return _filterEdges.contains(ele) || _filterEdges.some(_edge => _edge.source() === ele || _edge.target() === ele)
          })
        }
      }
    },
    cytoscapeInit (cytoscape) {
      cytoscape.contextMenus(this.options.contextMenus)
      // var defaults = {
      //     container: '.navigator' // can be a HTML or jQuery element or jQuery selector
      //   , viewLiveFramerate: 0 // set false to update graph pan only on drag end; set 0 to do it instantly; set a number (frames per second) to update not more than N times per second
      //   , thumbnailEventFramerate: 30 // max thumbnail's updates per second triggered by graph updates
      //   , thumbnailLiveFramerate: false // max thumbnail's updates per second. Set false to disable
      //   , dblClickDelay: 200 // milliseconds
      //   , removeCustomContainer: true // destroy the container specified by user on plugin destroy
      //   , rerenderDelay: 100 // ms to throttle rerender updates to the panzoom for performance
      // };
      // var nav = cytoscape.navigator( defaults ); // get navigator instance, nav
    },
    addNode (e) {
      e.target.lock()
      let _targetId = e.target.id()
      let _children = createChildren(_targetId, Math.floor(Math.random() * 5 + 2))
      _children.forEach(c => {
        c.data.parent = _targetId + 'xx'
      })
      this.graphData = this.graphData.concat(_children)
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
    },
  },
  mounted () {
    this.graphData = data
  }
};
</script>
<style lang="less" scoped>
.cytoscape {
  text-align: left;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 999;
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

