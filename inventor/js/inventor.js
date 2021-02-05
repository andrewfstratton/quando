// support the inventor (editor) page
import * as generator from "./generator.js"
import * as json from "./json.js"
import * as undo from "./undo.js"
let _undo = undo.undo
let _redo = undo.redo
export { _undo as undo, _redo as redo } // this allows html/bootstrap button binding to index.undo/redo

let _userid = null
let _deploy = ''
let _remote_list = []
const AUTOSAVE = 'quandoAutosave' // used for key to save/load to/from browser
const PREFIX = 'quando_' // used for key to save/load to/from browser
export let client_script = ""
const QUANDO_DISABLED = 'quando-disabled';

export function showObject(obj) {
  let script = document.getElementById('script')
  script.innerHTML = ''
  appendObject(obj)
}

export function appendObject(obj) {
  let script = document.getElementById('script')
  json.addObjectToElement(obj, script, setElementHandlers)
  _populateLists()
  json.setOptions()
}

export function getScriptAsObject() {
   return json.scriptToArray(document.getElementById('script'))
}

export function handleRightClick(event) {
    event.preventDefault()
    _show_right_menu(event.target)
    return false
}

function _handle_click_clone(elem) {
    let containing_block = elem
    if (!elem.classList.contains("quando-block")) {
      containing_block = _getParentBlock(elem)
    }
    if (containing_block)  {
      let clone = containing_block.cloneNode(true)
      // if in the menu - then append to script
      if (_hasAncestor(containing_block, document.getElementById('menu'))) {
        document.getElementById('script').appendChild(clone)
      } else { // add after this element
        let parent = containing_block.parentNode
        if (parent) {
          parent.insertBefore(clone, containing_block.nextSibling)
        } else { // this should never happen
          clone = false
        }
      }
      if (clone) {
        copyBlock(containing_block, clone)
        _populateLists()
        moveBlock(clone, null, null) // Important this follows _populateLists()
      }
    }
}

