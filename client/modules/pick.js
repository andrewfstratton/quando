(() => {
  let quando = this['quando']
  if (!quando) {
      alert('Fatal Error: pick.js must be included after quando_browser')
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

  self.one = (id) => {
    let arr = _list[id]
    if (arr.length > 0) {
      if (!arr.hasOwnProperty('index')) {
        arr.index = 0
      }
      let fn = arr[arr.index]
      if (++arr.index >= arr.length) {
        arr.index = 0
      }
      if (typeof fn === 'function') { fn() }
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