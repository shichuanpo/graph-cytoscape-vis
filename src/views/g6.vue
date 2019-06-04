<template lang="pug">
  div.g6
    .graph(ref="g6")
</template>
<script>
import G6 from '@antv/g6';
import * as d3 from "d3";
import {createNodes, createEdges} from '../mock/data.js';
export default {
  name: 'g6',
  data: function () {
    return {
      progress: 0,
      grapha: null
    };
  },
  methods: {},
  mounted: function () {
    let data = {
      nodes: createNodes(200)
    }
    data.edges = createEdges(data.nodes, 200)
    data.nodes = data.nodes.map(dat => dat.data)
    data.edges = data.edges.map(dat => dat.data)
    var graph = new G6.Graph({
        container: this.$refs.g6,
        width: window.innerWidth,
        height: window.innerHeight,
        autoPaint: false,
        modes: {
          default: ['drag-canvas', {
            type: 'tooltip',
            formatText: function formatText(model) {
              return model.name;
            }
        }, {
            type: 'edge-tooltip',
            formatText: function formatText(model, e) {
              var edge = e.item;
              return '来源：' + edge.getSource().getModel().name + '<br/>去向：' + edge.getTarget().getModel().name;
            }
        }]
        },
        defaultNode: {
          size: [10, 10],
          color: 'steelblue'
        },
        defaultEdge: {
          size: 1
        },
        nodeStyle: {
          default: {
            lineWidth: 2,
            fill: 'steelblue'
          },
          highlight: {
            opacity: 1
          },
          dark: {
            opacity: 0.2
          }
        },
        edgeStyle: {
          default: {
            stroke: '#e2e2e2',
            lineAppendWidth: 2
          },
          highlight: {
            stroke: '#999'
          }
        }
      });

      function clearAllStats() {
        graph.setAutoPaint(false);
        graph.getNodes().forEach(function(node) {
          graph.clearItemStates(node);
        });
        graph.getEdges().forEach(function(edge) {
          graph.clearItemStates(edge);
        });
        graph.paint();
        graph.setAutoPaint(true);
      }
      graph.on('node:mouseenter', function(e) {
        var item = e.item;
        graph.setAutoPaint(false);
        graph.getNodes().forEach(function(node) {
          graph.clearItemStates(node);
          graph.setItemState(node, 'dark', true);
        });
        graph.setItemState(item, 'dark', false);
        graph.setItemState(item, 'highlight', true);
        graph.getEdges().forEach(function(edge) {
          if (edge.getSource() === item) {
            graph.setItemState(edge.getTarget(), 'dark', false);
            graph.setItemState(edge.getTarget(), 'highlight', true);
            graph.setItemState(edge, 'highlight', true);
            edge.toFront();
          } else if (edge.getTarget() === item) {
            graph.setItemState(edge.getSource(), 'dark', false);
            graph.setItemState(edge.getSource(), 'highlight', true);
            graph.setItemState(edge, 'highlight', true);
            edge.toFront();
          } else {
            graph.setItemState(edge, 'highlight', false);
          }
        });
        graph.paint();
        graph.setAutoPaint(true);
      });
      graph.on('node:mouseleave', clearAllStats);
      graph.on('canvas:click', clearAllStats);
      console.log('data = ', data, d3)
      graph.data({
        nodes: data.nodes,
        edges: data.edges.map(function(edge, i) {
          edge.id = 'edge' + i;
          return Object.assign({}, edge);
        })
      });
      var simulation = d3.forceSimulation().force("link", d3.forceLink().id(function(d) {
        return d.id;
      }).strength(0.5)).force("charge", d3.forceManyBody()).force("center", d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2));
      simulation.nodes(data.nodes).on("tick", ticked);
      simulation.force("link").links(data.edges);

      graph.render();

      function ticked() {
        graph.refreshPositions();
        graph.paint();
      }
    }
  }
</script>
<style lang="less" scoped>
.g6 {
  text-align: left;
  position: relative;
  width: 100%;
  height: 100vh;
  z-index: 999;
  .graph {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
  }
  .loadingBar {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    .progress {
      width: 60%;
    }
  }
}
</style>