function _show_right_menu(elem) {
  let menu = document.getElementById('right-click-menu')
  let clone = menu.cloneNode(true)
  menu.parentNode.replaceChild(clone, menu)
  menu = clone
  menu.style.visibility = "visible"
  menu.style.left = event.pageX-8 + "px"
  menu.style.top = event.pageY-8 + "px"
  menu.addEventListener('mouseleave', (ev) => {
    menu.style.visibility = "hidden"
  })
  document.getElementById('block-clone').addEventListener('click', (ev) => {
    menu.style.visibility = "hidden"
    _handle_click_clone(elem)
  }, false)
  document.getElementById('block-help').addEventListener('click', (ev) => {
    menu.style.visibility = "hidden"
    let containing_block = elem
    // need to find the quando-block - may be ancestor
    if (!elem.classList.contains("quando-block")) {	
      containing_block = _getParentBlock(elem)	
    }	
    if (containing_block){	
      handle_help(containing_block.dataset.quandoBlockType)
    }
  }, false)
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

function _buildDisableList(elem) {
  let result = []
  // append if data-quando-disable exists...
  if (elem.dataset && elem.dataset.quandoDisable) {
    result.push(elem)
  }
  // don't descend into quando-box
  if (!elem.classList.contains("quando-box")) {
    for (let child of elem.children) {
      result = result.concat(_buildDisableList(child))
    }
  }
  return result
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

export function toggleRelativesOnElement(elem) {
  let elem_name = elem.dataset.quandoName
  let block = _getParentBlock(elem)
  if (block) {
    let toggles = _buildToggleList(block) // Note: does NOT descend into contained blocks
    for (let child of toggles) {
      // now match all toggles
      let toggle = child.dataset && child.dataset.quandoToggle
      if (toggle && toggle.includes('=')) { // check for name and value
        let [key, value] = toggle.split('=')
        if (key == elem_name) { // key must be specified - only toggle when the key is the same...
          child.style.display = (value == elem.value ? '' : 'none')
        }
      }
    }
    let disables = _buildDisableList(block)
    for (let child of disables) {
      let disable_class = child.dataset && child.dataset.quandoDisable 
      if (disable_class && disable_class.includes("=")) {
        let [key, value] = disable_class.split('=')
        if (key == elem_name) {
          if (value == elem.value) { // add disabled when it matches?!
            block.classList.add(QUANDO_DISABLED)
          } else {
            block.classList.remove(QUANDO_DISABLED)
          }
        }
      }
    }
  }
}

export function handleToggle(event) {
  event.preventDefault()
  let select = event.target
  let selectedIndex = select.selectedIndex + 1
  if (selectedIndex >= select.length) {
    selectedIndex = 0
  }
  select.selectedIndex = selectedIndex
  // now update the visibles...
  toggleRelativesOnElement(select)
  return false
}

function handleTextChange(ev) {
  let elem = ev.target
  let new_text = elem.value
  let last_text = elem.dataset.quandoLastText
  elem.dataset.quandoLastText = new_text
  if (new_text != last_text) { // i.e. must be different
    let _undo = () => {
      elem.value = last_text
      _resizeWidth({target:elem})
    }
    let _redo = () => {
      elem.value = new_text
      _resizeWidth({target:elem})
    }
    undo.done(_undo, _redo, "Change Text")
    _redo()
  }
}

export function handleLeftClick(event) {
  event.preventDefault()
  _leftClickTitle(event.target)
  return false
}

function _getParentBlock(elem) {
  let ancestor = elem.parentElement
  while (ancestor && !ancestor.classList.contains("quando-block")) {
    ancestor = ancestor.parentElement
  }
  return ancestor
}

function _getParentBlockId(elem) {
  let id = null
  let parent = _getParentBlock(elem)
  if  (parent) { // with the block id
    id = parent.dataset.quandoId
  }
  return id
}

function _populateListOptions(list_name) {
  let script = document.getElementById('script')
  let inputs = script.querySelectorAll("input[data-quando-list='" + list_name + "']") // the elements containing the values and text
  let add_to_select = `<option value="-1">----</option>\n`
  for (let input of inputs) {
    let id = _getParentBlockId(input)
    if (id != null && id != "true") {
      let value = input.value
      add_to_select += `<option value="${id}">${value}</option>\n`
    }
  }
  let selects = document.querySelectorAll("select[data-quando-list='" + list_name + "']") // all the selectors to reset
  for (let select of selects) {
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

function _populateLists() {
  let inputs = document.querySelectorAll("input[data-quando-list]")
  let list_names = []
  for (let input of inputs) {
    let list_name = input.dataset.quandoList
    if (list_name && !list_names.includes(list_name)) {
      list_names.push(list_name)
      _populateListOptions(list_name)
    }
  }
}

function _handleListNameChange(event) {
  let target = event.target
  let id = _getParentBlockId(target)
  if (id != null && id != "true") {
    let list_name = target.dataset.quandoList
    if (list_name) { // with the list name
      let selects = document.querySelectorAll("select[data-quando-list='" + list_name + "']") // find any selects
      for (let select of selects) {
        let option = select.querySelector("option[value='" + id + "']") // update the text for any matching options
        if (option) {
          option.textContent = target.value
        }
      }
    }
  }
}

export function saveIP() {
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

function handleSelect(event) {
  event.preventDefault()
  let select = event.target
  let old_index = select.dataset.quandoLastIndex
  let new_index = select.selectedIndex
  select.dataset.quandoLastIndex = new_index
  toggleRelativesOnElement(select)
  let _undo = () => {
    select.selectedIndex =  old_index;
    toggleRelativesOnElement(select)
  }
  let _redo = () => {
    select.selectedIndex =  new_index;
    toggleRelativesOnElement(select)
  }
  undo.done(_undo, _redo, "Change Selected")
  return false
}
  
export function setElementHandlers (block) {
  block.addEventListener('contextmenu', handleRightClick, false)
  // add handler for list item change
  let id = null
  if (block.dataset && block.dataset.quandoId) {
    id = block.dataset.quandoId
  }
  if (id && id != "true") {
    // List of Display (only currently)
    for (let input of block.querySelectorAll("input[data-quando-list]")) {
      input.addEventListener('input', _handleListNameChange)
    }
  }
  // File choice
  for (let elem of block.querySelectorAll("input[data-quando-media]")) {
    elem.addEventListener('click', handleFile, false)
  }
  // Text (and number) input
  for (let input of block.querySelectorAll("input")) {
    // Store the initial value
    input.dataset.quandoLastText = input.value
    input.addEventListener('change', handleTextChange)
    // set auto resize for text input fields
    if (input.type == "text") {
      _resizeWidth({target:input})
      input.addEventListener('input', _resizeWidth)
      input.addEventListener('change', _resizeWidth)
    }
  }
  // Modal for robot say
  for (let elem of block.querySelectorAll("input[data-quando-robot='say']")) {
    elem.addEventListener('click', handleRobotModal, false)
  }
  // Drop down and toggle
  for (let select of block.querySelectorAll("select")) {
    select.dataset.quandoLastIndex = select.selectedIndex
    if (select.classList.contains("quando-toggle")) {
      select.addEventListener('click', (ev)=>{handleToggle(ev);handleSelect(ev)}, true)
      select.addEventListener('mousedown', (ev)=>{ev.preventDefault();return false})
      toggleRelativesOnElement(select)
    } else {
      select.addEventListener("change", handleSelect)
    }
  }
  //add update handler for IP datalist on click
  for (let elem of block.querySelectorAll("#robot_ip")) {
    elem.addEventListener('click', _updateIPList)
  }
}

// Note that clone is a 'simple' copy of old, e.g. used for dragging
function copyBlock(old, clone) { 
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
  for (let node of nodes) {
    node.dataset.quandoId = _id // next free id
    _id = json.nextDataQuandoId(_id)
    // now add id to select options
    let input = node.querySelector("input[data-quando-list]")
    if (input) {
      let list_name = input.dataset.quandoList
      if (list_name) {
        let selects = document.querySelectorAll("select[data-quando-list='" + list_name + "']")
        for (let select of selects) {
          let option = document.createElement('option')
          option.value = _id
          option.innerHTML = '' // starts empty
          select.appendChild(option)
        }
      }
    }
  }
  for (let elem of clone.querySelectorAll("input, select")) {
    elem.disabled = false
  }
  setElementHandlers(clone)
}

function moveBlock(elem, old_parent, old_sibling) {
  let id = elem.dataset.quandoId
  let option_parents = []
  // Store any references to this option if now in menu - for undo
  if (id && _hasAncestor(elem, document.getElementById('menu'))) {
    option_parents = _get_parent_options(id)
    _populateLists()
  }
  let new_parent = elem.parentNode
  let new_sibling = elem.nextSibling
  let _undo = () => {
    if (elem.parentNode) { elem.parentNode.removeChild(elem) }
    if (old_parent) {
      old_parent.insertBefore(elem, old_sibling)
    } else { // force the update of the display lists
      _populateLists()
    }
  }
  let _redo = () => {
    if (elem.parentNode) { elem.parentNode.removeChild(elem) }
    new_parent.insertBefore(elem, new_sibling)
    _populateLists()
    _restore_options(id, option_parents)
  }
  undo.done(_undo, _redo, "Move Block")
}

function _get_parent_options(id) {
  let result = []
  let options = document.querySelectorAll("option[value='" + id + "']")
  for (let option of options) {
    let parent = option.parentNode
    if (parent) {
      if (parent.value == id) {
        result.push(parent)
      }
    }
    return result
  }
}

// Restore selected options
function _restore_options(id, list) {
  for (let parent of list) {
    let found = parent.querySelector("option[value='" + id + "']")
    if (found) {
      found.selected = true
    }
  }

}

function removeBlock(elem, parent_node, next_sibling) {
  let id = elem.dataset.quandoId
  let option_parents = []
  if (id) { // Store any references to this option - for undo
    option_parents = _get_parent_options(id)
    _populateLists()
  }
  elem.classList.remove("gu-hide") // To reveal the element if undone later
  let _undo = () => {
    parent_node.insertBefore(elem, next_sibling)
    _populateLists()
    _restore_options(id, option_parents)
  }
  let _redo = () => {
    parent_node.removeChild(elem)
    _populateLists()
  }
  undo.done(_undo, _redo, "Delete Block")
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

function _setupDragula() {
  let menu = document.getElementById('menu')
  let elems = menu.querySelectorAll("input, select")
  for (let elem of elems) {
    elem.disabled = true
  }
  let script = document.getElementById('script')
  let clipboard = document.getElementById('clipboard')
  let collections = []
  collections.push(script)
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
    if ((target === script) || (target === clipboard)) {
      // accept = true
    } else if (target === menu) {
      accept = false
    } else if (!target.classList.contains('quando-box')) { // target must be a container
      accept = false
    } else if (_hasAncestor(target, menu)) { // target cannot be inside the menu
      accept = false
    } else if (_hasAncestor(target, elem)) { // trying to drag into itself
      accept = false
    } else { // satisfy the valid check
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
    return accept
  }
  options.invalid = (elem, handle) => {
    return elem.classList.contains("quando-title")
  }
  let last_parent = null
  let next_sibling = null
  let drake = dragula(collections, options).on('drop', (elem) => {
    moveBlock(elem, last_parent, next_sibling)
  }).on('drag', (elem, src) => {
    // Only use when outside the menu
    if (_hasAncestor(elem, document.getElementById('menu'))) {
      last_parent = null
    } else {
      last_parent = src
    }
    next_sibling = elem.nextSibling
//  }).on('dragend', (elem) => {
  }).on('cloned', (clone, old, type) => {
    if (type == 'copy') {
      copyBlock(old, clone)
    }
  }).on('remove', (elem) => {
    removeBlock(elem, last_parent, next_sibling)
  })
  collections.forEach((collection)=>{
    collection.addEventListener('touchmove', (event) => {
      if (drake.dragging) {
        event.preventDefault()
      }
    })
  })
}

export function setup() {
  //OK this is bad but temporary my bad
  _updateIPList()
  window.onbeforeunload = () => {
    let obj = getScriptAsObject()
    if (obj.length) {
      local_save(AUTOSAVE, obj)
    } else {
      localStorage.removeItem(AUTOSAVE)
    }
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

  $('#login_modal').keypress((e) => {
    if (e.which === 13) {
      handle_login()
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
      _error('Failed to find Quando:Cloud')
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
            console.log("Error with block '" + name + "'")
            console.log(block)
          }
        }
      } else {
        _warning(res.message)
      }
      $('#loading_modal').modal('hide')
      for (let elem of document.getElementsByClassName("quando-title")) {
        elem.addEventListener('click', handleLeftClick)
      }
      // Set elements in the menu
      let selector = "#menu .quando-block"
      for (let item of document.querySelectorAll(selector)) {
        setElementHandlers(item)
      }
      let first_title = document.getElementsByClassName("quando-title")[0]
      if (first_title) {
        _leftClickTitle(first_title)
      }
      local_load(AUTOSAVE) // load last edit from localstorage
    },
    error: () => {
      _error('Failed to find Quando:Cloud blocks')
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
        alert('Failed to find Quando:Cloud')
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

export function loaded(obj, modal_id) {
    showObject(obj.script)
    _deploy = obj.deploy
    name = obj.filename
    $(modal_id).modal('hide')
    _success('Loaded...')
    $('#local_save_key').val(name)
    $('#remote_save_key').val(name)
    if (name == '') {
      name = '[no file]'
    }
    $('#file_name').html(name)
    undo.reset()
  }

  function _saved (name) {
    _success('Saved...')
    $('#local_save_key').val(name)
    $('#remote_save_key').val(name)
    $('#file_name').html(name)
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

  function _load_list_add_fn(id, obj) {
    let result = ''
    if (obj.fn) {
      result = 'onclick="index.' + obj.fn + '(\'' + id + '\')"'
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

export function generateCode(elem) {
  let children = elem.children
  let result = ""
  for (let child of children) {
    result += generator.getCode(child)
  }
  let prefix = generator.prefix()
  if (prefix) {
    result = prefix + result
  }
  result = result.replace(/(\r\n|\n|\r)+/gm, '\n')
  return result
}

export function handle_login() {
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
        message_elem.html('Failed to find Quando:Cloud ')
      }
    })
}

export function testCreator(code) {
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
      alert('Failed to find Quando:Cloud')
    }
  })
}

export function handle_test() {
    let code = generateCode(document.getElementById('script'))
    if (code) {
      let clipboard = document.getElementById('clipboard')
      if (clipboard && code.startsWith('<div class="quando-block"')) { // if inventing a block
        let tmp = document.createElement('div')
        tmp.innerHTML = code
        setElementHandlers(tmp.firstChild)
        clipboard.appendChild(tmp.firstChild)
        _leftClickTitle(document.getElementById('clipboard_title'))
      } else {
        testCreator(code)
      }
    } else {
      alert('Behaviour incomplete.')
    }
  }

export function handle_save() {
    if (_userid) {
      $('#remote_save_modal').modal('show')
    } else {
      $('#local_save_modal').modal('show')
    }
  }

export function handle_remote_to_local_save() {
    $('#remote_save_modal').modal('hide')
    $('#local_save_modal').modal('show')
  }

export function handle_local_save() {
    let key = $('#local_save_key').val()
    if (key == "") {
      _warning("No name given, so not saved")
    } else {
      local_save(PREFIX + key, getScriptAsObject())
      $('#local_save_modal').modal('hide')
      _saved(key)
    }
  }

  function local_save(key, _script) {
    localStorage.setItem(key, JSON.stringify({
      deploy: _deploy,
      filename: $('#local_save_key').val(),
      script: _script
    }))
  }
  
export function handle_remote_save() {
    let name = encodeURI($('#remote_save_key').val())
    if (name == "") {
      _warning("No name given, so not saved")
    } else {
      let obj = JSON.stringify({ deploy: _deploy, script: getScriptAsObject()})
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
          alert('Failed to find Quando:Cloud')
        }
      })
    }
  }

export function handle_load() {
    if (_userid) {
      $('#remote_load_modal').modal('show')
      _remote_load_list()
    } else {
      _local_load_list()
      $('#local_load_modal').modal('show')
    }
  }

export function handle_remote_to_local_load() {
    _local_load_list()
    $('#remote_load_modal').modal('hide')
    $('#local_load_modal').modal('show')
  }
  
export function local_load(key) {
    let obj = JSON.parse(localStorage.getItem(key))
    if (obj) {
      loaded(obj, '#local_load_modal')
    } else {
      if (key == AUTOSAVE) {
        _warning('No Autosave...')
      } else {
        _warning("Failed to load local")
      }
    }
  }
  
export function remote_load(index) {
    $.ajax({
      url: '/script/id/' + _remote_list[index].id,
      success: (res) => {
        if (res.success) {
          let script = JSON.parse(res.doc.script)
          script.filename = res.doc.name
          loaded(script, '#remote_load_modal')
        } else {
          alert('Failed to find script')
        }
      },
      error: () => {
        alert('Failed to access Quando:Cloud')
      }
    })
  }

export function local_delete(key) {
    if (confirm("Delete forever '" + key + "'?")) {
      localStorage.removeItem(key)
      _local_load_list()
    }
  }

export function remote_delete(index) {
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
          alert('Failed to find Quando:Cloud')
        }
      })
    }
  }

