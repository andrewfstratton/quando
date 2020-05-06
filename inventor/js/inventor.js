// support the inventor (editor) page
((generator, json) => {
let self = this['index'] = {}
let _userid = null
let _deploy = ''
let _remote_list = []
let PREFIX = 'quando_' // used for key to save/load to/from browser
let client_script = ""

let CURRENT_INDEX = 0 //used for getting the script index

let TARGET_SCRIPT = document.getElementById('script_0')//used for getting actived script

let IS_SHOW_CODE = 0 //use for switch function used in generateCode

//when mouse click on script, active script
//(currently used in "right-click clone the block from menu")
self.activeScript = () => {
  if((event.target).classList.contains('status')){
    //
  }else if(_hasAncestor(event.target,"script")){
    TARGET_SCRIPT = _getAncestor(event.target,"script")
  }else{
    let script_container = _getAncestor(event.target,"script_container")
    TARGET_SCRIPT = script_container.getElementsByClassName("script")[0]
  }
  active_script()
}

//active icon appears on the actived script, lights actived script's background 
function active_script(){
  let index = TARGET_SCRIPT.getAttribute("data-script-index")
  let active_icon = document.getElementById('active_'+index)
  let script = document.getElementById('script_'+index)
  if(script.classList.contains('inactive')){
    script.classList.remove('inactive')
  }
  if (active_icon.classList.contains('hide')){
    active_icon.classList.remove('hide')
  }
  if(index == 1){
    index = 0
  }else{
    index = 1
  }
  let icon_inactive = document.getElementById('active_'+index)
  icon_inactive.classList.add('hide')
  let script_inactive = document.getElementById('script_'+index)
  script_inactive.classList.add('inactive')
}

//get index of current script from the button's attribute (data-current-index)
function _get_current_index(select){
  let menu_button = _getAncestor(select,"dropdown")
  CURRENT_INDEX = menu_button.getAttribute("data-current-index")
}

//get id according given script_index, and find the element
 function _get_current_script(script_index){
   let id = "script_" + script_index
   return document.getElementById(id)
 }

//Add 'current_script' parameter
self.showObject = (obj, current_script) => {
  current_script.innerHTML = ''
  self.appendObject(obj,current_script)
}

//Add 'current_script' parameter
self.appendObject = (obj, current_script) => {
  json.addObjectToElement(obj, current_script)
  _populateLists()
  json.setOptions(current_script)
  for (let item of current_script.getElementsByClassName("quando-block")) {
    self.setElementHandlers(item)
  }
}

//Add 'current_script' parameter
self.getScriptAsObject = (current_script) => {
   return json.scriptToArray(current_script)
}

//set menu option whether show or hide
function _set_menu_option_status(elem1,status1,elem2,status2){
  let option1 = document.getElementById(elem1)
  let option2 = document.getElementById(elem2)
  option1.style.display = status1
  option2.style.display = status2
}

self.handleRightClick = (event) => {
    event.preventDefault()
    _show_right_menu(event.target)
    return false
}

//collapse/expand, disable/enable, help selection added
function _show_right_menu(elem) {
  let menu = document.getElementById('right-click-menu')
  let clone = menu.cloneNode(true)
  menu.parentNode.replaceChild(clone, menu)
  menu = clone
  let choosen_block = elem
  if (!elem.classList.contains("quando-block")) {
    choosen_block = _getAncestor(elem, "quando-block")
  }
  if (choosen_block){
    //if block only have one row, hide "collapse" & "expand" button
    if(choosen_block.getElementsByClassName('quando-box').length == 0){
      _set_menu_option_status('block-collapse',"none",'block-expand',"none")
    }
    //if quando block collapsed, show "expand" button
    else if ((choosen_block.dataset.quandoBlockExpand == "false")) {
      _set_menu_option_status('block-collapse',"none",'block-expand',"")
    }else{
      _set_menu_option_status('block-collapse',"",'block-expand',"none")
    }
    //if quando block is disable, show "enable" button
    if((choosen_block.dataset.quandoBlockEnable == "false")){
      _set_menu_option_status('block-disable',"none",'block-enable',"")
    }else{
      _set_menu_option_status('block-disable',"",'block-enable',"none")
    }
    //if block is in menu, hide collapse,expand,disable,enable button
    if(_hasAncestor(choosen_block, document.getElementById('menu'))){
      _set_menu_option_status('block-collapse',"none",'block-expand',"none")
      _set_menu_option_status('block-disable',"none",'block-enable',"none")
    }
    
    //if block in script, active current script
    if(_getAncestor(choosen_block,"script") != null){
      TARGET_SCRIPT = _getAncestor(choosen_block,"script")
      active_script()
    } 
  }
  menu.style.visibility = "visible"
  menu.style.left = event.pageX-8 + "px"
  menu.style.top = event.pageY-8 + "px"
  menu.addEventListener('mouseleave', (e) => {
    menu.style.visibility = "hidden"
  })
  document.getElementById('block-clone').addEventListener('click', (ev) => {
    menu.style.visibility = "hidden"
    let containing_block = elem
    if (!elem.classList.contains("quando-block")) {
      containing_block = _getAncestor(elem, "quando-block")
    }
    if (containing_block)  {
      let clone = containing_block.cloneNode(true)
      if (_hasAncestor(containing_block, document.getElementById('menu'))) { // in the menu - so copy to script
        TARGET_SCRIPT.appendChild(clone)//clone block to the script that user's last action on
        console.log(1)
      } else {
        let parent = containing_block.parentNode
        if (parent) {
          if (containing_block.nextSibling) {
            parent.insertBefore(clone, containing_block.nextSibling)
          } else {
            parent.appendChild(clone)
          }
        } else {
          clone = false
        }
      }
      if (clone) {
        clone.addEventListener('contextmenu', self.handleRightClick, false)
        self.copyBlock(containing_block, clone)
        _populateLists()
        self.setElementHandlers(clone)
      }
    }
  }, false)
  document.getElementById('block-collapse').addEventListener('click', (ev) => {
    menu.style.visibility = "hidden"
    let containing_block = elem
    if (!elem.classList.contains("quando-block")) {
      containing_block = _getAncestor(elem, "quando-block")
    }
    if (containing_block){
      containing_block.dataset.quandoBlockExpand = "false"
      let status = document.getElementById('status-symbol').children[0]
      let clone = status.cloneNode(true)
      let relement = containing_block.children[1].children //children of quando_right
      relement[0].appendChild(clone)
      for(i=1; i<relement.length;i++){
        relement[i].classList.add("collapse")
      }
    }
  },false)
  document.getElementById('block-expand').addEventListener('click', (ev) => {
    menu.style.visibility = "hidden"
    _block_expand(elem)
  },false)
  document.getElementById('block-disable').addEventListener('click', (ev) => {
    menu.style.visibility = "hidden"
    let containing_block = elem
    if (!elem.classList.contains("quando-block")) {
      containing_block = _getAncestor(elem, "quando-block")
    }
    if (containing_block){
      containing_block.dataset.quandoBlockEnable = "false"
      containing_block.classList.add("disable")
    }
  },false)
  document.getElementById('block-enable').addEventListener('click', (ev) => {
    menu.style.visibility = "hidden"
    let containing_block = elem
    if (!elem.classList.contains("quando-block")) {
      containing_block = _getAncestor(elem, "quando-block")
    }
    if (containing_block){
      containing_block.dataset.quandoBlockEnable = "true"
      containing_block.classList.remove("disable")
    }
  },false)
  document.getElementById('block-help').addEventListener('click', (ev) => {
    menu.style.visibility = "hidden"
    let containing_block = elem
    if (!elem.classList.contains("quando-block")) {
      containing_block = _getAncestor(elem, "quando-block")
    }
    if (containing_block){
      let type = containing_block.dataset.quandoBlockType
      let id = "#"+ type
      let url = "/inventor/help/help.html"+id
      window.open(url)
    }
  },false)
}

function _leftClickTitle(open_elem) {
  let parent = open_elem.parentNode
  let display = '' // i.e. show everything not preceeded by a title
  for (let elem of parent.querySelectorAll(".quando-title,.quando-block")) {
    if (elem.classList.contains("quando-title")) {
      if (elem == open_elem) {
        display =''
      } else {
        display = 'none'
      }
    } else { // must be a quando-block?!
      elem.style.display = display
    }
  }
}

function _buildToggleList(elem) {
  let result = []
  // append if quandoToggle exists...
  if (elem.dataset && elem.dataset.quandoToggle) {
    result.push(elem)
  }
  // don't descend into quando-box
  if (!elem.classList.contains("quando-box")) {
    for (let child of elem.children) {
      result = result.concat(_buildToggleList(child))
    }
  }
  return result
}

self.toggleRelativesOnElement = (elem) => {
  let elem_name = elem.dataset.quandoName
  let block = _getAncestor(elem, "quando-block")
  if (block) {
    let toggles = _buildToggleList(block) // Note: does NOT descend into contained blocks
    for (let child of toggles) {
      // now match all toggles
      let toggle = child.dataset && child.dataset.quandoToggle
      if (toggle) {
        if (toggle.includes('=')) { // check for name and value
          let [key, value] = toggle.split('=')
          if (key == elem_name) { // only toggle when the key is the same...
            child.style.display = (value == elem.value ? '' : 'none')
          }
        } else { // simple test
          child.style.display = (toggle == elem.value ? '' : 'none')
        }
      }
    }
  }
}

self.handleToggle = (event) => {
  event.preventDefault()
  let select = event.target
  let selectedIndex = select.selectedIndex + 1
  if (selectedIndex >= select.length) {
    selectedIndex = 0
  }
  select.selectedIndex = selectedIndex
  // now update the visibles...
  self.toggleRelativesOnElement(select)
  return false
}

self.handleLeftClick = function(event) {
  event.preventDefault()
  _leftClickTitle(event.target)
  return false
}

function _getAncestor(elem, _class) {
  let ancestor = elem.parentElement
  while (ancestor && !ancestor.classList.contains(_class)) {
    ancestor = ancestor.parentElement
  }
  return ancestor
}

function _getParentBlock(elem) {
  let ancestor = elem.parentElement
  while (ancestor && !ancestor.classList.contains("quando-block")) {
    ancestor = ancestor.parentElement
  }
  return ancestor
}

function _getAncestorId(elem, _class) {
  let id = null
  let ancestor = _getAncestor(elem, _class)
  if (ancestor) { // with the block id
    id = ancestor.dataset.quandoId
  }
  return id
}

function _populateListOptions(list_name) {
  let scripts = document.getElementsByClassName("script")
  let scripts_num = (scripts.length-1) //there is one template script also be counted
  for(b=0; b<scripts_num; b++){
    let script = scripts[b]
    let inputs = script.querySelectorAll("input[data-quando-list='" + list_name + "']") // the elements containing the values and text
    let add_to_select = `<option value="-1">----</option>\n`
    for (let input of inputs) {
      let id = _getAncestorId(input, "quando-block")
      if (id != null && id != "true") {
        let value = input.value
        add_to_select += `<option value="${id}">${value}</option>\n`
      }
    }
    let selects = script.querySelectorAll("select[data-quando-list='" + list_name + "']") // all the selectors to reset
    for(let select of selects) {
      let value = select.value
      let selectedIndex = select.selectedIndex
      select.innerHTML = add_to_select
      if (selectedIndex > 0) {
        let found = select.querySelector("option[value='" + value + "']")
        if (found) {
          found.selected = true
        }
      }
    }
  }
}

function _populateLists() {
  let script_arr = document.getElementsByClassName("script")
  for(a=0; a<(script_arr.length-1); a++){ //for all opened scripts, expect the script template
    let script = script_arr[a]
    let inputs = script.querySelectorAll("input[data-quando-list]")
    let list_names =[]
    for(let input of inputs){
      let list_name = input.dataset.quandoList
      if (list_name && !list_names.includes(list_name)) {
        list_names.push(list_name)
        _populateListOptions(list_name,script)
      }
    }
  }
}

function _handleListNameChange(event) {
  let target = event.target
  let id = _getAncestorId(target, "quando-block")
  //find which script user is now on
  let current_script = _getAncestor(target,"script")
  if (id != null && id != "true") {
    let list_name = target.dataset.quandoList
    if (list_name) { // with the list name
      let selects = current_script.querySelectorAll("select[data-quando-list='" + list_name + "']") // find any selects
      for(let select of selects) {
        let option = select.querySelector("option[value='" + id + "']") // update the text for any matching options
        if (option) {
          option.textContent = target.value
        }
      }
    }
  }
}

self.saveIP = () => {
  //get value of the first input field in the drag n drop window
  let inpFields = document.getElementsByClassName("ip_inp")
  let newIP = inpFields[1].value
  alert(newIP)
  //get IP's array from local storage
  let ipsRaw = localStorage.getItem('ips')
  let ips = JSON.parse(ipsRaw)
  if (!ips) {
    ips = []
    ipsRaw = ""
  }
  //ADD & SAVE NEW IP
  if (!ipsRaw.includes(newIP)) {
    ips.unshift(newIP)
    localStorage.setItem('ips', JSON.stringify(ips))
    _updateIPList()
  }
}

function _updateIPList() {
  let ips = JSON.parse(localStorage.getItem('ips'))
  if (ips) { //populate ALL select lists
    let selects = document.getElementsByClassName("ip_select")
    let add_to_select = ''
    for (let x = 0; x < ips.length; x++) {
      add_to_select += `<option value="${ips[x]}">${ips[x]}</option>\n`
    }
    for (let select of selects) {
    select.innerHTML = add_to_select
    }
  }
}

function _resizeWidth(event) {
    let target = event.target
    let hidden = document.getElementById('_hidden_width_element_')
    hidden.textContent = target.value
    if (target.value == "") {
      hidden.textContent = target.placeholder
    }
    let width = hidden.offsetWidth + 10
    // if (target.type=='number') { // need extra width for arrows
      // width += 8
    // }
    width = Math.min(width, 300)
    width = Math.max(width, 24)
    target.style.width = width + 'px'
}
  
self.setElementHandlers = (block) => {
  if (block.id != 'clipboard') { // contextmenu is not shown for clipboard
    block.addEventListener('contextmenu', self.handleRightClick, false)
  }
  // add handler for list item change
  let id = null
  if (block.dataset && block.dataset.quandoId) {
    id = block.dataset.quandoId
  }
  if (id && id != "true") {
    let inputs = block.querySelectorAll("input[data-quando-list]")
    for (let input of inputs) {
      input.addEventListener('input', _handleListNameChange)
    }
  }
  for (let elem of block.querySelectorAll("input[data-quando-media]")) {
    elem.addEventListener('click', self.handleFile, false)
  }
  for (let elem of block.querySelectorAll("input[data-quando-robot='say']")) {
    elem.addEventListener('click', self.handleRobotModal, false)
  }
  for (let elem of block.querySelectorAll("select.quando-toggle")) {
    elem.addEventListener('click', self.handleToggle, true)
    self.toggleRelativesOnElement(elem)
    elem.addEventListener('mousedown', (ev)=>{ev.preventDefault();return false})
  }
  //add update handler for IP datalist on click
  for (let elem of block.querySelectorAll("#robot_ip")) {
    elem.addEventListener('click', _updateIPList)
  }
  // set auto resize for input fields
  let inputs = block.querySelectorAll("input[type='text']")
  for (let input of inputs) {
    _resizeWidth({target:input})
    input.addEventListener('input', _resizeWidth)
    input.addEventListener('change', _resizeWidth)
  }
}

self.copyBlock = (old, clone) => { // Note that Clone is a 'simple' copy of old
  // copy across selected indexes
  if (old.hasChildNodes()) {
    let selector = "select"
      let oldNodes = old.querySelectorAll(selector)
      let cloneNodes = clone.querySelectorAll(selector)
      for (let i=0; i<oldNodes.length; i++) {
        let val = oldNodes[i].selectedIndex
        if (val) {
          cloneNodes[i].selectedIndex = val
        }
      }
  }
  // Create new ids
  let _id = json.nextDataQuandoId(0) // find the next free id
  // Get all the clone divs that have a data-quando-id
  let nodes = []
  if (clone.dataset.quandoId) {
    nodes.push(clone)
  }
  nodes = nodes.concat(Array.from(clone.querySelectorAll(`[data-quando-id]`)))
  for(let node of nodes) {
    node.dataset.quandoId = _id // next free id
    _id = json.nextDataQuandoId(_id)
    // now add id to select options
    let input = node.querySelector("input[data-quando-list]")
    if (input) {
      let list_name = input.dataset.quandoList
      if (list_name) {
        let selects = document.querySelectorAll("select[data-quando-list='" + list_name + "']")
        for(let select of selects) {
          let option = document.createElement('option')
          option.value = _id
          option.innerHTML = '' // starts empty
          select.appendChild(option)
        }
      }
    }
  }
  for(let elem of clone.querySelectorAll("input, select")) {
    elem.disabled = false
  }
}

self.removeBlock = (elem) => {
  let id = elem.dataset.quandoId
  if (id) {
    let options = document.querySelectorAll("option[value='" + id + "']")
    for (let option of options) {
      option.parentNode.removeChild(option)
    }
  }
}

/**
 * return true when elem has ancestor as a (recursive) parent
 * @param elem
 * @param ancestor
 */
function _hasAncestor(elem, ancestor) {
    let found = false
    let el = elem
    while (!found && (el = el.parentNode)) {
        if (el == ancestor) {
            found = true
        }
    }
    return found
}

function _findTarget(target){
  let scripts = document.getElementsByClassName('script')
  for(let script of scripts){
    if(target === script){
      return true
    }
  }
  return false
}

function _setupDragula() {
  let menu = document.getElementById('menu')
  let elems = menu.querySelectorAll("input, select")
  for(let elem of elems) {
    elem.disabled = true
  }
  let clipboard = document.getElementById('clipboard')
  let collections = []
  //push all scripts to collections
  let scripts = document.getElementsByClassName('script')
  for(let script of scripts){
    collections.push(script)
  }
  collections.push(menu)
  collections.push(clipboard)
  let options = {}
  options.removeOnSpill = true
  options.copy = (elem, source) => {
    return source === menu
  }
  options.isContainer = (el) => {
    return el.classList.contains('quando-box')
  }
  options.accepts = (elem, target) => {
    let accept = true
    if ((_findTarget(target)) || (target === clipboard)) {
      // accept = true
    } else if (target === menu) {
      accept = false
    } else if (target.classList.contains('quando-box')) { // i.e. a valid container
      if (_hasAncestor(target, menu)) {
        accept = false
      } else if (_hasAncestor(target, elem)) { // trying to drag into itself
        accept = false
      } else {
        let limited = elem.dataset.quandoDropValid
        if (limited != undefined) {
          accept = false // assume rejecting for now...
          if (limited != "") { // i.e. can't be dropped in anything...
            let parent_block = _getParentBlock(target)
            if (parent_block) {
              let block_type = parent_block.dataset.quandoBlockType
              limited = limited.split(",")
              for (let tuple of limited) {
                let [type,box] = tuple.split(".")
                let box_match = true // i.e. matches when no box name given
                if (box) {
                  if (target.dataset) {
                    box_match = (box == target.dataset.quandoName)
                  } else {
                    box_match = false
                  }
                }
                if (box_match && (block_type == type)) {
                  accept = true
                }
              }
            }
          }
        }
      }
    } else {
      accept = false
    }
    return accept
  }
  options.invalid = (elem, handle) => {
    return elem.classList.contains("quando-title")
  }
  self.drake = dragula(collections, options).on('drop', (elem) => {
    self.setElementHandlers(elem)
    if(_getAncestor(elem,"script")){
      TARGET_SCRIPT = _getAncestor(elem,"script")
      active_script()
    }
    _populateLists() // refresh options in label everytime when drop block
  }).on('cloned', (clone, old, type) => {
    if (type == 'copy') {
      self.copyBlock(old, clone)
    }
  }).on('remove', (elem) => {
    self.removeBlock(elem)
  })
  collections.forEach((collection)=>{
    collection.addEventListener('touchmove', (event) => {
      if (self.drake.dragging) {
        event.preventDefault()
      }
    })
  })
}

self.setup = () => {
  //OK this is bad but temporary my bad
  _updateIPList()
  window.onbeforeunload = () => {
    //Autosave all opended scripts
    let scripts = document.getElementsByClassName('script')
    let num_of_saves = 2
    let script_mode = 2 //0=only show script_0, 1=only show script_1, 2=show two scripts
    for(a=0; a<(scripts.length-1); a++){
      CURRENT_INDEX = scripts[a].getAttribute("data-script-index")
      let script = self.getScriptAsObject(scripts[a])
      let script_container = _getAncestor(scripts[a],"script_container")

      let key = 'quandoAutoSave_'+CURRENT_INDEX
        if(script.length){
          local_save(key, script)
        }else{
          localStorage.removeItem(key)
        }
        if(script_container.classList.contains("col-md-10")){
          script_mode = CURRENT_INDEX
        }
    }
    localStorage.setItem("numOfAutoSaves", JSON.stringify(num_of_saves))
    //store the index of actived script
    let actived_script_index = TARGET_SCRIPT.dataset.scriptIndex
    localStorage.setItem("activeScriptIndex", JSON.stringify(actived_script_index))
    localStorage.setItem("scriptMode", JSON.stringify(script_mode))
  }

  toastr.options = {
    closeButton: false,
    debug: false,
    newestOnTop: true,
    progressBar: false,
    positionClass: 'toast-top-center',
    preventDuplicates: false,
    onclick: null,
    showDuration: 300,
    hideDuration: 300,
    timeOut: 5000,
    extendedTimeOut: 0,
    showEasing: 'swing',
    hideEasing: 'linear',
    showMethod: 'fadeIn',
    hideMethod: 'fadeOut'
  }

  //keep script status (collapse/expand,actived/inactived) same as the last time
  let activeScriptIndex = 2
  if(localStorage.getItem("activeScriptIndex") != "undefined" && localStorage.getItem("activeScriptIndex") != null){
    activeScriptIndex = JSON.parse(localStorage.getItem("activeScriptIndex"))
  }
  let script_mode = 2
  if(localStorage.getItem("scriptMode") !="undefined" && localStorage.getItem("scriptMode") != null){
    script_mode = JSON.parse(localStorage.getItem("scriptMode"))
  }

  if (activeScriptIndex < 2){
    TARGET_SCRIPT = document.getElementById('script_'+activeScriptIndex)
    active_script()
  }
  
  if (script_mode != 2){
    let expand_button = document.getElementById('s_expand_'+script_mode)
    _script_expand(expand_button)
  }

  $('#login_modal').keypress((e) => {
    if (e.which === 13) {
      self.handle_login()
    }
  })
  $('#loading_modal_message').html('Checking for user session...')
  $('#loading_modal').modal('show')
  $.ajax({
    url: '/login',
    success: (res) => {
      if (res.success) {
        _success('Logged in')
        _userid = res.userid
        _show_user_status()
      } else {
        _warning(res.message)
      }
      $('#loading_modal').modal('hide')
    },
    error: () => {
      _error('Failed to find server')
      $('#loading_modal').modal('hide')
    }
  })
  _setupDragula()
  $.ajax({
    url: '/blocks',
    success: (res) => {
      if (res.success) {
        _success('Blocks loaded')
        let menu_title = document.getElementById('_menu_title')
        let parent = menu_title.parentNode
        let title = ''
        for (let block of res.blocks) {
          let elem = null
          if (block.title) {
            elem = menu_title.cloneNode(false)
            title = block.class
            elem.classList.add('quando-' + title)
            elem.innerHTML = block.name
            elem.style.display = ''
          } else {
            let tmp = document.createElement('div')
            tmp.innerHTML = block.html
            elem = tmp.querySelector(".quando-block")
            if (elem) {
              elem.dataset.quandoBlockType = title + '-' + block.type
            }
          }
          if (elem) {
            parent.insertBefore(elem, menu_title)
          } else {
            let name = block.name
            if (!name) {
              name = block.type
            }
          }
        }
      } else {
        _warning(res.message)
      }
      $('#loading_modal').modal('hide')

      //autoload files
      let num_of_saves = JSON.parse(localStorage.getItem("numOfAutoSaves"))
      for(q=0; q<num_of_saves; q++){
        let key='quandoAutoSave_' + q
        local_load(key,q)
      }
      
      for (let elem of document.getElementsByClassName("quando-title")) {
        elem.addEventListener('click', self.handleLeftClick)
      }
      for (let item of document.getElementsByClassName("quando-block")) {
        self.setElementHandlers(item)
      }
      let first_title = document.getElementsByClassName("quando-title")[0]
      if (first_title) {
        _leftClickTitle(first_title)
      }
      //move load autosave to in front of self.setElementHandlers(item)
      //then can set handlers to blocks in scripts
    },
    error: () => {
      _error('Failed to find server blocks')
      $('#loading_modal').modal('hide')
    }
  })
  $('.dropdown-menu select').on('click', function(event) {
    event.stopPropagation();
  });
}

function _show_user_status () {
    if (_userid) {
      $('#top_status').html(' ' + _userid)
    } else {
      $('#top_status').html(' Guest')
    }
}

function _success (message) {
    toastr.options.timeOut = 1500,
    toastr.success(message)
}

function _info (message) {
    toastr.options.timeOut = 1500,
    toastr.info(message)
}

function _error (message) {
    toastr.options.timeOut = 3500,
    toastr.error(message)
}

function _warning (message) {
    toastr.options.timeOut = 2500,
    toastr.warning(message)
}

  function _remote_load_list () {
    $.ajax({
      url: '/script/names/' + _userid,
      success: (res) => {
        if (res.success) {
          let list = res.list
          _remote_list = list
          if (list.length === 0) {
            $('#remote_load_list').html('No saves available')
          } else {
            _update_remote_list()
          }
        } else {
         _error(res.message)
        }
      },
      error: () => {
        alert('Failed to find server')
      }
    })
  }

  function _local_load_list () {
    $('#local_load_list').html('')
    let op = {fn:'local_delete'}
    let data = {name:''}
    for (let key in localStorage) {
      if (key.startsWith(PREFIX)) {
        let name = key.slice(PREFIX.length)
        let main = {name:name, fn:'local_load'}
        $('#local_load_list').append(_load_list_add(key, main, data, op))
      }
    }
    if ($('#local_load_list').html() === '') {
      $('#local_load_list').html('No saves available')
    }
  }

  //get the id of inputs of remote & local save modal respectively
  //also get id of the place shows filename
  function _get_inputs_name_id(script_index){
    let remote_id = "remote_save_key_" + script_index
    let local_id = "local_save_key_" + script_index
    let name_id = "name_" + script_index
    return [remote_id,local_id,name_id]

  }
  
  self.loaded = (obj, modal_id,script_index) => {
    //get current script
    let current_script = _get_current_script(script_index)
    self.showObject(obj.script,current_script)
    _deploy = obj.deploy
    name = obj.filename
    $(modal_id).modal('hide')
    _success('Loaded...')
    let ids = _get_inputs_name_id(script_index)
    document.getElementById(ids[0]).value = name //set remote save key
    document.getElementById(ids[1]).value = name //local save
    if (name == '') {
      name = '[no file]'
    }
    document.getElementById(ids[2]).innerHTML = name //name place
  }

  function _saved (name) {
    _success('Saved...')
    let ids = _get_inputs_name_id(CURRENT_INDEX) //[remote_id,local_id,name_id]
    document.getElementById(ids[2]).innerHTML = name
    document.getElementById(ids[0]).value = name
    document.getElementById(ids[1]).value = name
  }

  function _update_remote_list() {
    $('#remote_load_list').html('')
    let ignore = $('#remote_load_show_versions').val() == 'false'
    let ignore_names = []
    let op = {fn:['remote_delete']}
    if (ignore) {
      op = {fn:['remote_delete', 'remote_tidy', 'remote_delete_all']}
    }
    for (let i = 0; i < _remote_list.length; i++) {
      let name = _remote_list[i].name
      let add = true
      if (ignore && ignore_names.includes(name)) {
        add = false
      }
      if (add) {
        let main = {name:name, fn:'remote_load'}
        let data = {name:_remote_list[i].date}
        $('#remote_load_list').append(_remote_load_list_add(i, main, data, op))
        if (ignore) { // add the just found name to the ignore list...
          ignore_names.push(name)
        }
      }
    }
  }

  //add CURRENT_INDEX to create the local_load function
  function _load_list_add_fn(id, obj) {
    let result = ''
    if (obj.fn) {
      result = 'onclick="index.' + obj.fn + '(\'' + id + '\',' + CURRENT_INDEX + ')"'
    }
    return result
  }

  function _load_list_add (id, main, data, op) {
    let result = '<div class="row">' +
        '<a class="list-group-item col-md-5"' + _load_list_add_fn(id, main)
        + '>' + main.name + '</a>' +
        '<div class="col-sm-4 dropdown">' + data.name + '</div>' +
        '<div class="list-group-item col-sm-1 glyphicon glyphicon-remove"' +
        _load_list_add_fn(id, op) + '></div>' +
        '<div class="col-sm-2"></div>' +
      '</div>\n'
    return result
  }
  
  function _remote_load_list_add_fn(index, id, obj, icon, infix) {
    let result = ''
    if (obj.fn.length > index) {
        result += ' glyphicon ' + icon
    }
    result += '"'
    if (obj.fn.length > index) {
        result += 'onclick="index.' + obj.fn[index] + '(' + id + ')"'
    }
    result += '>'
    if (obj.fn.length > index) {
        result += `<sub>\n${infix}</sub>`
    }
    return result
  }

  function _remote_load_list_add (id, main, data, obj) {
    let result = '<div class="row">' +
      '<a class="list-group-item col-md-5"' + _load_list_add_fn(id, main)
      + '>' + main.name + '</a>' +
        '<div class="col-sm-4 dropdown">' + data.name + '</div>' +
        '<div class="col-sm-1' + _remote_load_list_add_fn(0, id, obj, 'glyphicon-remove', 'latest') + '</div>' + 
        '<div class="col-sm-1' + _remote_load_list_add_fn(1, id, obj, 'glyphicon-erase', 'oldest') + '</div>' + 
        '<div class="col-sm-1' + _remote_load_list_add_fn(2, id, obj, 'glyphicon-remove-sign', 'ALL') + '</div>' + 
      '</div>\n'
    return result
  }

self.generateCode = (elem) => {
  let children = elem.children
  let result = ""
  for (let child of children) {
    if(IS_SHOW_CODE == 0){
      result += generator.getCode(child)
    }else{
      result += generator.getCodeForShow(child)
    }
  }
  let prefix = generator.prefix()
  if (prefix) {
    result = prefix + result
  }
  result = result.replace(/(\r\n|\n|\r)+/gm, '\n')
  return result
}

self.handle_login = () => {
    let userid = $('#userid').val()
    let password = $('#password').val()
    let message_elem = $('#login_modal_footer_message')
    message_elem.html('Checking... ')
    $.ajax({
      url: '/login',
      type: 'POST',
      data: { 'userid': userid, 'password': password },
      success: (res, status, xhr) => {
        if (res.success) {
          message_elem.html('')
          _success('Logged in')
          $('#login_modal').modal('hide')
          _userid = userid
          _show_user_status()
        } else {
          message_elem.html('Failed: ' + res.message)
        }
      },
      error: () => {
        message_elem.html('Failed to find server ')
      }
    })
}

self.clientScript = () => {
  return client_script
}

self.testCreator = (code) => {
  let filename = '-'
  client_script = code
  $.ajax({
    url: '/script/deploy/' + encodeURI(filename),
    type: 'PUT',
    data: { javascript: code },
    success: () => {
      _success('Opening Test...')
      let deploy_window = window.open('/client/client.htm', 'quando_deployed_test', 'left=0,top=0,width=9999,height=9999');
      deploy_window.focus() // moveTo(0,0);
    },
    error: () => {
      alert('Failed to find server')
    }
  })
}

self.handle_test = () => {
    _get_current_index(event.target)
    let script = _get_current_script(CURRENT_INDEX)
    let code = self.generateCode(script)
    if (code) {
      let clipboard = document.getElementById('clipboard')
      if (clipboard && code.startsWith('<div class="quando-block"')) { // if inventing a block
        let tmp = document.createElement('div')
        tmp.innerHTML = code
        self.setElementHandlers(tmp.firstChild)
        clipboard.appendChild(tmp.firstChild)
        _leftClickTitle(document.getElementById('clipboard_title'))
      } else {
        self.testCreator(code)
      }
    } else {
      alert('Behaviour incomplete.')
    }
  }

  //expand current script
  self.scriptExpand = (event) =>{
    _script_expand(event.target)
    return false
  }

  function _script_expand(elem){
    let index = elem.dataset.currentIndex
    let script_container = _getAncestor(elem,"script_container")
    script_container.classList.remove("col-md-5")
    script_container.classList.add("col-md-10")
    let containers = document.getElementsByClassName('script_container')
    for(a=0;a<containers.length;a++){ 
      if((containers[a] == script_container)||containers[a].classList.contains("hide")){
        continue
      }
      containers[a].classList.add('hide')
    }
    elem.classList.add('hide')
    let collapse_button = document.getElementById('s_collapse_'+index)
    collapse_button.classList.remove('hide')
  }

  //collapse current script (show two scripts at the same time)
  self.scriptCollapse = (event) =>{
    _script_collapse(event.target)
    return false
  }
  
  function _script_collapse(elem){
    let index = elem.dataset.currentIndex
    let script_container = _getAncestor(elem,"script_container")
    script_container.classList.remove("col-md-10")
    script_container.classList.add("col-md-5")
    let containers = document.getElementsByClassName('script_container')
    for(a=0;a<containers.length;a++){ //the last one is template, already hided
      if((containers[a] == script_container)||!containers[a].classList.contains("hide")){
        continue
      }
      containers[a].classList.remove('hide')
    }
    elem.classList.add('hide')
    let expand_button = document.getElementById('s_expand_'+index)
    expand_button.classList.remove('hide')
  }

  //enter preview mode
  self.enterPreview = (event) => {
    _enter_preview(event.target)
    return false
  }

  function _enter_preview(elem){
    let collapsed_block = elem
    collapsed_block = _getAncestor(elem, "quando-block")
    collapsed_block.classList.add("quando-block-preview")
    collapsed_block.setAttribute("onmouseleave","index.exitPreview(event)")
  }

  //exit preview mode
  self.exitPreview = (event) => {
    _exit_preview(event.target)
    return false
  }

  function _exit_preview(elem){
    let collapsed_block = elem
    collapsed_block.classList.remove("quando-block-preview")
    collapsed_block.removeAttribute("onmouseleave")
  }

  //expand block using button
  self.blockExpand = (event) => {
    _block_expand(event.target)
    return false
  }

  function _block_expand(elem){
    let collapsed_block = elem
    if (!elem.classList.contains("quando-block")) {
      collapsed_block = _getAncestor(elem, "quando-block")
    }
    if(collapsed_block){
      collapsed_block.dataset.quandoBlockExpand = "true"
      if(collapsed_block.classList.contains("quando-block-preview")){
        //if block is in preview mode, then remove preview class when click the expand button
        collapsed_block.classList.remove("quando-block-preview")
        collapsed_block.removeAttribute("onmouseleave")
      }
      let relement = collapsed_block.children[1].children //children of quando_right
      var collapse_symbol = relement[0].getElementsByClassName("status")
      relement[0].removeChild(collapse_symbol[0])
      for(i=1; i<relement.length;i++){
        relement[i].classList.remove("collapse")
      }
      //active the script that user expand the block
      TARGET_SCRIPT = _getAncestor(collapsed_block,"script")
      active_script()
    }
  }

  //show input boxes of the choosen script in remote & local save, using the index of sscript
  function _show_input_box(){
    let remote_id = "remote_save_key_" + CURRENT_INDEX
    let remote_inputs = document.getElementById('remote_save_modal').getElementsByTagName("input")
    let local_inputs = document.getElementById('local_save_modal').getElementsByTagName("input")
    for(i=0;i<local_inputs.length;i++){
      if(remote_inputs[i].id == remote_id){
        //because romote and local key have the same index,
        //and they are added in html at the same time,
        //hence they have the same order in array.
        remote_inputs[i].classList.remove('hide')
        local_inputs[i].classList.remove('hide') 
        continue
      }
      remote_inputs[i].classList.add('hide')
      local_inputs[i].classList.add('hide')
    }
  }

  self.handle_save = () => {
    _get_current_index(event.target) //get id of current script that user want to save file on
    _show_input_box()
    if (_userid) {
      $('#remote_save_modal').modal('show')
    } else {
      $('#local_save_modal').modal('show')
    }
  }

  self.handle_remote_to_local_save = () => {
    $('#remote_save_modal').modal('hide')
    $('#local_save_modal').modal('show')
  }

  //get 'key' from save input box of current script
  function _get_input_value(status, index){
    let ids = _get_inputs_name_id(index) //[remote_id,local_id,name_id]
    if(status == "remote"){
      return document.getElementById(ids[0]).value
    }
    if(status == "local"){
      return document.getElementById(ids[1]).value
    }
  }
  
  self.handle_local_save = () => {
    let key = _get_input_value("local",CURRENT_INDEX)
    let current_script = _get_current_script(CURRENT_INDEX)
    local_save(PREFIX + key, self.getScriptAsObject(current_script))
    $('#local_save_modal').modal('hide')
    _saved(key)
  }

  function local_save(key, _script) {
    let name = _get_input_value("local",CURRENT_INDEX)
    localStorage.setItem(key, JSON.stringify({
      deploy: _deploy,
      filename: name,
      script: _script
    }))
  }
  
  self.handle_remote_save = () => {
    let name = encodeURI(_get_input_value("remote",CURRENT_INDEX))
    let current_script = _get_current_script(CURRENT_INDEX)
    let obj = JSON.stringify({ deploy: _deploy, script: self.getScriptAsObject(current_script)})
    $.ajax({
      url: '/script',
      type: 'POST',
      data: { userid: _userid, name: name, script: obj },
      success: (res) => {
        if (res.success) {
          $('#remote_save_modal').modal('hide')
          _saved(decodeURI(name))
        } else {
          alert('Failed to save')
        }
      },
      error: () => {
        alert('Failed to find server')
      }
    })
  }

  self.handle_load = () => {
    _get_current_index(event.target) //get id of current script that user want to load file on
    if (_userid) {
      $('#remote_load_modal').modal('show')
      _remote_load_list()
    } else {
      _local_load_list()
      $('#local_load_modal').modal('show')
    }
  }

  self.handle_remote_to_local_load = () => {
    _local_load_list()
    $('#remote_load_modal').modal('hide')
    $('#local_load_modal').modal('show')
  }
  
  self.handle_remote_to_local_save = () => {
    $('#remote_save_modal').modal('hide')
    $('#local_save_modal').modal('show')
  }

  //add 'script_index' parameter
  function local_load(key, script_index) {
    self.local_load(key, script_index)
  }

  //add 'script_index' parameter
  self.local_load = (key, script_index) => {
    let obj = JSON.parse(localStorage.getItem(key))
    if (obj) {
      self.loaded(obj, '#local_load_modal', script_index)
    } else {
      if (key.indexOf("quandoAutoSave")>-1) { //if key is autosave
        _warning('No Autosave...')
      } else {
        _warning("Failed to load local")
      }
    }
  }
  
  self.remote_load = (index, script_index) => {
    $.ajax({
      url: '/script/id/' + _remote_list[index].id,
      success: (res) => {
        if (res.success) {
          let script = JSON.parse(res.doc.script)
          script.filename = res.doc.name
          self.loaded(script, '#remote_load_modal', script_index)
        } else {
          alert('Failed to find script')
        }
      },
      error: () => {
        alert('Failed to access server')
      }
    })
  }

  self.local_delete = (key) => {
    if (confirm("Delete forever '" + key + "'?")) {
      localStorage.removeItem(key)
      _local_load_list()
    }
  }

  self.remote_delete = (index) => {
    if (confirm("Delete forever '" + _remote_list[index].name + "' saved " +
            _remote_list[index].date + ' ?')) {
      $.ajax({
        url: '/script/id/' + _remote_list[index].id,
        type: 'DELETE',
        success: (res) => {
          if (!res.success) {
            _error(res.message) // possible to fail if no longer logged in...
          } else {
            _success('Deleted...')
          }
          _remote_load_list()
        },
        error: () => {
          alert('Failed to find server')
        }
      })
    }
  }

  self.remote_tidy = (index) => {
    let id = _remote_list[index].id
    let name = _remote_list[index].name
    $.ajax({
      url: '/script/tidy/' + encodeURI(name) + '/id/' + id,
      type: 'DELETE',
      success: (res) => {
        if (res.success) {
          _success('Tidied...')
        } else {
          _error(res.message)
        }
        _remote_load_list()
      },
      error: () => {
        alert('Failed to find server')
      }
    })
  }

  self.remote_delete_all = (index) => {
    let name = _remote_list[index].name
    if (confirm("Delete ALL '" + name + "' ?")) {
      $.ajax({
        url: '/script/name/' + name,
        type: 'DELETE',
        success: (res) => {
          if (!res.success) {
            _error(res.message) // possible to fail if no longer logged in...
          } else {
            _success('Deleted ALL...')
          }
          _remote_load_list()
        },
        error: () => {
          alert('Failed to find server')
        }
      })
    }
  }

  self.handle_show_version = () => {
    _update_remote_list() //no need to specify script that user in,undefined 
  }

  self.handle_show_code = () => {
    $('#show_modal').modal('show')
    $('#show_modal_code').removeClass('language-xml').addClass('language-javascript')
    _get_current_index(event.target) //get current script index
    update_code_clip()
  }

  //Add '_get_current_index', '_get_current_script','_get_inputs_name_id'
  self.handle_clear = () => {
    _info('Cleared...')
    _deploy = ''
    _get_current_index(event.target)
    let current_script = _get_current_script(CURRENT_INDEX)
    let autosave_key = "quandoAutoSave_" + CURRENT_INDEX
    localStorage.removeItem(autosave_key)
    let ids = _get_inputs_name_id(CURRENT_INDEX) //[remote_id,local_id,name_id]
    document.getElementById(ids[2]).innerHTML = '[no file]'
    document.getElementById(ids[0]).value = ''
    document.getElementById(ids[1]).value = ''
    self.showObject(undefined,current_script)
  }

  function update_code_clip() {
    let disabled = true
    let btn = $('#show_modal_code_toggle_button')
    let txt = ""
    let script = _get_current_script(CURRENT_INDEX) //get current script user is on
    if (btn.text() == 'Clip') { // i.e. if is Clip
      disabled = false
      let arr = json.scriptToArray(script)
      txt = "["
      for(let i in arr) {
        if (txt != "[") {
          txt += ',\n'
        }
        txt += JSON.stringify(arr[i])
      }
      txt += ']'
    } else { // must be Code
      IS_SHOW_CODE = 1
      btn.text('Code') // In case the first time it's called
      txt = self.generateCode(script)
      IS_SHOW_CODE = 0
    }
    $('#show_modal_clip_paste_button').prop('disabled', disabled)
    $('#show_modal_code').prop('readonly', false)
    $('#show_modal_code').val(txt)  //change .text(txt) to .val(txt)
    $('#show_modal_code').prop('readonly', disabled)
  }

  self.handle_code_clip_toggle = () => {
    let btn = $('#show_modal_code_toggle_button')
    if (btn.text() != 'Clip') { // i.e. if was Code, or blank (!), now to be Clip
      btn.text('Clip')
    } else { // was Clip, now Code
      btn.text('Code')
    }
    update_code_clip()
  }

  self.handle_clip_paste = () => {
    let txt = $('#show_modal_code').val()
    let obj = JSON.parse(txt)
    let current_script = _get_current_script(CURRENT_INDEX)
    self.appendObject(obj,current_script)
    $('#show_modal').modal('hide')
    toastr.success("Clipboard pasted to script...")
  }

  function _file_list_add (file_name, path, fn_name, block_id, elem_name) {
    let result = '<div class="row"><div class="col-sm-1"> </div>' +
            '<a class="list-group-item col-md-5" onclick="index.' +
            `${fn_name}('${path}${file_name}', `
    if (block_id == null) {
      result += 'null'
    } else {
      result += `'${block_id}'`
    }
    result += `, '${elem_name}')">${file_name}</a>` +
            '</div>\n'
    return result
  }

  function _folder_list_add (folder_name, media, path, block_id, elem_name) {
    let result = '<div class="row"><div class="col-sm-1"> </div>' +
            '<a class="list-group-item col-md-5" onclick="index.' +
                `handle_folder_selected('${media}', `
    if (block_id == null) {
      result += 'null'
    } else {
      result += `'${block_id}'`
    }
    result += `, '${elem_name}', '${path}')">&#x1f5c1; ${folder_name}</a>` +
            '</div>\n'
    return result
  }

  self.handleFile = (event) => {
    event.preventDefault()
    let elem = event.target
    let path = elem.value
    let slash_loc = path.lastIndexOf('/')
    if (slash_loc > 0) {
      path = '/' + path.substring(0, slash_loc)
    } else {
      path = ''
    }
    let block_id = _getAncestorId(elem, "quando-block")
    _handle_file(elem.dataset.quandoMedia, block_id, elem.dataset.quandoName, path)
    return false
  }

  function _handle_file(media, block_id, elem_name, path = '') {
        // when media is 'UPLOAD', then we are uploading, note then that block_id and elem_name are null
    let file_modal = $('#file_modal')
    if (media == 'UPLOAD') {
      $('.file_modal_upload').show()
      $('.file_modal_select_file').hide()
    } else {
      $('.file_modal_select_file').show()
      $('.file_modal_upload').hide()
    }
    $('#file_modal_path').html('Loading...')
    file_modal.modal('show')
    $('#file_list').html('Loading...')
    $.ajax({
      url: '/file/type' + path + '/' + media,
      success: (res) => {
        if (res.success) {
          $('#file_modal_path').html(path)
          $('#file_list').html('')
          if (path != '') {
            let parent_path = ''
            let slash_loc = path.lastIndexOf('/')
            if (slash_loc > 0) {
              parent_path = path.substring(0, slash_loc)
            }
            $('#file_list').append(_folder_list_add('..', media, parent_path,
                            block_id, elem_name))
          }
          for (let i in res.folders) {
            $('#file_list').append(_folder_list_add(res.folders[i], media, path + '/' + res.folders[i],
                            block_id, elem_name))
          }
          if (path != '') {
            path = path.substring(1) + '/' // strip off the intial slash and put infront of the file
          }
          for (let i in res.files) {
            $('#file_list').append(_file_list_add(res.files[i], path,
                            'handle_file_selected', block_id, elem_name))
          }
        } else {
          alert('Failed to find server files')
          $('#file_modal').modal('hide')
        }
      },
      error: () => {
        alert('Failed to access server')
        $('#file_modal').modal('hide')
      }
    })
  }

  self.handle_folder_selected = (media, block_id, elem_name, path) => {
    _handle_file(media, block_id, elem_name, path)
  }

  self.handle_file_selected = (filename, block_id, elem_name) => {
        // When blocK-id is null, then this is an upload - so do nothing...
    if (block_id != null) {
      let block = document.querySelector('[data-quando-id="'+block_id+'"]')
      if (block) {
        let elem = block.querySelector('[data-quando-name="'+elem_name+'"]')
        if (elem) {
          elem.value = filename
          _resizeWidth({target:elem})
        }
      }
      $('#file_modal').modal('hide')
    }
  }

  self.handle_upload_media = () => {
    if ($('#upload_media').val()) {
      _handle_file('UPLOAD', null, null, '')
    }
  }

  function _upload_next_file(files, remote_path) {
    let file = files.shift()
    let file_in = file.name
    let filename = encodeURI(file_in.substring(1 + file_in.lastIndexOf('\\')))
    let form_data = new FormData()
    form_data.append('upload_data', file)
    $.ajax({
      url: '/file/upload' + remote_path + '/' + filename,
      type: 'POST',
      data: form_data,
      processData: false,
      contentType: false,
      success: (res) => {
        if (res.success) {
          _success('Uploaded...' + decodeURI(`${remote_path}/${filename}`))
          if (files.length > 0) {
            _upload_next_file(files, remote_path)
          } else {
            $('#file_modal').modal('hide')
            $('#upload_media').val(null) // clear once finished - forces a change event next time
          }
        } else {
          alert('Failed to save')
        }
      },
      error: () => {
        alert('Failed to find server')
      }
    })
  }

  self.handle_upload = () => {
    let files = Array.from($('#upload_media')[0].files)
    let remote_path = encodeURI($('#file_modal_path').html())
    if (files.length > 0) {
      _upload_next_file(files, remote_path)
    }
  }

  self.handle_help = () => {
    let url = "/inventor/help/help.html"
    window.open(url)
  }

  self.handle_logout = () => {
    $.ajax({
      url: '/login',
      type: 'DELETE',
      success: (res, status, xhr) => {
        _info('Logged out')
        _userid = null
        _show_user_status()
      },
      error: () => {
        $('#loading_modal_message').html('Failed to find server')
      }
    })
  }

  self.handle_deploy = () => {
    _get_current_index(event.target)
    let script = _get_current_script(CURRENT_INDEX)
    let code = self.generateCode(script)
    if (code) {
      code = "let exec = () => {\n" + code + "}"
      let filename = 'guest'
      if (_userid) {
        filename = prompt('Please enter the deployment filename \n(without a suffix)', _deploy)
      }
      if (filename !== null) {
        if (filename == '') {
          alert('Filename cannot be blank')
        } else {
          $.ajax({
            url: '/script/deploy/' + encodeURI(filename),
            type: 'PUT',
            data: { javascript: code },
            success: () => {
              _deploy = filename
              _success("Deployed as '" + filename + ".js'")
            },
            error: () => {
              alert('Failed to find server')
            }
          })
        }
      }
    } else {
      alert('Behaviour incomplete.')
    }
  }

  self.handleRobotModal = (event) => {
    event.preventDefault()

    let elem = event.target
    let text = elem.value

    let block_id = _getAncestorId(elem, "quando-block")
    _handle_robot_modal(text, block_id)

    return false
  }

  self.handle_robot_say = (event) => {
    event.preventDefault()

    let robot_say_modal = $('#robot_say_modal')
    let text = robot_say_modal.find('#robot_say_input').first()
    let block_id = text.attr('data-block-id')
    let block = document.querySelector('[data-quando-id="'+block_id+'"]')

    if (block) {
      let input = block.querySelector('[data-quando-robot="say"]')

      input.value = text.val()
      robot_say_modal.modal('hide')
    }

    return false
  }

  function _handle_robot_modal(text, block_id) {
    let robot_say_modal = $('#robot_say_modal')
    let input = robot_say_modal.find('#robot_say_input').first()
    input.attr('data-block-id', block_id)

    input.val(text)
    robot_say_modal.modal('show')
  }

  self.add_robot_voice_tuning = (event) => {
    let elem = $(event.target)
    let type = elem.attr('data-type')
    let tuning = ''

    if (['number', 'file'].includes(type)) {
      elem = elem.parents('.dropdown').find('input')
      tuning = elem.attr('data-value').replace(type, elem.val())
    } else if (type == 'option') {
      elem = elem.parents('.dropdown').find('select')
      tuning = elem.attr('data-value').replace(type, elem.val())
    } else {
      tuning = elem.attr('data-value')
    }

    let robot_say_modal = $('#robot_say_modal')
    let input = robot_say_modal.find('#robot_say_input').first()
    let value = input.val()
    let cursor_pos = input.prop('selectionEnd')

    input.val(value.substring(0, cursor_pos) + tuning + value.substring(cursor_pos))
    input.focus()
    input.prop('selectionEnd', cursor_pos + tuning.length)
  }


})(this['generator'], this['json'])

window.onload = index.setup() // FIX - this should be inventor - but generated html/javascript refers to index
