basic.showLeds(`
    # # . . #
    # . # . .
    # . # . #
    # . # . #
    # # . . #
    `)
basic.pause(750)
let icons = [IconNames.Happy, IconNames.Sad]

while (true) {
    let txt = serial.readLine()
    let eq = txt.indexOf("=")
    let key = txt.substr(0, eq)
    let val = txt.substr(eq + 1)
    if (key == 'display') {
        basic.showString(val)
    } else if (key == 'icon') {
        basic.showIcon(icons[parseInt(val)])
    }
}