export function remote_tidy(index) {
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
        alert('Failed to find Quando:Cloud')
      }
    })
  }

export function remote_delete_all(index) {
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
          alert('Failed to find Quando:Cloud')
        }
      })
    }
  }

export function handle_show_version() {
    _update_remote_list()
  }

export function handle_show_code() {
    $('#show_modal').modal('show')
    // let class_list = document.getElementById("show_modal_code").classList
    // class_list.remove("language-xml")
    // class_list.add("language-javascript")
    // $('#show_modal_code').removeClass('language-xml').addClass('language-javascript')
    update_code_clip()
  }

export function handle_clear() {
  let old_object = getScriptAsObject()
  let old_deploy = _deploy
  let old_filename = document.getElementById("file_name").innerHTML
  let old_local_save_key = document.getElementById("local_save_key").value
  let old_remote_save_key = document.getElementById("remote_save_key").value
  undo.reset() // clears all old undo/redo
  let _undo = () => {
    showObject(old_object)
    _deploy = old_deploy
    document.getElementById("file_name").innerHTML = old_filename
    document.getElementById("local_save_key").value = old_local_save_key 
    document.getElementById("remote_save_key").value = old_remote_save_key 
  }
  let _redo = () => {
    _deploy = ''
    document.getElementById("file_name").innerHTML = '[no file]'
    document.getElementById("local_save_key").value = ''
    document.getElementById("remote_save_key").value = ''
    showObject()
  }
  _redo()
  _info('Cleared...')
  localStorage.removeItem(AUTOSAVE)
  undo.done(_undo, _redo, "Clear Workspace")
}

  function update_code_clip() {
    let disabled = true
    let btn = $('#show_modal_code_toggle_button')
    let txt = ""
    let script = document.getElementById("script")
    if (btn.text() == 'Clip') { // i.e. if is Clip
      disabled = false
      let arr = json.scriptToArray(script)
      txt = "["
      for (let i in arr) {
        if (txt != "[") {
          txt += ',\n'
        }
        txt += JSON.stringify(arr[i])
      }
      txt += ']'
    } else { // must be Code
      btn.text('Code') // In case the first time it's called
      txt = generateCode(script)
    }
    $('#show_modal_clip_paste_button').prop('disabled', disabled)
    $('#show_modal_code').prop('readonly', false)
    $('#show_modal_code').text(txt)
    $('#show_modal_code').prop('readonly', disabled)
  }

