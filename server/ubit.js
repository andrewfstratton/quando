let missing_usb_reported = false
let serialport = null, serial = null
let send_buffer = {angle:[]}
let io = null

try {
  serialport = require('serialport')
} catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND') {
    throw e
  }
}

// Set the check for sending USB messages going - once only
setInterval(check_send, 1000/24) // i.e. 24 times a second

// list serial ports:
function find_microbit(error, success) {
  if (serialport) {
    serialport.list((err, ports) => {
      if (err) {
        error(err)
      } else {
        let comName = null
        ports.forEach((port) => {
          if ((port.vendorId == '0D28') && (port.productId == '0204')) {
            comName = port.comName
          }
        })
        if (comName != null) {
          success(comName)
        } else {
          error('Could not find micro:bit.')
        }
      }
    })
  } else {
    error('SerialPort missing...')
  }
}

function check_send() {
  if (serial) { // there is a micro:bit connected...
    let msg = ""
    if (send_buffer.icon) {
      msg += `I=${send_buffer.icon}\n`
    }
    if (send_buffer.display) {
      msg += `D=${send_buffer.display}\n`
    }
    for (let servo=1; servo<=3; servo++) {
      if (send_buffer.angle[servo]) {
        let angle = send_buffer.angle[servo]
        msg += `T=${angle},${servo}\n`
      }
    }
    if (msg != "") {
      send_buffer = {angle:[]} // Must reset
      serial.write(msg, (err) => {
        if (err) {
          console.log('Error on write: ', err.message)
        }
      })
    }
  }
}

function get_serial(error, success) {
  find_microbit(error, (comName) => {
    if (serialport) {
      serial = new serialport(comName, {baudRate: 115200}, (err) => {
        if (err) { 
          serial = false
          error(err)
        } else {
          let parser = serial.pipe(new serialport.parsers.Readline({ delimiter: '\r\n' }))
          success(serial, parser)
        }
      })
    } else {
      error('Failed to load serialport')
    }
  })
}

function usb_error (err) {
  if (!missing_usb_reported && err) {
    console.log("  Warning - " + err)
    missing_usb_reported = true
  }
  setTimeout(() => { get_serial(usb_error, usb_success) }, 1000)
    // Checks every second for plugged in micro:bit
}

function usb_success (serial, parser) {
  missing_usb_reported = false
  parser.on('data', (data) => {
    try {
      let ubit = JSON.parse(data.trim())
      if (ubit && io) {
        if (ubit.button_a) {
          io.emit('ubit', {button: 'a'})
        }
        if (ubit.button_b) {
          io.emit('ubit', {button: 'b'})
        }
        if (ubit.button_ab) {
          io.emit('ubit', {button: 'a'})
          io.emit('ubit', {button: 'b'})
        }
        if (ubit.ir) {
          io.emit('ubit', {ir: true})
        }
        if (ubit.orientation) {
          io.emit('ubit', {'orientation': ubit.orientation})
        }
        if (ubit.heading) {
          io.emit('ubit', {'heading': ubit.heading})
        }
        if (ubit.roll_pitch) {
          let roll = ubit.roll_pitch[0] *180/Math.PI
          let pitch = ubit.roll_pitch[1] *180/Math.PI
          io.emit('ubit', {'roll': roll, 'pitch': pitch})
        }
      }
    } catch (err) {
      console.log(err + ':' + data)
    }
  })
  serial.on('close', usb_error)
}

exports.usb = (_io) => {
  io = _io
  get_serial(usb_error, usb_success)
}

exports.turn = (servo, angle) => {
  send_buffer.angle[servo] = angle
}

exports.icon = (val) => {
  send_buffer.icon = val
}

exports.display = (val) => {
  send_buffer.display = val
}