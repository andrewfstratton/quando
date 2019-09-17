(() => {
  let quando = this['quando']
  if (!quando) {
      alert('Fatal Error: pick.js must be included after client.js')
  }
  let self = quando.pick = {}
  let _list = {}
  let _list_temp = {}
  let _last_pick = []

  // self.pick = function(val, arr) {
  //   if (val === false) {
  //     val = 0.5
  //   }
  //   var i = Math.floor(val * arr.length)
  //   if (i == arr.length) {
  //     i--
  //   }
  //   arr[i]()
  //   arr.splice(i, 1)
  // }

  // self.pick_random = function(arr) {
  //   alert('r'+randArr)
  //   if (randArr == []) {
  //     randArr = arr
  //   } else {
  //     var r = Math.random()
  //     self.pick(r, randArr)
  //   }   
  // }

  function _pick(val, arr, id, type) {
    if (val === false) {
      val = 0.5
    }
    let i = Math.floor(val * arr.length)
    if (i == arr.length) {
      i--
    }
    if (type == "dr") {
      // alert('i: ' + i + ', last: ' + _last_pick[id])
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

})()