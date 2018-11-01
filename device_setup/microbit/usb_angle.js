// Edit using https://makecode.microbit.org/#editor
let _pitch = -999
let _roll = -999
let _heading = -999
// type SendCallback = (ch: string, id: string, val: string) => void

function send(ch: string, id: string, val: string) {
    // led.stopAnimation()
    // basic.showString(ch)
    serial.writeLine(`{"${id}":"${val}"}`)
}

function pitch() {
    let pitch = input.rotation(Rotation.Pitch)
    if (pitch != _pitch) {
        send("+", "pitch", "" + pitch)
        _pitch = pitch
    }
}

function roll() {
    let roll = input.rotation(Rotation.Roll)
    if (roll != _roll) {
        send("-", "roll", "" + roll)
        _roll = roll
    }
}

function heading() {
    let heading = input.compassHeading()
    if (heading != _heading) {
        send("*", "heading", "" + heading)
        _heading = heading
    }
}

basic.forever(function () {
    pitch()
    roll()
    heading()
    if (input.buttonIsPressed(Button.AB)) {
        send("C", "button_ab", "true")
    } else if (input.buttonIsPressed(Button.A)) {
        send("a", "button_a", "true")
    } else if (input.buttonIsPressed(Button.B)) {
        send("b", "button_b", "true")
    }
})