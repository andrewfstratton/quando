(() => {
  let quando = this['quando']
  if (!quando) {
      alert('Fatal Error: pick.js must be included after client.js')
  }
  let self = quando.pick = {}
  let _list = {}
  let _list_temp = {}
  let _last_pick = []

  function _pick(val, arr, id, type) {
    if (val === false) {
      val = 0.5
    }
    let i = Math.floor(val * arr.length)
    if (i == arr.length) {
      i--
    }
    if (type == "Different") {
      if (i != _last_pick[id]) {
        arr[i]()
        _last_pick[id] = i
      } else {
        self.random(id, type)
      }
    } else {
      arr[i]()
      _last_pick[id] = i
    }
    if (type == "Reorder") {
      arr.splice(i, 1)
    }
  }


  self.random = (id, type) => {
    //if all things in temp list have been executed, reset list
    if (_list_temp[id].length == 0) {
      _list_temp[id] = [..._list[id]]
    }
    //pick random from list
    let r = Math.random()
    _pick(r, _list_temp[id], id, type)
  }

  self.set = (id, arr) => {
    _list[id] = arr
    _list_temp[id] = [..._list[id]] //set _list_temp as copy of _list
  }

  self.reset = (id) => {
    let arr = _list[id]
    delete arr.index
  }

  self.one = (id, message, next) => {
    let arr = _list[id]
    if (arr.length > 0) {
      if (!arr.hasOwnProperty('index')) {
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

  self.every = (id, time, duration) => {
    let arr = _list[id]
    if (arr.length > 0) {
      arr.index = 0 // start at 0
      let ms = time * 1000
      if (duration == 'minutes') {
        ms *= 60
      } else if (duration == 'hours') {
        ms *= 60*60
      }
      let every_fn = () => {
        let fn = arr[arr.index]
        if (++arr.index >= arr.length) {
          arr.index = 0
        }
        if (typeof fn === 'function') { fn() }
      }
      every_fn() // Call now
      let id = setInterval(every_fn, ms)
      quando.destructor.add(() => {
        clearInterval(id)
      })
    }
  }

})()