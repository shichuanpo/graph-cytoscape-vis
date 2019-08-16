# CYTOSCAPE
## Component Name Here

> 本组件为基于cytoscape的关系图区块。

## Function

功能点：
* 基础的关系图，包含布局样式等
* 图例，筛选功能
* 右键，tooltip等交互操作

## Usage

```html
<gt-cytoscape />
```

## DataSource
```javascript
getInfo () {}
// 返回的参数： 
[{
  data: { ... },
  group: 'nodes' // nodes / edges
}]
```
## Props
```javascript
option: {
  legend: {
    show: false,
    type: 'plain', // plain： 普通图例 / scroll： 滚动图例
    orient: 'horizontal', // horizontal: 横向图例 ／ vertical: 纵向图例
    /**
     * 图例容器的样式，标准写法 (position不可改，为absolute)
     * **/
    style: {
      padding: '10px',
      top: 0,
      left: 0
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
  },
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
  category: {
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
  },
  /**
   * 右键配置，封装了cytoscape-context-menus插件，
   * 其中menuItems回调中参数为cytoscape的事件对象或者数组
   * **/
  contextMenus: {
    menuItems: e => {
      let target = e.target
      if (target.data) {
        return Object.keys(target.data()).map(key => {
          return {
            id: key,
            content: `${key}: ${target.data(key)}`,
            selector: 'node, edge',
            onClickFunction: function () {
              console.log('remove target');
            },
            disabled: false,
            show: true,
            hasTrailingDivider: true,
            coreAsWell: false
          }
        })
      } else {
        return []
      }
    }
  },
  /**
   * tooltip配置，封装了cytoscape-popper插件，
   * 其中selector、trigger、content为改造后的参数
   * selector为需要监听的对象，trigger为事件类型，目前支持 mouseover/click(基于cytoscape)
   * content回调中参数为cytoscape的事件对象或者字符串
   * **/
  tooltip: {
    selector: 'node, edge',
    trigger: 'mouseover',
    content: e => {
      let target = e.target
      return target.data ? `${target.data('label')}` : 'cytoscape'
    },
    animation: 'fade',
    theme: 'light-border'
  }
  /**
   * cytoscape配置： 完全参照cytoscape配置，详见cytoscape文档: http://js.cytoscape.org/#introduction
   * **/
  cytoscape: {
    layout: {
      name: 'cose',
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
  }
}
```
## Methods

|方法名称|方法说明|参数|用法|
|:----|:----|:----|:----|
|getData|根据配置的ds, 重新获取数据|-|ref.getData()|
|filterEdgesByFunction|edges过滤|过滤规则的函数|ref.filterEdgesByFunction(element => element.data('id') === 123) // 其中element为cytoscape中的类，具体请查阅cytoscape官方文档|
|filterNodesByFunction|nodes过滤|过滤规则的函数|ref.filterNodesByFunction(element => element.data('id') === 123)|
|getCytoscape|获取cytoscape实例|-|ref.getCytoscape()|

## Events

|事件回调|参数|说明|
|:----|:----|:----|
|init|cytoscape实例|初始化加载完毕的回调|

## Slot

支持哪些插槽（如果有的话）
