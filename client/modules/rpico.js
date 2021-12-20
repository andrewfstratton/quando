let quando = window.quando
if (!quando) {
  alert('Fatal Error: rpico must be included after client.js')
}

  let self = quando.rpico = {}
  let last_servo = [] // FIX change to let

  function _rpico_send(key, val) {
    fetch('/maker_pi_rp2040/' + key, { method: 'POST', 
      mode: "no-cors",
      body: JSON.stringify({'val':val}), 
      headers: {"Content-Type": "application/json"}
    })
  }

  self.turn = (val, servo, middle, plus_minus, inverted) => {
    if (val === false) { val = 0.5 }
    let min = middle - plus_minus
    let max = middle + plus_minus
    if (inverted) {
      val = 1-val
    }
    let angle = 360 + Math.round(((max - min) * val) + min)
    // add 360 so 0 can be a parsing error for circuitpython
    let last_angle = last_servo[servo]
    if (last_angle != angle) {
      last_servo[servo] = angle
      _rpico_send('turn', {'servo':servo, 'angle':angle}) // servo is 1 to 4
    }
  }