export function handle_code_clip_toggle() {
    let btn = $('#show_modal_code_toggle_button')
    if (btn.text() != 'Clip') { // i.e. if was Code, or blank (!), now to be Clip
      btn.text('Clip')
    } else { // was Clip, now Code
      btn.text('Code')
    }
    update_code_clip()
  }

export function handle_clip_paste() {
    let txt = $('#show_modal_code').val()
    let obj = JSON.parse(txt)
    appendObject(obj)
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

export function handleFile(event) {
    event.preventDefault()
    let elem = event.target
    let path = elem.value
    let slash_loc = path.lastIndexOf('/')
    if (slash_loc > 0) {
      path = '/' + path.substring(0, slash_loc)
    } else {
      path = ''
    }
    let block_id = _getParentBlockId(elem)
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
          alert('Failed to find Quando:Cloud files')
          $('#file_modal').modal('hide')
        }
      },
      error: () => {
        alert('Failed to access Quando:Cloud')
        $('#file_modal').modal('hide')
      }
    })
  }

export function handle_folder_selected(media, block_id, elem_name, path) {
    _handle_file(media, block_id, elem_name, path)
  }

export function handle_file_selected(new_filename, block_id, elem_name) {
    // When blocK-id is null, then this is an upload - so do nothing...
    if (block_id != null) {
      let block = document.querySelector('[data-quando-id="'+block_id+'"]')
      if (block) {
        let elem = block.querySelector('[data-quando-name="'+elem_name+'"]')
        if (elem && (elem.value != new_filename)) { // i.e. must be different
          elem.value = new_filename
          // This change will also update undo stack and resize
          elem.dispatchEvent(new Event('change'))
        }
      }
      $('#file_modal').modal('hide')
    }
  }

