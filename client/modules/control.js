import * as text from "/common/text.js";

let quando = window['quando']
if (!quando) {
  alert('Fatal Error: control must be included after quando_browser')
}

  let self = quando.control = {}

  function _send(command, arg) {
    fetch('/control/' + command, { method: 'POST', 
      mode: "no-cors",
      body: JSON.stringify(arg), 
      headers: ({"Content-Type": "text/plain"})
    })
  }

  self.type = (str) => {
    _send('type', text.decode(str))
  }

  self.key = (ch, up_down, shift, ctrl, alt, on_off) => {
    // ch is a character, or character description string
    let press = false
    switch (up_down) {
      case 'down':
        press = true
        break
      case 'either':
        if (on_off && (on_off > 0.5)) {
          press = true
        }
    }
    let key_data = {'key':ch, 'shift':shift, 'ctrl':ctrl, 'alt':alt, 'press':press}
    _send('key', key_data)
  }
