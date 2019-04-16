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

//serial.writeLine("ubit started...")

while (true) {
    let txt = serial.readLine()
    let eq = txt.indexOf("=")
    let key = txt.substr(0, eq)
    let val = txt.substr(eq + 1)
    if (key == 'display') {
        basic.showString(val)
    } else if (key == 'icon') {
        basic.showIcon(icons[parseInt(val)])
    } else if (key == 'turn') {
        // N.B. Display includes delay - so don't do....
        let comma = val.indexOf(',')
        let servo = parseInt(val.substr(0, comma))
        let angle = parseInt(val.substr(comma + 1))
        serial.writeLine("msg=" + angle + ", val=" + val)
        switch (servo) {
            case 1: {
                pins.servoWritePin(AnalogPin.P1, angle)
                break;
            }
            case 2: {
                pins.servoWritePin(AnalogPin.P2, angle)
                break;
            }
        }
        //        basic.pause(50)
    }
}