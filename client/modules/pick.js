import * as destructor from "./destructor.js";

const quando = window['quando']
if (!quando) {
    alert('Fatal Error: pick.js must be included after client.js')
}
let self = quando.pick = {}
let _list = {}
let _list_temp = {}
let _last_pick = []

self.random = (block_id, type, val, txt) => {
  //if all things in temp list have been executed, reset list
  let block_list = _list_temp[block_id]
  if (block_list.length == 0) {
    _list_temp[block_id] = block_list = [..._list[block_id]]
  }
  //pick random from list
  let r = Math.random()
  let i = Math.floor(r * block_list.length)
  if (i == block_list.length) {
    i--
  }
  if (i >= 0) { // skip when empty
    if ((type == "Different") && (block_list.length > 1)) {
      if (i != _last_pick[block_id]) {
        block_list[i](val, txt)
        _last_pick[block_id] = i
      } else {
        self.random(block_id, type) // TODO remove recursion
      }
    } else { // only one block to pick from
      block_list[i](val, txt)
      _last_pick[block_id] = i
    }
    if (type == "Reorder") {
      block_list.splice(i, 1) // remove the chosen block
    }
  }
}

self.set = (block_id, arr) => {
  _list[block_id] = arr
  _list_temp[block_id] = [..._list[block_id]] //set _list_temp as copy of _list
  _last_pick[block_id] = -1
}

self.reset = (block_id) => {
  let arr = _list[block_id]
  delete arr.index
}

self.one = (block_id, message, next, val, txt) => {
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
    if (typeof fn === 'function') { fn(val, txt) }
  }

  if (message.length) {
    quando.message.add_handler(message, () => self.reset(block_id))
  }
}

self.val = (block_id, val) => {
  let arr = _list[block_id]
  const len = arr.length
  if (len > 0) { // must have at least one block to execute
    let block = Math.floor(val * len)
    if (block == len) {
      block--
    }
    let last_block = _last_pick[block_id]
    if (last_block != block) { // i.e. we have changed block
      let boundary_fn = arr[block]
      if (typeof boundary_fn === 'function') {
        boundary_fn()
      }
      _last_pick[block_id] = block
    }
  }
}

self.every = (block_id, time, duration, val, txt) => {
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
      if (typeof fn === 'function') { fn(val, txt) }
    }
    every_fn() // Call now
    let interval_id = setInterval(every_fn, ms)
    destructor.add(() => {
      clearInterval(interval_id)
    })
  }
}