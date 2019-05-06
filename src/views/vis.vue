<template lang="pug">
  div.vis
    .graph(ref="vis")
    // .loadingBar(v-show="progress<100")
    //   el-progress.progress(:text-inside="true", :stroke-width="18", :percentage="progress")
</template>
<script>
import visNet from '../vis';
import vis from 'vis'
import data from '../mock/data.js';
var nodes = new vis.DataSet(data.filter(item => item.group === 'nodes').map(item => {
  return item.data
}))

// create some edges
var edges = new vis.DataSet(data.filter(item => item.group === 'edges').map(item => {
  item.data.from = item.data.source
  item.data.to = item.data.target
  return item.data
}))
var visdata = {
  nodes,
  edges
}
export default {
  name: 'vis',
  data: function () {
    return {
      progress: 0,
      grapha: null
    };
  },
  methods: {},
  mounted: function () {
    console.log('visdata = ', visdata)
    const grapha = new visNet(this.$refs.vis, visdata, {
      edges: {
        shadow: true,//连接线阴影配置
        smooth: true,//是否显示方向箭头
        arrows: { to: true }//箭头指向from节点
      },
      nodes: {
        shape: 'dot',
        size: 30,
        font: {
          size: 10
        },
        borderWidth: 2,
        shadow: true
      }
    });
    // grapha.setData(data);
    // var clusterOptionsByData = {
    //   joinCondition: function (childNodeOptions) {
    //     return childNodeOptions.group > 1;
    //   },
    //   clusterNodeProperties: { id: 'groupCluster', borderWidth: 3, shape: 'database' }
    // };
    // var clusterOptionsByData1 = {
    //   joinCondition: function (childNodeOptions) {
    //     return childNodeOptions.group === 1;
    //   },
    //   clusterNodeProperties: { id: 'groupCluster1', borderWidth: 1, shape: 'circle', title: '你好', label: '你不好' }
    // };
    // this.graph.cluster(clusterOptionsByData);
    // this.graph.cluster(clusterOptionsByData1);
  }
};
</script>
<style lang="less" scoped>
.vis {
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
