// Object APIs
// Note: browser specific
(() => {
    let self = this['json'] = {} // for access from the web page, etc.

let NEXT_ID = 0
self.nextDataQuandoId = (id) => {
  let result = id
  if (isNaN(id)) {
    result = 0
  }
  while (document.querySelector(`[data-quando-id='${result}']`)) {
    result++
  }
  NEXT_ID = result
  return result
}

self.filterClass = (cls, children) => {
  let result = []
  for (let child of children) {
    if (child.classList && child.classList.contains(cls)) {
      result.push(child)
    }
  }
  return result
}

self.scriptToArray = (script) => {
  let arr = []
  for (let block of self.filterClass("quando-block", script.children)) {
    // persist data-quando-id
    let block_persist = {}
    if (block.dataset && block.dataset.quandoId) {
      block_persist["id"] = block.dataset.quandoId
    }
    block_persist["block_type"] = block.dataset.quandoBlockType
    // persist expand/collapse status
    if (block.dataset && block.dataset.quandoBlockExpand) {
      block_persist["block_expand"] = block.dataset.quandoBlockExpand
    }
    // persist enable/disable status
    if (block.dataset && block.dataset.quandoBlockEnable) {
      block_persist["block_enable"] = block.dataset.quandoBlockEnable
    }
    let values = {}
    let boxes = []
    // Find the quando-right
    for (let right of self.filterClass("quando-right", block.children)) {
      // Then loop through all the rows and boxes in the quando-right
      for (let row of self.filterClass("quando-row", right.children)) {
        // now find all quando-value with values
        for (let named of row.querySelectorAll("[data-quando-name]")) {
          values[named.dataset.quandoName] = named.value
        }
      }
      for (let box of self.filterClass("quando-box", right.children)) {
        // recurse
        let contents = self.scriptToArray(box)
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

let PREVIOUS_IDS = []
let NEW_IDS = []
self.addObjectToElement = (obj, elem) => {
  let menu = document.getElementById("menu")
  if (obj) {
    let ids_index = 0
    for(let block of obj) {
      if (block.block_type == 'devices-rotate-object3d') {
        block.block_type = 'media-rotate-object3d'
      }
      if (block.block_type == 'devices-move-object3d') {
        block.block_type = 'media-move-object3d'
      }
      // find block_type
      let src_block = menu.querySelector("[data-quando-block-type='"+ block.block_type +"']")
      if (!src_block) {  // Block is no longer in the menu and is most likely out of date...
        alert('Failed to create Block:'+block.block_type)
        console.log('Unknown Block: '+JSON.stringify(block))
      }
      if (src_block) { // clone to script
        elem.appendChild(src_block.cloneNode(true))
        let clone = elem.lastChild
        for(let elem of clone.querySelectorAll("input, select")) {
          elem.disabled = false
        }
        if (block.id) {
          clone.dataset.quandoId = self.nextDataQuandoId(block.id)
          if(block.block_type == "display-when-display"){
            //if is block display-when-display, as option value of display-label-to
            //and display-show-display are set according to its id,
            //its previous id (in script) and new id will be save in array
            //provide clue for block to getting the correct option value
            PREVIOUS_IDS[ids_index] = block.id
            NEW_IDS[ids_index] = NEXT_ID
            ids_index +=1
          } 
        }
        // expand status
        if (block.block_expand){
          clone.dataset.quandoBlockExpand = block.block_expand
        }
        // enable status
        if (block.block_enable){
          clone.dataset.quandoBlockEnable = block.block_enable
        }
        clone.style.display = "" // removes display none ?!
        for (let key in block.values) {
          let element = clone.querySelector("[data-quando-name='"+ key +"']")
          if (element) {
            if (element.nodeName.toLowerCase() == 'select') {
              element.dataset.quandoTmpValue = block.values[key]
            } else {
              element.value = block.values[key]
            }
          } else {
            element = menu.querySelector("[data-quando-block-type='advanced-error']")
            if (element) {
              elem.appendChild(element.cloneNode(true))
              let error_elem = elem.lastChild
              error_elem.style.display = ''
              let text = error_elem.querySelector("[data-quando-name='text']")
              if (text) {
                text.value = key + " = " + block.values[key]
              }
            }
            console.log("Failed to set block '" + block.block_type + "', key '" + key + "' to:")
            console.log(block.values[key])
          }
        }
        //if block status is "collapse", collapse its quando box
        if(block.block_expand == "false"){ 
          let status = document.getElementById('status-symbol').children[0]
          let collapse_icon = status.cloneNode(true)
          let relement = clone.children[1].children //children of quando_right
          relement[0].appendChild(collapse_icon)
          for(u=1; u<relement.length;u++){
            relement[u].classList.add("collapse")
          }
        }
        //if block status is "disable", disable the block
        if(block.block_enable == "false"){ 
          //clone.dataset.enable = "false"
          clone.classList.add("disable")
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
}

self.setOptions = (current_script) => {
  let script = current_script
  for(let elem of script.querySelectorAll("[data-quando-tmp-value]")) {
    if (elem.dataset.quandoTmpValue) {
      let found = elem.querySelector("option[value='" + elem.dataset.quandoTmpValue + "']")
      //find whether the quandoTmpValue relates with display-when-display block
      let index_of_tmp = PREVIOUS_IDS.indexOf(elem.dataset.quandoTmpValue)
      //if so, according to index of block's (previous) id in PREVIOUS_IDS
      //to get the blocks' new id in NEW_IDS array, get the option with correct value
      if (index_of_tmp >-1){
        let new_tmp_value = NEW_IDS[index_of_tmp]
        found = elem.querySelector("option[value='" + new_tmp_value + "']")
      }
      if (found) {
        found.selected = true
      }
      delete elem.dataset.quandoTmpValue
    }
  }
  //As all option value are correct and set, these two arrays are empty for next use
  PREVIOUS_IDS=[]
  NEW_IDS=[]
}

})()