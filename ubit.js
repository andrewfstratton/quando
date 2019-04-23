let serialport = null, serial = null
let servo_angles = []
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
const find_microbit = (error, success) => {
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
  if (serial) {
    // there is a micro:bit connected...
    for (let servo=1; servo<=3; servo++) {
    // let msg = '' // may use to concatenate servo angle changes...
      // This should be the 'most' changed angle...or oldest change...
      if (servo_angles[servo]) {
        let angle = servo_angles[servo]
        servo_angles[servo] = false // indicate that it's been sent
        exports.send('T', `${angle},${servo}`)
        break;
      }
    }
  }
}

exports.get_serial = (error, success) => {
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

exports.send = (key, val) => {
  if (serial) {
    let msg = `${key}=${val}\n`
    serial.write(msg, (err) => {
      if (err) {
        console.log('Error on write: ', err.message)
      }
    })
  }
}

exports.turn = (servo, angle) => {
  // console.log("store "+servo+":"+angle)
  servo_angles[servo] = angle
}