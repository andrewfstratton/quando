let quando = window.quando
if (!quando) {
  alert('Fatal Error: rpico must be included after client.js')
}

  let self = quando.rpico = {}
  let last_servo = [] // FIX change to let

  function _send(dest, key, val) {
    fetch(dest + key, { method: 'POST', 
      mode: "no-cors",
      body: JSON.stringify(val), 
      headers: {"Content-Type": "application/json"}
    })
  }

  function _maker_pico_send(key, val) {
    _send('/control/maker_pi_rp2040/', key, val)
  }

  function _pico_w_send(key, val) {
    _send('/control/rpi_pico_w/', key, val)
  }

  function _badger_2040_send(key, val) {
    _send('/control/badger2040/', key, val)
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
      _maker_pico_send('turn', {'servo':servo, 'angle':angle}) // servo is 1 to 4
    }
  }

  self.led = (val) => {
    let on_off = 0 // N.B. Sent as int 0 or 1 only
    if (val && (val > 0.5)) {
      on_off = 1
    }
    _pico_w_send('led', {'on_off': on_off})
  }

  self.gamepad_button = (val, button_num, press_release) => {
    // N.B. Sent as string 0 or 1 only
    let press = '0' // default to release
    if (press_release == 'press') {
      press = '1'
    } else if (press_release == 'either') {
      if (val && (val > 0.5)) {
        press = '1'
      }
    }
    if (button_num <= 15) {
      button_num++ // increment so B0 is passed as 1 so empty is detected as 0
      _badger_2040_send('button', {'num': button_num, 'press': press})
      // _pico_w_send('button', {'num': button_num, 'press': press})
    }
  }