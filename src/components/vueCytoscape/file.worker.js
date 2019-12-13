import * as d3 from 'd3-force'
const forceLayout = function (option) {
  const _data = option.data
  const _width = option.width
  const _height = option.height
  _data.forEach(_d => {
    if (_d.group === 'nodes') {
      if (!_d.position) {
        _d.position = {
          id: _d.data.id
        }
      }
    } else {
      _d._forceedges = {
        id: _d.data.id,
        source: _d.data.source,
        target: _d.data.target
      }
    }
  })
  let nodes = _data.filter(_d => _d.group === 'nodes').map(item => item.position)
  let edges = _data.filter(_d => _d.group === 'edges').map(item => item._forceedges)
  return d3.forceSimulation(nodes)
    .force('charge', d3.forceManyBody().strength(-800))
    .force('link', d3.forceLink(edges).id(function(d) { return d.id; }).distance(100).strength(1))
    .force('x', d3.forceX())
    .force('y', d3.forceY())
    .force("center", d3.forceCenter(_width, _height))
}
self.addEventListener('message', function(event) {
  const { data, width, height, steps } = event.data
  let _progress = 0
  let _stepNum = (steps || []).length + 1
  while (steps && steps.length) {
    let _stepdata = steps.shift()
    let simulation = forceLayout({
      data: _stepdata,
      width,
      height
    }, true)
    for (let i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
      postMessage({type: "tick", progress: _progress + i / n / _stepNum});
      simulation.tick();
    }
    _stepdata.filter(_d => _d.group === 'nodes').forEach(_d => {
      _d.position.fx = _d.position.x
      _d.position.fy = _d.position.y
    })
    _progress += 1 / _stepNum
  }
  let simulation = forceLayout(event.data)
  for (let i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
    postMessage({type: "tick", progress: _progress + i / n / _stepNum});
    simulation.tick();
  }
  postMessage({type: "end", data});
})
self.addEventListener('messageerror', function(event) {
  console.error(event)
})