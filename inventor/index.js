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

self.setElementHandlers = (elem) => {
    elem.addEventListener('contextmenu', self.handleRightClick, false)
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
  dragula([menu, script], {
      removeOnSpill: true,
      copy: function (elem, source) {
          return source === menu
      },
      isContainer: function (el) {
          return el.classList.contains('quando-box')
      },
      accepts: function (elem, target) {
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
      }}).on ('drop', function (elem) {
          index.setElementHandlers(elem)
      }).on ('cloned', function (clone, old, type) {
          if (type == 'copy') {
              index.copyValues(old, clone)
          }
  })
}

self.setup = () => {
  // window.onbeforeunload = () => {
      // return 'Are you sure you want to leave the editor?' // Doesn't seem to show this message in Chrome?!
  // }

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

self.getParams_Code = function(block) {
    let params = {}
    let code = ""
    let children = block.children
    for (let child of children) {
        if (child.name) {
            params[child.name] = child.value
        }
        if (child.classList.contains("quando-box")) {
            code = "() => {\n"
            code += self.generateCode(child)
            code += "}"
        }
    }
    if (params == {}) {
        params = false
    }
    if (code == "") {
        code = false
    }
    return [params, code]
}
    
self.getCode = function(block) {
    let [params, code] = self.getParams_Code(block)
    let result = block.dataset.quandoFn + "("
    if (params) {
        result += JSON.stringify(params)
    }
    if (code) {
        result += ", " + code
    }
    result += ')'
    return result
}

self.generateCode = function(elem) {
    let children = elem.children
    let result = ""
    for (let child of children) {
        result += self.getCode(child)
        result += '\n'
    }
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
    $('#show_modal_code').html(code)
  }

})()

window.onload = index.setup()
