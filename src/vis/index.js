import vis from 'vis'
class YzVis {
  constructor(el, data, option) {
    this.el = el
    this.data = data
    this.option = this._merge(
      {
        edges: {
          color: '#909090',
          smooth: {
            enabled: false
          }
        },
        interaction: {
          hover: true,
          zoomView: true
        }
      },
      option || {}
    )
    this.clusterDelta = {}
    this._event = []
    this._init()
  }
  _isObject(item) {
    return Object.prototype.toString.call(item) === '[object Object]'
  }
  _merge(target, source) {
    if (this._isObject(target) && this._isObject(source)) {
      for (let key in source) {
        if (this._isObject(source[key]) && this._isObject(target[key])) {
          target[key] = this._merge(target[key], source[key])
        } else {
          target[key] = source[key]
        }
      }
      return target
    } else {
      console.error('target or source must be Object')
    }
  }
  _init() {
    this.graph = new vis.Network(this.el, this.data, this.option)
    // let _clusterClick = e => {
    //   this._clusterClick(e)
    // }
    // let _clusterDragEnd = e => {
    //   this._clusterDragEnd(e)
    // }
    // this.graph.on('click', _clusterClick)
    // this.graph.on('dragEnd', _clusterDragEnd)
    // this._event.push({
    //   handler: _clusterClick,
    //   type: 'click'
    // })
    // this._event.push({
    //   handler: _clusterDragEnd,
    //   type: 'dragEnd'
    // })
  }
  _destory() {
    this._event.forEach(e => this.graph.off(e.type, e.handler))
    this.clusterDelta = {}
    this._event = []
  }
  _clusterClick(e) {
    if (e.nodes.length) {
      let _node = e.nodes[0]
      if (this.graph.isCluster(_node)) {
        this.clusterDelta[_node] = this.clusterDelta[_node] || {}
        this.graph.openCluster(_node, {
          releaseFunction: (clusterPosition, containedNodesPositions) => {
            let newPositions = {}
            for (let id in containedNodesPositions) {
              newPositions[id] = {
                x:
                  containedNodesPositions[id].x +
                  (this.clusterDelta[_node].x || 0),
                y:
                  containedNodesPositions[id].y +
                  (this.clusterDelta[_node].y || 0)
              }
            }
            return newPositions
          }
        })
      }
    }
  }
  _clusterDragEnd(e) {
    if (e.nodes.length) {
      let _node = e.nodes[0]
      if (this.graph.isCluster(_node)) {
        this.clusterDelta[_node] = this.clusterDelta[_node] || {
          x: 0,
          y: 0
        }
        this.clusterDelta[_node].x += e.event.deltaX
        this.clusterDelta[_node].y += e.event.deltaY
      }
    }
  }
  cluster(clusterOptionsByData) {
    this.graph.cluster(clusterOptionsByData)
  }
  setData(data) {
    this.graph.setData(data)
  }
  dataSet(data) {
    return new vis.DataSet(data)
  }
}
export default YzVis
