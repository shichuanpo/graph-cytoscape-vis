<template lang="pug">
   cytoscape.cytoscape(ref="cytoscape", :options="options", :data="graphData", @init="cytoscapeInit", @mouseover="createTippy")
   
</template>
<script>
import data from '../mock/data';
import { createChildren } from '../mock/data';
import cytoscape from '../cytoscape/index.vue'
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
  components: { cytoscape },
  data () {
    return {
      $contextMenus: null,
      tooltip: {},
      options: {
        legend: {
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
          }
        },
        cytoscape: {
    layout: {
      name: 'cola',
            animate: true, // whether to show the layout as it's running
  refresh: 5, // number of ticks per frame; higher is faster but more jerky
  maxSimulationTime: 4000, // max length in ms to run the layout
  ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
  fit: false, // on every layout reposition of nodes, fit the viewport
  padding: 30, // padding around the simulation
  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node

  // layout event callbacks
  ready: function(){}, // on layoutready
  stop: function(){}, // on layoutstop

  // positioning options
  randomize: false, // use random node positions at beginning of layout
  avoidOverlap: true, // if true, prevents overlap of node bounding boxes
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
  infinite: true
    }},
        contextMenus: {
          menuItems: [{
            id: 'nextlevel',
            content: `查询下一级`,
            selector: 'node',
            disabled: true,
            show: true,
            hasTrailingDivider: true
          }, {
            id: 'allidtype',
            content: `全部ID类型`,
            selector: 'node',
            onClickFunction: (e) => {
              this.addNode(e)
            },
            disabled: false,
            show: true,
            hasTrailingDivider: false
          }, {
            id: 'mac',
            content: `只查mac`,
            selector: 'node',
            onClickFunction: (e) => {
              this.addNode(e, { entities: ['mac'] })
            },
            disabled: false,
            show: true,
            hasTrailingDivider: false
          }, {
            id: 'imei',
            content: `只查imei`,
            selector: 'node',
            onClickFunction: (e) => {
              this.addNode(e, { entities: ['imei'] })
            },
            disabled: false,
            show: true,
            hasTrailingDivider: false
          }, {
            id: 'imsi',
            content: `只查imsi`,
            selector: 'node',
            onClickFunction: (e) => {
              this.addNode(e, { entities: ['imsi'] })
            },
            disabled: false,
            show: true,
            hasTrailingDivider: false
          }, {
            id: 'pn',
            content: `只查pn`,
            selector: 'node',
            onClickFunction: (e) => {
              this.addNode(e, { entities: ['pnmd5'] })
            },
            disabled: false,
            show: true,
            hasTrailingDivider: false
          }, {
            id: 'cid',
            content: `只查cid`,
            selector: 'node',
            onClickFunction: (e) => {
              this.addNode(e, { entities: ['cid'] })
            },
            disabled: false,
            show: true
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
          key: 'group',
          images: {
            hospital,
            clothes,
            computer,
            person
          },
        }
      },
      graphData: [],
      $cy: null
    };
  },
  methods: {
    cytoscapeInit (cytoscape) {
      this.$cy = cytoscape
      this.$contextMenus = this.$cy.contextMenus(this.options.contextMenus)
      // setTimeout(() => {
      //   this.$cy.filterByLegend()
      // }, 5000)
    },
    addNode (e) {
      let _children = createChildren(e.target.id(), Math.floor(Math.random() * 10 + 5))
      _children.forEach(c => {
        c.data.parent = e.target.id() + 'xx'
      })
      this.$cy.add(_children)
      let layout = this.$cy.layout(this.options.cytoscape.layout)
      layout.run()
      // this.$cy.startBatch()
      // this.$cy.add(_children)
      // let layout = this.$cy.layout(this.options.cytoscape.layout)
      // layout.run()
      // this.$cy.filterByLegend(true)
      // this.$cy.endBatch()
    },
    createTippy (e) {
      if (!this.$cy || !this.options.tooltip) {
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
  },
  beforeDestroy () {
    // this.$contextMenus && this.$contextMenus.destroy()
    // this.$cy && this.$cy.off('cxttapstart', this.createContextMenu)
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
</style>

