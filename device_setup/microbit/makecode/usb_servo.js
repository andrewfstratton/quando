/* Need to create .hex file with makecode - using javascript code tab */
basic.showLeds(`
    # # # . .
    . # . . .
    . . . . .
    . . # . #
    . . . # #
    `)
//basic.pause(750)
let icons = [IconNames.Happy, IconNames.Sad]

serial.writeLine("ubit started...")

while (true) {
    let txt = serial.readLine()
    let eq = txt.indexOf("=")
    let key = txt.substr(0, eq)
    let val = txt.substr(eq + 1)
    switch (key) {
        case 'display':
            basic.showString(val)
            break;
        case 'icon':
            basic.showIcon(icons[parseInt(val)])
            break;
        case 'T':
            // N.B. Display includes delay - so don't do....
            let comma = val.indexOf(',')
            let angle = parseInt(val.substr(0, comma))
            let servo = parseInt(val.substr(comma + 1))
//        serial.writeLine("angle=" + angle + ", servo=" + servo + ", val=" + val)
            let pin = AnalogPin.P20
            if (servo == 1) {
                pin = AnalogPin.P1
            } else if (servo == 2) {
                pin = AnalogPin.P2
            }
            if (pin != AnalogPin.P20) {
                pins.servoWritePin(pin, angle)
            }
            break;
    }
}