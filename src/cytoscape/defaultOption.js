const legendOption = {
  show: false,
  type: 'scroll', // plain： 普通图例 / scroll： 滚动图例
  orient: 'vertical', // horizontal: 横向图例 ／ vertical: 纵向图例
  /**
   * 图例容器的样式，标准写法 (position不可改，为absolute)
   * **/
  style: {
    padding: '10px'
  },
  itemGap: 10,
  animation: true, // 翻页是否需要动画
  animationDurationUpdate: 0.8, // 翻页动画时长，单位s
  /**
   * 图例标记的样式
   * **/
  tagStyle: {
    display: 'inline-block',
    'vertical-align': 'top',
    border: '1px transparent solid',
    height: '14px',
    'line-height': '10px',
    padding: '1px',
    'box-sizing': 'border-box',
    width: '25px',
    'border-radius': '3px',
    'margin-right': '1px',
    'text-align': 'center'
  },
  /**
   * 图例标记选中的样式，为空的时候自动根据分类配置的颜色
   * **/
  activeTagStyle: {},
  /**
   * 图例标记未选中的样式
   * **/
  inactiveTagStyle: {
    background: '#ccc',
    border: '1px transparent solid'
  },
  /**
   * 图例文字的样式
   * **/
  textStyle: {
    display: 'inline-block',
    'vertical-align': 'top',
    border: '1px transparent solid',
    height: '14px',
    'line-height': '10px',
    padding: '1px',
    'box-sizing': 'border-box',
    'font-size': '12px',
    color: '#333'
  },
  /**
   * 图例文字选中的样式，为空的时候自动根据分类配置的颜色
   * **/
  activeTextStyle: {},
  /**
   * 图例文字未选中的样式
   * **/
  inactiveTextStyle: {
    color: '#ccc'
  },
  formatter: string => string // 格式转换，翻译
}
const categoryOption = {
  key: 'category',
  colors: [
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
}
  /**
   * cytoscape配置： 完全参照cytoscape配置，详见cytoscape文档: http://js.cytoscape.org/#introduction
   * **/
const cytoscapeOption = {
  layout: {
    name: 'random',
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
        'border-color': 'rgb(5, 161, 140)',
        'border-width': 2
      }
    },
    {
      selector: 'node',
      style: {
        'background-color': 'rgb(5, 161, 140)',
        'background-opacity': 0.6,
        'background-image-opacity': 0.6,
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
        'background-image-opacity': 1,
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
        'background-image-opacity': 0.3,
        // 'z-index': 0
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
}
export default {
  legendOption,
  categoryOption,
  cytoscapeOption
}
export {
  legendOption,
  categoryOption,
  cytoscapeOption
}
