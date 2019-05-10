const options = {
  layout: {
    name: 'euler',
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
        'border-color': 'rgba(5, 161, 140, 1)',
        'border-width': 2
      }
    },
    {
      selector: 'node',
      style: {
        content: 'data(name)',
        'background-color': 'rgba(5, 161, 140, 0.6)',
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
export default JSON.parse(JSON.stringify(options))
