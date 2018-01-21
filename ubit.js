const serialport = require('serialport')

// list serial ports:
const find_microbit = (error, success) => {
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
}

exports.get_serial = (error, success) => {
  find_microbit(error, (comName) => {
    let serial = new serialport(comName, {baudRate: 115200, parser: serialport.parsers.readline('\n')}, (err) => {
      if (err) {
        error(err)
      } else {
        success(serial)
      }
    })
  })
}
/* e.g.
get_serial((err)=>{console.log("Error:" + err)},
    (serial)=>{
        serial.on('data', (data) => {
            let ubit = JSON.parse(data)
            if (ubit.button == 'a') {
                console.log('Button A Pressed')
            }
            if (ubit.button == 'b') {
                console.log('Button B Pressed')
            }
            if (ubit.ir) {
                console.log('Visitor detected')
            }
        })
    })
    */
