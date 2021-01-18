import * as destructor from "./destructor.js";

const quando = window['quando']
if (!quando) {
    alert('Fatal Error: pick.js must be included after client.js')
}
let self = quando.pick = {}
let _list = {}
let _list_temp = {}
let _last_pick = []

function _pick(val, arr, block_id, type) {
  if (val === false) {
    val = 0.5
  }
  let i = Math.floor(val * arr.length)
  if (i == arr.length) {
    i--
  }
  if (type == "Different") {
    if (i != _last_pick[block_id]) {
      arr[i]()
      _last_pick[block_id] = i
    } else {
      self.random(block_id, type)
    }
  } else {
    arr[i]()
    _last_pick[block_id] = i
  }
  if (type == "Reorder") {
    arr.splice(i, 1)
  }
}


self.random = (block_id, type) => {
  //if all things in temp list have been executed, reset list
  if (_list_temp[block_id].length == 0) {
    _list_temp[block_id] = [..._list[block_id]]
  }
  //pick random from list
  let r = Math.random()
  _pick(r, _list_temp[block_id], block_id, type)
}

self.set = (block_id, arr) => {
  _list[block_id] = arr
  _list_temp[block_id] = [..._list[block_id]] //set _list_temp as copy of _list
}

self.reset = (block_id) => {
  let arr = _list[block_id]
  delete arr.index
}

self.one = (block_id, message, next) => {
  let arr = _list[block_id]
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
    quando.add_message_handler(message, () => self.reset(block_id))
  }
}

self.val = (block_id, val) => {
  let arr = _list[block_id]
  if (val === false) {
    val = 0.5
  }
  let i = Math.floor(val * arr.length)
  if (i == arr.length) {
    i--
  }
  arr[i]()
}

self.every = (block_id, time, duration) => {
  let arr = _list[block_id]
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
    let interval_id = setInterval(every_fn, ms)
    destructor.add(() => {
      clearInterval(interval_id)
    })
  }
}