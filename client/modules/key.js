(() => {
  let quando = this['quando']
  if (!quando) {
    alert('Fatal Error: key must be included after quando_browser')
  }
  let self = quando.key = {}
  let key_pressed = {}
  let keyFlag = false

  function handle_keys(event) {
    if (!event.repeat) {
      let handlers = key_pressed[event.key]
      for (let id in handlers) {
        handlers[id](event.ctrlKey, event.altKey, event.shiftKey)
      }
    }
  }

  self.handleKey = (id, key, ctrl=false, alt=false, shift=false, callback) => {
    let handlers = key_pressed[key]
    if (!handlers) {
      handlers = key_pressed[key] = {}
    }
    handlers[id]=(e_ctrl, e_alt, e_shift) => {
      if ((ctrl == e_ctrl) && (e_alt == alt) && (e_shift == shift)) {
        callback()
      }
    }
    quando.destructor.add(() => {
      delete handlers[id]
    })
  }

  addEventListener('keydown', handle_keys)
})()