export function handle_upload_media() {
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
        alert('Failed to find Quando:Cloud')
      }
    })
  }

export function handle_upload() {
    let files = Array.from($('#upload_media')[0].files)
    let remote_path = encodeURI($('#file_modal_path').html())
    if (files.length > 0) {
      _upload_next_file(files, remote_path)
    }
  }

export function handle_logout() {
    $.ajax({
      url: '/login',
      type: 'DELETE',
      success: (res, status, xhr) => {
        _info('Logged out')
        _userid = null
        _show_user_status()
      },
      error: () => {
        $('#loading_modal_message').html('Failed to find Quando:Cloud')
      }
    })
  }

export function handle_deploy() {
    let code = generateCode(document.getElementById('script'))
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
              alert('Failed to find Quando:Cloud')
            }
          })
        }
      }
    } else {
      alert('Behaviour incomplete.')
    }
  }

export function handleRobotModal(event) {
    event.preventDefault()

    let elem = event.target
    let text = elem.value

    let block_id = _getParentBlockId(elem)
    _handle_robot_modal(text, block_id)

    return false
  }

export function handle_robot_say(event) {
    event.preventDefault()

    let robot_say_modal = $('#robot_say_modal')
    let text = robot_say_modal.find('#robot_say_input').first()
    let block_id = text.attr('data-block-id')
    let block = document.querySelector('[data-quando-id="'+block_id+'"]')

    if (block) {
      let input = block.querySelector('[data-quando-robot="say"]')

      if (input.value != text.val()) { // i.e has changed
        input.value = text.val()
        // Also update undo stack and resize
        input.dispatchEvent(new Event('change'))
      }
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

export function add_robot_voice_tuning(event) {
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

export function handle_help(type = false) {
    let url = "/inventor/help/help.html"
    if (type) { url += "#" + type }
    window.open(url, "quando_help").focus()
  }

window.onload = setup()