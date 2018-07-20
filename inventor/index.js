(() => {
let self = this['index'] = {}

    self.getParams = function(block) {
        let params = {}
        let children = block.children
        for (let child of children) {
            if (child.name) {
                params[child.name] = child.value
            }
        }
        if (params == {}) {
            params = false
        }
        return params
    }

self.handleRightClick = function(event) {
    event.preventDefault()
    return false
}

self.getCode = function(block) {
    let params = self.getParams(block)
    let result = block.dataset.quando_fn
    if (params) {
        result += '(' + JSON.stringify(params) + ')'
    } else {
        result += '()'
    }
    return result
}

self.say = ({text = ''}={}) => {
    alert(text)
}

self.setup = () => {
    window.onbeforeunload = () => {
        return 'Are you sure you want to leave the editor?' // Doesn't seem to show this message in Chrome?!
    }

    for (let item of document.getElementsByClassName("block")) {
        item.addEventListener('contextmenu', self.handleRightClick, false)
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

self.generateCode = function() {
    let script = document.getElementById('script')
    let children = script.children
    let result = ""
    for (let child of children) {
        result += self.getCode(child) + '\n'
    }
    return result
}

self.handle_test = () => {
    let code = self.generateCode()
    if (code) {
      let filename = '_'
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
})()

window.onload = index.setup()
let menu = document.getElementById('menu')
let script = document.getElementById('script')
dragula([menu, script], {
    revertOnSpill: true,
    copy: function (elem, source) {
        return source === menu
    // },
    // accepts: function (elem, target) {
        // return target === script
    }}).on ('drop', function (elem) {
        elem.oncontextmenu = index.handleRightClick
    })

