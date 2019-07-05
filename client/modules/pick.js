(() => {
  let quando = this['quando']
  if (!quando) {
      alert('Fatal Error: pick.js must be included after client.js')
  }
  let self = quando.pick = {}
  let _list = {}

  function _pick(val, arr) {
    if (val === false) {
      val = 0.5
    }
    let i = Math.floor(val * arr.length)
    if (i == arr.length) {
      i--
    }
    arr[i]()
  }


  self.random = (id) => {
    let r = Math.random()
    _pick(r, _list[id])
  }

  self.set = (id, arr) => {
    _list[id] = arr
  }

  self.reset = (id) => {
    let arr = _list[id]
    if (arr.hasOwnProperty('index')) {
      if (arr.next) {
        arr.index = 0
      } else {
        arr.index = arr.length-1
      }
    }
  }

  self.one = (id, message, next) => {
    let arr = _list[id]
    if (arr.length > 0) {
      if (!arr.hasOwnProperty('index')) {
        arr.next = next
        if (next) {
          arr.index = 0 // Start at beginning
        } else { // start at end
          arr.index = arr.length-1
        }
      }
      let fn = arr[arr.index]
      if (next) {
        if (++arr.index >= arr.length) {
          arr.index = 0
        }
      } else {
        if (--arr.index < 0) {
          arr.index = arr.length-1
        }
      }
      if (typeof fn === 'function') { fn() }
    }

    if (message.length) {
      quando.add_message_handler(message, () => self.reset(id))
    }
  }

  self.val = (id, val) => {
    let arr = _list[id]
    if (val === false) {
      val = 0.5
    }
    let i = Math.floor(val * arr.length)
    if (i == arr.length) {
      i--
    }
    arr[i]()
  }

})()