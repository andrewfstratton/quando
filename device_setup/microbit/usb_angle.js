// Edit using https://makecode.microbit.org/#editor
let _pitch = -999
let _roll = -999
let _heading = -999
type SendCallback = (ch: string, id: string, val: string) => void

function pitch(send: SendCallback) {
    let pitch = input.rotation(Rotation.Pitch)
    if (pitch != _pitch) {
        send("+", "pitch", "" + pitch)
        _pitch = pitch
    }
}

function roll(send: SendCallback) {
    let roll = input.rotation(Rotation.Roll)
    if (roll != _roll) {
        send("-", "roll", "" + roll)
        _roll = roll
    }
}

function heading(send: SendCallback) {
    let heading = input.compassHeading()
    if (heading != _heading) {
        send("*", "heading", "" + heading)
        _heading = heading
    }
}

let send: SendCallback = (ch: string, id: string, val: string) => {
    basic.showString(ch)
    serial.writeLine(`{"${id}":"${val}"}`)
}

basic.forever(function () {
    led.stopAnimation()
    pitch(send)
    roll(send)
    if (input.buttonIsPressed(Button.AB)) {
        send("C", "button_ab", "true")
    } else if (input.buttonIsPressed(Button.A)) {
        send("a", "button_a", "true")
    } else if (input.buttonIsPressed(Button.B)) {
        send("b", "button_b", "true")
    }
})
