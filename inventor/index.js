// support the inventor (editor) page
(() => {
let self = this['index'] = {}
let _userid = null
let _deploy = ''
let _remote_list = []
let PREFIX = 'quando_'

function _setTmpForSave(node) {
  if (node.selectedIndex) {
    node.dataset.quandoTmpSelected = node.selectedIndex
  } else if (node.value) {
    node.dataset.quandoTmpValue = node.value
  }
  if (node.hasChildNodes()) { // need to recurse down tree
    let childNodes = node.children
    for (let i=0; i<childNodes.length; i++) {
      _setTmpForSave(childNodes[i])
    }
  }
}

function _removeTmpForSave(node) {
  delete node.dataset.quandoTmpValue
  delete node.dataset.quandoTmpSelected
  if (node.hasChildNodes()) { // need to recurse down tree
    let childNodes = node.children
    for (let i=0; i<childNodes.length; i++) {
      _removeTmpForSave(childNodes[i])
    }
  }
}

function _getHtml () {
    let script = document.getElementById('script')
    _setTmpForSave(script) // populate data-quando-tmp-[value, selected]
    let html = script.innerHTML
    _removeTmpForSave(script)
    return html
}

function _getTmpFromLoad(node) {
  if (node.dataset.quandoTmpSelected) {
    node.selectedIndex = node.dataset.quandoTmpSelected
  } else if (node.dataset.quandoTmpValue) {
    node.value = node.dataset.quandoTmpValue
  }
  if (node.hasChildNodes()) { // need to recurse down tree
    let childNodes = node.children
    for (let i=0; i<childNodes.length; i++) {
      _getTmpFromLoad(childNodes[i])
    }
  }
}

function _showHtml (html) {
    let script = document.getElementById('script')
    script.innerHTML = html
    _getTmpFromLoad(script) // populate values and selected from dataset
    _removeTmpForSave(script)
}

self.handleRightClick = function(event) {
    event.preventDefault()
    return false
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

self.handleLeftClick = function(event) {
  event.preventDefault()
  _leftClickTitle(event.target)
  return false
}

function _handleListNameChange(event) {
  let target = event.target
  let ancestor = target.parentElement
  while (ancestor && !ancestor.classList.contains("quando-block")) {
    ancestor = ancestor.parentElement
  }
  if (ancestor) {
    let id = ancestor.dataset.quandoId
    if (id != null && id != "true") {
      let list_name = target.dataset.quandoList
      if (list_name) {
        let selects = document.querySelectorAll("select[data-quando-list='" + list_name + "']")
        for(let select of selects) {
          let option = select.querySelector("option[value='" + id + "']")
          if (option) {
            option.textContent = target.value
          }
        }
      }
    }
  }
}

self.setElementHandlers = (elem) => {
    elem.addEventListener('contextmenu', self.handleRightClick, false)
    // add handler for list item change
    let id = elem.dataset.quandoId
    if (id && id != "true") {
      let inputs = elem.querySelectorAll("input[data-quando-list]")
      for (let input of inputs) {
        input.addEventListener('input', _handleListNameChange)
      }
    }
}

self.copyValues = (old, clone) => {
    if (old.hasChildNodes()) {
        let oldNodes = old.children
        let cloneNodes = clone.children
        for (let i=0; i<oldNodes.length; i++) {
            let val = oldNodes[i].selectedIndex
            if (val) {
                cloneNodes[i].selectedIndex = val // N.B. Only works for single selection  - but Ctrl click is not used in Quando
            }
        }
    }
    if (old.dataset.quandoId) {
      let _id = 0
      while (document.querySelector(`[data-quando-id='${_id}']`)) {
        _id++
      }
      clone.dataset.quandoId=_id
      // has just created id - now add id to select options
      let input = old.querySelector("input[data-quando-list]")
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
}

self.hasAncestor = (elem, ancestor) => {
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
  let script = document.getElementById('script')
  let collections = []
  collections.push(script)
  collections.push(menu)
  let options = {}
  options.removeOnSpill = true
  options.copy = function (elem, source) {
    return source === menu
  }
  options.isContainer = function (el) {
    return el.classList.contains('quando-box')
  }
  options.accepts = function (elem, target) {
    let accept = true
    if (target === script) {
      // accept = true
    } else if (target === menu) {
      accept = false
    } else if (target.classList.contains('quando-box')) { // i.e. a valid container
      if (index.hasAncestor(target, menu)) {
        accept = false
      }
    } else {
      accept = false
    }
    return accept
  }
  options.invalid = (elem, handle) => {
    return elem.classList.contains("quando-title")
  }
  dragula(collections, options).on('drop', function (elem) {
    index.setElementHandlers(elem)
  }).on('cloned', function (clone, old, type) {
    if (type == 'copy') {
      index.copyValues(old, clone)
    }
  })
}

self.setup = () => {
  // window.onbeforeunload = () => {
      // return 'Are you sure you want to leave the editor?' // Doesn't seem to show this message in Chrome?!
  // }

  for (let elem of document.getElementsByClassName("quando-title")) {
    elem.addEventListener('click', self.handleLeftClick)
  }
  for (let item of document.getElementsByClassName("quando-block")) {
      self.setElementHandlers(item)
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
  let first_title = document.getElementsByClassName("quando-title")[0]
  if (first_title) {
    _leftClickTitle(first_title)
  }
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

  function _loaded (obj, modal_id, name) {
      _showHtml(obj.html)
      _deploy = obj.deploy
      $(modal_id).modal('hide')
      _success('Loaded...')
      $('#local_save_key').val(name)
      $('#remote_save_key').val(name)
      $('#file_name').html(name)
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

self.getCodeInBlock = function(block, prefix) {
    let code = ''
    if (block.dataset.quandoJavascript) {
      code = block.dataset.quandoJavascript
    }
    let right = block.querySelector(".quando-right")
    for (let row_box of right.children) { // i.e. for each row or box
      if (row_box.classList.contains("quando-row")) {
        for (let child of row_box.children) { // i.e. each input
          if (child.dataset.quandoName) {
            let match = '${' + child.dataset.quandoName + '}'
            while (code.indexOf(match) != -1) {
              code = code.replace(match, child.value)
            }
          }
        }
      } else if (row_box.classList.contains("quando-box")) {
        let indent = prefix + '  '
        let box_code = ''
        let blocks = row_box.children
        for (let block of blocks) {
          box_code += indent + self.getCode(block, indent + '  ')
        }
        if (row_box.dataset.quandoName) {
          let match = '${' + row_box.dataset.quandoName + '}'
          while (code.indexOf(match) != -1) {
            code = code.replace(match, box_code)
          }
        }
      }
    }
    let match = '${data-quando-id}'
    while (code.indexOf(match) != -1) {
      code = code.replace(match, block.dataset.quandoId)
    }
    return code
}
    
self.getCode = function(block, prefix) {
    let result = '' 
    if (block.dataset.quandoJavascript) {
      result = prefix + self.getCodeInBlock(block, prefix) + "\n"
    }
    return result
}

self.generateCode = function(elem) {
    let children = elem.children
    let result = ""
    for (let child of children) {
      result += self.getCode(child, '')
    }
    return result.replace(/\$\{\}/g, '\n') // replaces ${} with newline...for templates
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

self.handle_test = () => {
    let code = self.generateCode(document.getElementById('script'))
    if (code) {
      let filename = '-'
      $.ajax({
        url: '/script/deploy/' + encodeURI(filename),
        type: 'PUT',
        data: { javascript: code },
        success: () => {
          _success('Opening Test...')
          let deploy_window = window.open('/client/js/' + filename + '.js', 'quando_deployed_test',
                        'left=0,top=0,width=9999,height=9999')
          deploy_window.focus() // moveTo(0,0);
        },
        error: () => {
          alert('Failed to find server')
        }
      })
    } else {
      alert('Behaviour incomplete.')
    }
  }

  self.handle_save = () => {
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
  
  self.handle_local_save = () => {
    let key = $('#local_save_key').val()
    localStorage.setItem(PREFIX + key, JSON.stringify({
      deploy: _deploy,
      html: _getHtml(),
    }))
    $('#local_save_modal').modal('hide')
    _saved(key)
  }
  
  self.handle_remote_save = () => {
    let name = encodeURI($('#remote_save_key').val())
    let obj = JSON.stringify({ deploy: _deploy, html: _getHtml()})
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

  self.local_load = (key) => {
    let obj = JSON.parse(localStorage.getItem(key))
    let name = key.slice(PREFIX.length)
    _loaded(obj, '#local_load_modal', name)
  }
  
  self.remote_load = (index) => {
    $.ajax({
      url: '/script/id/' + _remote_list[index].id,
      success: (res) => {
        if (res.success) {
          let script = JSON.parse(res.doc.script)
          _loaded(script, '#remote_load_modal', res.doc.name)
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
    _update_remote_list()
  }

  self.handle_show_code = () => {
    $('#menu_dropdown').dropdown('hide')
    $('#show_modal_title').html('Show Code')
    $('#show_modal').modal('show')
    $('#show_modal_code').removeClass('language-xml').addClass('language-javascript')
    let code = self.generateCode(document.getElementById('script'))
    code = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    $('#show_modal_code').html(code)
  }

  self.handle_clear = () => {
    _info('Cleared...')
    _deploy = ''
    $('#file_name').html('[no file]')
    $('#local_save_key').val('')
    $('#remote_save_key').val('')
    _showHtml('')
  }

  function _file_list_add (file_name, path, fn_name, block_id, widget_id) {
    let result = '<div class="row"><div class="col-sm-1"> </div>' +
            '<a class="list-group-item col-md-5" onclick="index.' +
            `${fn_name}('${path}${file_name}', `
    if (block_id == null) {
      result += 'null'
    } else {
      result += `'${block_id}'`
    }
    result += `, '${widget_id}')">${file_name}</a>` +
            '</div>\n'
    return result
  }

  function _folder_list_add (folder_name, media, path, block_id, widget_id) {
    let result = '<div class="row"><div class="col-sm-1"> </div>' +
            '<a class="list-group-item col-md-5" onclick="index.' +
                `handle_folder_selected('${media}', `
    if (block_id == null) {
      result += 'null'
    } else {
      result += `'${block_id}'`
    }
    result += `, '${widget_id}', '${path}')">&#x1f5c1; ${folder_name}</a>` +
            '</div>\n'
    return result
  }

  self.handle_file = (media, block_id, widget_id, path = '') => {
        // when media is 'UPLOAD', then we are uploading, note then that block_id and widget_id are null
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
                            block_id, widget_id))
          }
          for (let i in res.folders) {
            $('#file_list').append(_folder_list_add(res.folders[i], media, path + '/' + res.folders[i],
                            block_id, widget_id))
          }
          if (path != '') {
            path = path.substring(1) + '/' // strip off the intial slash and put infront of the file
          }
          for (let i in res.files) {
            $('#file_list').append(_file_list_add(res.files[i], path,
                            'handle_file_selected', block_id, widget_id))
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

  self.handle_folder_selected = (media, block_id, widget_id, path) => {
    self.handle_file(media, block_id, widget_id, path)
  }

  self.handle_file_selected = (filename, block_id, widget_id) => {
        // When blocK-id is null, then this is an upload - so do nothing...
    if (block_id != null) {
      let block = Blockly.mainWorkspace.getBlockById(block_id)
      block.setFieldValue(filename, widget_id)
      $('#file_modal').modal('hide')
    }
        // TODO get/return/set filename
  }

  self.handle_upload_media = () => {
    if ($('#upload_media').val()) {
      self.handle_file('UPLOAD', null, null, '')
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
    let code = self.generateCode(document.getElementById('script'))
    if (code) {
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
})()

window.onload = index.setup()
