(() => {
  let quando = this['quando']
  if (!quando) {
    alert('Fatal Error: key must be included after quando_browser')
  }
  let self = quando.key = {}
  let key_pressed = {}

  function handle_keys(event) {
    if (!event.repeat) {
      let handlers = key_pressed[event.key]
      for (let i in handlers) {
        handlers[i](event.ctrlKey, event.altKey)
      }
    }
  }

  self.handleKey = (key, ctrl=false, alt=false, callback) => {
    let handlers = key_pressed[key]
    if (!handlers) {
      handlers = key_pressed[key] = []
    }
    handlers.push((e_ctrl, e_alt) => {
      if ((ctrl == e_ctrl) && (e_alt == alt)) {
        callback()
      }
    })
  }

  addEventListener('keydown', handle_keys)
})()