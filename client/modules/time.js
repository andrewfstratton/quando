(() => {
  let quando = this['quando']
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
    quando.destructor.add( () => {
      clearTimeout(timeout)
    })
  }

  self.every = (count = 1, units = 'seconds', callback) => {
    callback() // do it straight away
    let time_ms = self.units_to_ms(units, count)
    let id = setInterval(callback, time_ms)
    quando.destructor.add( () => {
      clearInterval(id)
    })
  }

  self.per = (times = 1, units = 'second', callback) => {
    let time = 1
    if (units == 'minute') {
      time = 60
    } else if (units == 'hour') {
      time = 60*60
    } else if (units == 'day') {
      time = 60*60*24
    }
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
        clearInterval(id) // kill the interval
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
    check_fn(0) // Call now at beginning of val
    let id = setInterval(check_fn, interval_ms)
    quando.destructor.add(() => {
      clearInterval(id)
    })
  }

})()
