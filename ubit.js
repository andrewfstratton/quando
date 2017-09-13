const serialport = require('serialport');
 
// list serial ports:
const find_microbit = (error, success) => {
    serialport.list( (err, ports) => {
        if (err) {
            error(err)
        } else {
            var comName = null;
            ports.forEach(function(port) {
                if ((port.vendorId == "0D28") && (port.productId == "0204"))
                    comName = port.comName
console.log(JSON.stringify(port))
            });
            if (comName != null) {
                success(comName)
            } else {
                error("Could not find micro:bit.")
            }
        }
    });
}

exports.get_serial = (error, success) => {
    find_microbit(error, (comName) => {
        var serial = new serialport(comName, {baudRate: 115200, parser: serialport.parsers.readline('\n')}, (err) => {
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
            var ubit = JSON.parse(data)
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