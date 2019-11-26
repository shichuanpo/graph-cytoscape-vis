import {merge} from './util'
const legendOption = {
  show: false,
  type: 'scroll', // plain： 普通图例 / scroll： 滚动图例
  orient: 'vertical', // horizontal: 横向图例 ／ vertical: 纵向图例
  /**
   * 图例容器的样式，标准写法 (position不可改，为absolute)
   * **/
  style: {
    cursor: 'pointer',
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
    verticalAlign: 'middle',
    borderWidth: '1px',
    height: '14px',
    lineHeight: '10px',
    padding: '1px',
    boxSizing: 'border-box',
    width: '25px',
    borderRadius: '3px',
    marginRight: '1px',
    textAlign: 'center'
  },
  /**
   * 图例标记选中的样式，为空的时候自动根据分类配置的颜色
   * **/
  activeTagStyle: {},
  /**
   * 图例标记未选中的样式
   * **/
  inactiveTagStyle: {
    backgroundColor: '#ccc'
  },
  /**
   * 图例文字的样式
   * **/
  textStyle: {
    display: 'inline-block',
    verticalAlign: 'middle',
    height: '14px',
    lineHeight: '10px',
    padding: '1px',
    boxSizing: 'border-box',
    fontSize: '12px',
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

/****
 * 支持的基础node样式(cytoscape不支持驼峰)
 */
const nodesBaseStyle = {
  'shape': 'round-rectangle',
  'background-color': 'rgb(5, 161, 140)',
  'background-opacity': 0.8,
  'background-image-opacity': 0.8,
  'background-width': '80%',
  'background-height': '80%',
  'background-repeat': 'no-repeat',
  'z-index-compare': 'manual',
  'border-width': 1,
  'z-index': 2
}
/****
 * 支持的基础edge样式(cytoscape不支持驼峰)
 */
const edgesBaseStyle = {
  width: 1,
  'curve-style': 'bezier',
  'target-arrow-shape': 'vee',
  'target-arrow-color': '#d1dbda',
  'line-color': '#d1dbda',
  'opacity': 0.8,
  'z-index': 1
}
const baseColor = ['#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3']
/**
 * 分类配置：
 *      key: 指定获取数据中的某个字段
 *      colors: 分类配色，可以为Array/Object键值对
 *      images: 分类图片，跟colors用法相同（由于cytoscape原因，支持 data URI 以及 SVG 格式）
 *      data: Array类型，手动分配每一个分类，具体结构如下
 *            [{
 *               name: '分类1',
 *               matching: data => data.label === '分类1', // 目前只支持函数
 *               color, // 支持标准的颜色（"#333333/rgba(0,0,0,0)"），以及函数回调((datas) => { return colors[data[0].label]})
 *                      // 其中datas为分类集合
 *               image // 同上
 *            }]
 * **/
const categoryOption = {
  nodes: {
    key: 'category',
    styles: baseColor.map(color => merge({}, nodesBaseStyle, {
      'background-color': color,
      'border-color': color,
    }))
  },
  edges: {
    key: 'category',
    styles: [JSON.parse(JSON.stringify(edgesBaseStyle))]
  }
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
      selector: 'node',
      style: JSON.parse(JSON.stringify(nodesBaseStyle))
    },
    {
      selector: 'node:selected',
      style: {
        'border-width': 1
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
      style: JSON.parse(JSON.stringify(edgesBaseStyle))
    },
    {
      selector: 'edge[label]',
      style: { 'font-size': '9px', color: '#626867', 'z-index': 1 }
    },
    {
      selector: '.hover',
      style: {
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
        'opacity': 0.3
        // 'z-index': 0
      }
    },
    {
      selector: 'edge.unhover',
      style: {
        width: 1,
        'opacity': 0.3
      }
    },
    {
      selector: '.hide',
      style: {
        display: 'none'
      }
    }
  ],
  minZoom: 0.5,
  maxZoom: 10
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
