(() => {
let self = this['index'] = {}

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

