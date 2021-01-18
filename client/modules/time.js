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
  let new_val = filter.latest
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
const MAX_PS = 1000/150 // limit updates to 1500/second
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
  }
  // set as latest and add this value
  _filter.latest = val
  _filter.times.push({'time': new Date().getTime(), 'val': val})
  destructor.add(() => {
    clearInterval(_filter.check)
    delete _filters[id]
  })
}