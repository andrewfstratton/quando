// Edit using https://makecode.microbit.org/#editor
let last_write = ""
function write_new(ch: string, id: string, val: string) {
    if (val != last_write) {
        serial.writeLine(`{"${id}":"${val}"}`)
        last_write = val
        // basic.showString(ch)
    }
}
function acceleration_direction() {
    let x = input.acceleration(Dimension.X)
    let y = input.acceleration(Dimension.Y)
    let z = input.acceleration(Dimension.Z)
    let xa = Math.abs(x)
    let ya = Math.abs(y)
    let za = Math.abs(z)
    let result: string[]
    // N.B. Need a transfer 'zone' percentage
    if ((xa >= ya) && (xa >= za)) { // X is biggest
        if (x >= 0) {
            result = [">", "right"]
        } else {
            result = ["<", "left"]
        }
    } else if ((ya >= za)) { // Y is biggest
        if (y >= 0) {
            result = ["F", "forward"]
        } else {
            result = ["B", "backward"]
        }
    } else { // Z is biggest
        if (z >= 0) {
            result = ["v", "down"]
        } else {
            result = ["^", "up"]
        }
    }
    return result
}
basic.forever(function () {
    if (input.buttonIsPressed(Button.AB)) {
        write_new("+", "button_ab", "true")
    } else if (input.buttonIsPressed(Button.A)) {
        write_new("a", "button_a", "true")
    } else if (input.buttonIsPressed(Button.B)) {
        write_new("b", "button_b", "true")
    } else {
        let res = acceleration_direction()
        write_new(res[0], "orientation", res[1])
    }
})
