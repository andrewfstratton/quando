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

})()
