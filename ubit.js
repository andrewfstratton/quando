let serialport = null, serial = null
let servo_angles = false
try {
  serialport = require('serialport')
} catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND') {
    throw e
  }
}
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
  if (serial  && servo_angles) {
    // there is at least one angle that's been set - and there's a micro:bit connected?!
    let i=0
    let finished = false
    // let msg = '' // may use to concatenate servo angle changes...
    while (!finished) { // look for the first changed servo angle
      // This should be the 'most' changed angle...or oldest change...
      if (servo_angle[i] != undefined) {
        let servo = i
        let angle = servo_angles[i]
        if (servo_angles.length == 1) {
          servo_angles = false
        } else {
          delete servo_angles[i]
        }
        ubit.send('T', `${angle},${servo}`)
        finished = true
      } else if (i++ >= servo_angles.length) {
        finished = true
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
          setTimeout(check_send, 1000/50) // i.e. 50 times a second
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
  if (servo_angles === false) {
    servo_angles = []
  }
  servo_angles[servo] = angle
}