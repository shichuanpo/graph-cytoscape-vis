const handlers = {
  _cxttap: function (e) {
    let element = e.target
    this.elements().unselect()
    if (element !== this) {
      this.elements(element).select()
    } else {
      this.elements('.hover').removeClass('hover')
      this.elements('.unhover').removeClass('unhover')
    }
  },
  _tap: function (e) {
    let element = e.target
    this.elements().unselect()
    if (element !== this) {
      this.elements(element).select()
    } else {
      this.elements('.hover').removeClass('hover')
      this.elements('.unhover').removeClass('unhover')
    }
  },
  _select: function (e) {
    let element = e.target
    if (element !== this) {
      let targetElement = this.elements(element)
      let neighborhood = targetElement.neighborhood()
      let connectedNodes = targetElement.connectedNodes()
      let hoverElements = targetElement
        .merge(neighborhood)
        .merge(connectedNodes)
      let elseElements = this.elements().difference(hoverElements)
      elseElements.removeClass('hover').addClass('unhover')
      hoverElements.removeClass('unhover').addClass('hover')
    }
  },
  _unselect: function (e) {
    let element = e.target
    if (element !== this) {
      let targetElement = this.elements(element)
      let neighborhood = targetElement.neighborhood()
      let connectedNodes = targetElement.connectedNodes()
      let hoverElements = targetElement
        .merge(neighborhood)
        .merge(connectedNodes)
      let elseElements = this.elements().difference(hoverElements)
      elseElements.removeClass('unhover')
      hoverElements.removeClass('hover')
    }
  }
  // _dragfree: function (e) {
  //   let element = e.target
  //   if (element.isNode && element.isNode()) {
  //     element.lock()
  //   }
  // },
  // _tapstart: function (e) {
  //   let element = e.target
  //   if (element.isNode && element.isNode()) {
  //     element.locked() && element.unlock()
  //   }
  // }
}
function createEvents (cy) {
  let selector = ''
  let events = []
  ;['select', 'unselect', 'tap', 'cxttap'].forEach(item => {
    selector
      ? cy.on(item, selector, handlers[`_${item}`])
      : cy.on(item, handlers[`_${item}`])
    events.push(
      () => {
        selector
        ? cy.off(item, selector, handlers[`_${item}`])
        : cy.off(item, handlers[`_${item}`])
      })
  })
  return events
}
export default createEvents
