// Object APIs
// Note: browser specific
(() => {
    let self = this['json'] = {} // for access from the web page, etc.

function _filterClass(cls, children) {
  let result = []
  for (let child of children) {
    if (child.classList && child.classList.contains(cls)) {
      result.push(child)
    }
  }
  return result
}

self.x = () => {

}

self.scriptToArray = (script) => {
  let arr = []
  for (let block of _filterClass("quando-block", script.children)) {
    // persist data-quando-id
    let block_persist = {}
    block_persist["id"] = block.dataset.quandoId
    block_persist["block_type"] = block.dataset.quandoBlockType
    let values = {}
    let boxes = []
    // Find the quando-right
    for (let right of _filterClass("quando-right", block.children)) {
      // Then loop through all the rows and boxes in the quando-right
      for (let row of _filterClass("quando-row", right.children)) {
        // now find all quando-value with values
        for (let named of row.querySelectorAll("[data-quando-name]")) {
          values[named.dataset.quandoName] = named.value
        }
      }
      for (let box of _filterClass("quando-box", right.children)) {
        // recurse
        let contents = _scriptToArray(box)
        let obj = {}
        obj.id = box.dataset.quandoName
        if (contents.length > 0) {
          obj.box = contents
        }
        boxes.push(obj)
      }
    }
    block_persist.values = values
    if (boxes.length > 0) {
      block_persist.boxes = boxes
    }
    arr.push(block_persist)
  }
  return arr
}

self.addObjectToElement = (obj, elem) => {
  if (obj) {
    for(let block of obj) {
      let id = block.id
      // find block_type
      let src_block = document.getElementById("menu").querySelector("[data-quando-block-type='"+ block.block_type +"']")
      // clone to script
      elem.appendChild(src_block.cloneNode(true))
      let clone = elem.lastChild
      for(let elem of clone.querySelectorAll("input, select")) {
        elem.disabled = false
      }
      clone.dataset.quandoId = id
      clone.style.display = "" // removes display none ?!
      for (let key in block.values) {
        let element = clone.querySelector("[data-quando-name='"+ key +"']")
        if (element) {
          element.value = block.values[key]
        }
      }
      for (let key in block.boxes) {
        let obj = block.boxes[key]
        let element = clone.querySelector(".quando-box[data-quando-name='"+ obj.id +"']")
        if (element && obj.box) {
          self.addObjectToElement(obj.box, element)
        }
      }
    }
  }
}

})()