# net-graph

## Demo

[关系图实例](https://shichuanpo.github.io/graph-cytoscape-vis/dist/#/cytoscape)

## components

### vue-cytoscape
#### props
参数 | 说明 | 类型 | 可选值 | 默认值
:-: | :-: | :-: | :-: | :-:
options | cytoscape原生配置，包括布局， 样式等等；详见cytoscape文档: http://js.cytoscape.org/#introduction | Object | - | {} | 
data | cytoscape的图数据 | Array | - | [] |
category | 分类配置，详见下表 | Object | - | {} |

##### options
```javascript
options = {
  layout: {
    name: 'cose',
    randomize: true,
    animate: false
  },
  style: [
    {
      selector: 'node',
      style: {
        'background-color': 'rgb(5, 161, 140)',
        'background-opacity': 0.6,
        'background-image-opacity': 0.6,
        'z-index-compare': 'manual',
        'z-index': 2
      }
    }
  ],
  minZoom: 0.5,
  maxZoom: 10
}
```
##### data
```javascript
data = [{
  group: 'nodes',
  data: {
    id: 'XXX'
  }
}, 
  group: 'nodes',
  data: {
    id: 'YYY'
  }
}, {
  group: 'edges',
  data: {
    id: 'XXX-YYY',
    source: 'XXX',
    target: 'YYY'
  }
}]
```
#### category
<table>
    <tr>
      <th></th>
	  <th>类型</th>
      <th>参数</th>
      <th>说明</th>
	  <th>类型</th>
	  <th>可选值</th>
	  <th>默认值</th>
  </tr>
  <tr>
      <td rowspan='6'>nodes</td>
      <td rowspan='4'>Array</td>
      <td>name</td>
	  <td>指定分类项名称</td>
	  <td>String</td>
	  <td>-</td>
	  <td>-</td>
      
  </tr>
  <tr>
      <td>matching</td>
	  <td>分类项匹配规则</td>
	  <td>Function</td>
	  <td>-</td>
	  <td>-</td>
  </tr>
  <tr>
      <td>style</td>
	  <td>分类配色，具体参考cytoscape node颜色属性</td>
	  <td>Object</td>
	  <td>-</td>
	  <td>-</td>
  </tr>
  <tr>
      <td>formatter</td>
	  <td>翻译</td>
	  <td>Function</td>
	  <td>-</td>
	  <td>-</td>
  </tr>
  <tr>
  <td rowspan='2'>Object</td>
      <td>key</td>
	  <td>指定获取数据中的某个字段</td>
	  <td>String</td>
	  <td>-</td>
	  <td>-</td>
  </tr>
  <tr>
	  <td>styles</td>
	  <td>为上述style参数的数组或者key的键值对</td>
	  <td>Object/Array</td>
	  <td>-</td>
	  <td>-</td>
  </tr>
  <tr>
      <td rowspan='6'>edges</td>
      <td rowspan='4'>Array</td>
      <td>name</td>
	  <td>指定分类项名称</td>
	  <td>String</td>
	  <td>-</td>
	  <td>-</td>
      
  </tr>
  <tr>
      <td>matching</td>
	  <td>分类项匹配规则</td>
	  <td>Function</td>
	  <td>-</td>
	  <td>-</td>
  </tr>
  <tr>
      <td>style</td>
	  <td>分类配色，具体参考cytoscape edge颜色属性</td>
	  <td>Object</td>
	  <td>-</td>
	  <td>-</td>
  </tr>
  <tr>
      <td>formatter</td>
	  <td>翻译</td>
	  <td>Function</td>
	  <td>-</td>
	  <td>-</td>
  </tr>
  <tr>
  <td rowspan='2'>Object</td>
      <td>key</td>
	  <td>指定获取数据中的某个字段</td>
	  <td>String</td>
	  <td>-</td>
	  <td>-</td>
  </tr>
  <tr>
	  <td>styles</td>
	  <td>为上述style参数的数组或者key的键值对</td>
	  <td>Object/Array</td>
	  <td>-</td>
	  <td>-</td>
  </tr>
</table>

```javascript
/**
 * 分类配置：两种写法
 * 写法一：
 * {
 *   key: 指定获取数据中的某个字段
 *   styles: 分类样式，可以为Array/Object键值对
 * }
 * 写法二：
 * [{
 *    name: '分类1',
 *    matching: data => data.label === '分类1', // 目前只支持函数
 *    style, // 具体参考cytoscape官网样式规范
 *    formatter: name => name // 格式转换，翻译
 * }]
 * **/
category = {
    nodes: [{
      name: 'category1',
      matching: data => data.label === 'category1', // 目前只支持函数
      style: {
        'background-color': '#c23531'
      },
      formatter: name => '分类1'
    }],
    edges: {
      key: 'category',
      styles: {
        category1: {
          'background-color': '#c23531'
        },
        category1: {
          'background-color': '#2f4554'
        }
      }
    }
  }
```
#### methods
<table>
    <tr>
      <th>方法名</th>
      <th>参数</th>
      <th>说明</th>
      <th>返回</th>
    </tr>
    <tr>
      <td rowspan="3">filterByFunction</td>
      <td>Function (elements) { return elements }</td>
      <td>回调函数返回过滤后的元素集合</td>
      <td>filterid</td>
    </tr>
    <tr>
      <td>filterid</td>
      <td>用以重置已有的filterid</td>
      <td>-</td>
    </tr>
    <tr>
      <td>reLayout</td>
      <td>过滤集合后是否需要重新布局，默认false</td>
      <td>-</td>
    </tr>
    <tr>
      <td rowspan="2">resetFilter</td>
      <td>filterid</td>
      <td>重置filterid对应的过滤</td>
      <td>-</td>
    </tr>
    <tr>
      <td>reLayout</td>
      <td>过滤集合后是否需要重新布局，默认false</td>
      <td>-</td>
    </tr>
</table>

#### events
事件名 | 说明 | 参数
:-: | :-: | :-:
update | cytoscape实例数据更新（包括 数据重置，添加，删除，过滤等等） | cytoscape事件

其他详见cytoscape文档: http://js.cytoscape.org/#introduction

### vue-legend
#### props
参数 | 说明 | 类型 | 可选值 | 默认值
:-: | :-: | :-: | :-: | :-:
value / v-model | 绑定值 | Object | - | -|
data | 图例数据 | Array | - | []|
options | 图例配置 | Object | - | {}|

##### options
```javascript
options = {
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
  activeTagStyle: {
    backgroundColor: '#c23531'
  },
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
```
##### data
```javascript
data = ['分类1', '分类2']
data = [{
  name: '分类1', tagStyle, activeTagStyle, inactiveTagStyle, textStyle, activeTextStyle, inactiveTextStyle, formatter
}, {
  name: '分类2', tagStyle, activeTagStyle, inactiveTagStyle, textStyle, activeTextStyle, inactiveTextStyle, formatter
}]
```
#### events
事件名 | 说明 | 参数
:-: | :-: | :-:
change | 图例变化 | legendMode

### vue-cytoscape-legend
#### props
参数 | 说明 | 类型 | 可选值 | 默认值
:-: | :-: | :-: | :-: | :-:
value / v-model | 绑定值 | Object | - | -|
data | cytoscape渲染数据 | Array | - | [] |
options | 图例配置 | Object | - | {}| 
type | 图例类型 | String | nodes/edges | nodes| 
category | 图例分类配置 | Object | - | {}|

#### category
<table>
    <tr>
      <th>两种用法</th>
      <th>参数</th>
      <th>说明</th>
	  <th>类型</th>
	  <th>可选值</th>
	  <th>默认值</th>
  </tr>
  <tr>
      <td rowspan='4'>Array</td>
      <td>name</td>
	  <td>指定分类项名称</td>
	  <td>String</td>
	  <td>-</td>
	  <td>-</td>
      
  </tr>
  <tr>
      <td>matching</td>
	  <td>分类项匹配规则</td>
	  <td>Function</td>
	  <td>-</td>
	  <td>-</td>
  </tr>
  <tr>
      <td>style</td>
	  <td>分类配色，具体参考cytoscape node颜色属性</td>
	  <td>Object</td>
	  <td>-</td>
	  <td>-</td>
  </tr>
  <tr>
      <td>formatter</td>
	  <td>翻译</td>
	  <td>Function</td>
	  <td>-</td>
	  <td>-</td>
  </tr>
  <tr>
  <td rowspan='2'>Object</td>
      <td>key</td>
	  <td>指定获取数据中的某个字段</td>
	  <td>String</td>
	  <td>-</td>
	  <td>-</td>
  </tr>
  <tr>
	  <td>styles</td>
	  <td>为上述style参数的数组或者key的键值对</td>
	  <td>Object/Array</td>
	  <td>-</td>
	  <td>-</td>
  </tr>
</table>

```javascript
category = [{
  name: 'category1',
  matching: data => data.label === 'category1', // 目前只支持函数
  style: {
    'background-color': '#c23531'
  },
  formatter: name => '分类1'
}]
```
#### events
事件名 | 说明 | 参数
:-: | :-: | :-:
change | 图例变化 | legendMode
