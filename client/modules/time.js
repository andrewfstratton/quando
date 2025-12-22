import * as destructor from "./destructor.js";

const quando = window['quando']
if (!quando) {
  alert('Fatal Error: time.js must be included after client.js')
}
let self = quando.time = {}

self.units_to_ms = (units, count) => {
  let result = count
  if (units == "minutes")  {
    result *= 60
  } else if (units == "hours")  {
    result *= 60*60
  }
  return result * 1000 // convert to ms
}

self.after = (count = 1, units = 'seconds', callback) => {
  let time_ms = self.units_to_ms(units, count)
  let timeout = setTimeout(callback, time_ms)
  destructor.add( () => {
    clearTimeout(timeout)
  })
}

self.every = (count = 1, units = 'seconds', callback) => {
  callback() // Call now
  let time_ms = self.units_to_ms(units, count)
  let interval_id = setInterval(callback, time_ms)
  destructor.add( () => {
    clearInterval(interval_id)
  })
}

self.unit_to_time = (units) => {
  let time = 1
  if (units == 'minute') {
    time = 60
  } else if (units == 'hour') {
    time = 60*60
  } else if (units == 'day') {
    time = 60*60*24
  }
  return time
}

self.per = (times, units, callback) => {
  let time = self.unit_to_time(units)
  let count = time / times
  self.every(count, 'seconds', callback)
}

let _pulses = {}
let DOWN = 1, UP = 0

function cancel_up(_pulse) {
  if (!_pulse.up_id) { // nothing scheduled
    return
  }
  clearTimeout(_pulse.up_id) // cancel scheduled up
  _pulse.up_id = false
}

function _if_neq_fn(pulse, property, state, fn) {
  if (pulse[property] != state) {
    fn(state)
    pulse[property] = state
  }
}

function _pulse_mirror_fn(_pulse, fn_low, fn_high) {
  // scale 0.5..1 to 0..1 and 0.5..0 to 0..1 (inverted)
  let val = Math.abs((_pulse.val - 0.5) * 2)
  if (val == 0) {
    _if_neq_fn(_pulse, 'low', UP, fn_low)
    _if_neq_fn(_pulse, 'high', UP, fn_high)
    return
  }
  if (_pulse.val > 0.5) { // high part of mirror
    _if_neq_fn(_pulse, 'low', UP, fn_low)
    _if_neq_fn(_pulse, 'high', DOWN, fn_high)
    if (val == 1) { // at the limit, so no pulse
      return
    }
    _pulse.up_id = setTimeout(() => { // schedule release
      _if_neq_fn(_pulse, 'high', UP, fn_high)
      cancel_up(_pulse)
    }, val * _pulse.width_ms)
  } else { // low part of mirror, i.e. _pulse.val < 0.5
    _if_neq_fn(_pulse, 'high', UP, fn_high)
    _if_neq_fn(_pulse, 'low', DOWN, fn_low)
    if (val == 1) { // at the limit, so no pulse
      return
    }
    _pulse.up_id = setTimeout(() => { // schedule release
      _if_neq_fn(_pulse, 'low', UP, fn_low)
      cancel_up(_pulse)
    }, val * _pulse.width_ms)
  }
}

function _pulse_single_fn(_pulse, fn) {
  if (_pulse.val == 0) {
    _if_neq_fn(_pulse, 'low', UP, fn)
    return
  }
  _if_neq_fn(_pulse, 'low', DOWN, fn)
  if (_pulse.val == 1) {
    return
  }
  _pulse.up_id = setTimeout(() => { // schedule release
    _if_neq_fn(_pulse, 'low', UP, fn)
    cancel_up(_pulse)
  }, _pulse.val * _pulse.width_ms)
}

self.pulse = (persec = 5, mirror = false, id, inverted, val, callback_low, callback_high) => {
  if (inverted) {
    val = 1-val
  }
  let _pulse = _pulses[id]
  if (_pulse != undefined) { // already setup - just change val
    _pulse.val = val
    return
  }
  // first time setup
  let width_ms = 1000 / persec // width of pulse
  _pulses[id] = _pulse = { up_id: false, low: UP, high:UP, width_ms: width_ms, val: val }
  let check_fn = () => { // called every persec
    if (!mirror) {
      _pulse_single_fn(_pulse, callback_low)
      return
    }
    _pulse_mirror_fn(_pulse, callback_low, callback_high)
  }
  _pulse.check = setInterval(check_fn, width_ms)
  check_fn() // call immediately
  destructor.add(() => {
    clearInterval(_pulse.check)
    cancel_up(_pulse)
    callback_low(UP) // release
    if (mirror) {
      callback_high(UP)
    }
    delete _pulses[id]
  })
}

self.vary = (count, units, loop, per, per_units, inverted, callback) => {
  let time_ms = self.units_to_ms(units, count)
  let start_time = new Date().getTime()
  let interval_ms = self.units_to_ms(per_units, 1) / per
  let once = (loop == 'once')
  let seesaw = (loop == 'seesaw')
  let check_fn = ()=>{
    let now = new Date().getTime()
    let val = (now - start_time) / time_ms
    if (once && (val >= 1)) {
      // we've exceeded the limit - so call one last time at the limit
      val = 1
      // Note: interval_id has already been set below - dangerous to rearrange.
      clearInterval(interval_id) // kill the interval
    } else {
      let iteration = Math.floor(val)
      val -= iteration // get the fractional part
      if (seesaw && (iteration % 2)) {
        val = 1 - val
      }
    }
    if (inverted) { val = 1 - val }
    callback(val)
  }
  let interval_id = setInterval(check_fn, interval_ms)
  check_fn() // Call now
  destructor.add(() => {
    clearInterval(interval_id)
  })
}

function _tidy_filter(filter, near) {
  // average any in last segment
  let {times, segments} = filter
  let new_val = filter.current
  if (times.length > 0) {
    let total = 0
    let count = times.length
    while (times.length > 0) {
      total += times.shift()['val'] // we don't care about the time order...
    }
    new_val = total/count
  }
  segments.push(new_val)
  // prune segments not needed
  if (segments.length > ((2*near)+1)) {
    segments.shift()
  }
}

function _update_val(type, segments, callback) {
  if (type == 'average') {
    let total = segments.reduce((sum,x)=>sum+x)
    if (segments.length > 0) {
      callback(total/segments.length)
    }
  }
}

let _filters = {}
const MAX_PS = 1000/150 // limit updates to 150/second
self.filter = (type, times_per, units, near, id, val, callback) => {
  let _filter = _filters[id]
  if (!_filter) {
    let time = self.unit_to_time(units)
    let per_ms = 1000 * time / times_per
    if (per_ms < MAX_PS) { per_ms = MAX_PS }
    _filters[id] = _filter = {times: [], segments:[]}
    _filter.check = setInterval(()=>{
      _tidy_filter(_filter, near)
      _update_val(type, _filter.segments, callback)
    }, per_ms)
    destructor.add(() => {
      clearInterval(_filter.check)
      delete _filters[id]
    })
  }
  // set as current and add this value
  _filter.current = val
  _filter.times.push({'time': new Date().getTime(), 'val': val})
}