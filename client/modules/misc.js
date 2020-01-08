(() => {
  let quando = this['quando']
  if (!quando) {
    alert('Fatal Error: misc.js must be included after client.js')
  }
  let self = quando.misc = {}
  let _adjusters = {}

  function tidy_adjuster(adjuster) { // collect any values since the last 'per' cycle
    let total = adjuster.latest // this value is used if no new ones are found
    let count = 1
    let vals = adjuster.vals
    if (vals.length > 0) {
      adjuster.latest = vals[vals.length - 1] // we need to keep the latest value
      while (vals.length > 0) {
        total += vals.shift()
        count++
      }
    }
    let average = total / count
    let adjust_val = average * adjuster.per_fraction
    return adjust_val
  }

  self.adjust = (block_id, val_in, count, units, times_per, per_units, wrap, inverted, callback) => {
    let _adjuster = _adjusters[block_id]
    if (!_adjuster) {
      let min_time = quando.time.units_to_ms(units, count)
      let check_ms = 1000 * quando.time.unit_to_time(per_units) / times_per
      _adjusters[block_id] = _adjuster = {
        val: 0.5, // Start in the middle (?)
        time_over: min_time,
        latest: val_in, // first time setup
        per_fraction: check_ms / min_time, // this is the fraction of the cycle time to the minimum time to adjust
        vals: []
      }

      _adjuster.check = setInterval(() => {
        let adjust_val = tidy_adjuster(_adjuster)
        let target_val = _adjuster.val
        target_val += adjust_val
        if (wrap) {
          while (target_val > 1) {
            target_val -= 1
          }
          while (target_val < 0) {
            target_val += 1
          }
        } else {
          target_val = Math.min(Math.max(target_val, 0), 1) // Clamp val
        }
        if (target_val != _adjuster.val) { // it changed
          _adjuster.val = target_val
          callback(target_val)
        }
      }, check_ms)
    }

    let val = (val_in - 0.5) * 2 // i.e. adjust up or down
    if (inverted) { val *= -1 }
    _adjuster.vals.push(val)
    quando.destructor.add(() => {
      clearInterval(_adjuster.check)
      delete _adjusters[id]
    })
  }

  self.scale = (val, max, callback) => {
    callback(''+Math.round(val*max))
  }
})()
