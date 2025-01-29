//go:build full

package gamepad

import (
	"fmt"
	"time"

	"github.com/simulatedsimian/joystick"
)

const MAX_GAMEPAD = 8

var gamepads [MAX_GAMEPAD]joystick.Joystick
var last_buttons uint32 = 0

func gamepadChanged(jsid int) {
	if js := gamepads[jsid]; js != nil {
		state, err := js.Read()
		if err == nil {
			buttons := state.Buttons
			if last_buttons != buttons {
				fmt.Println(state.Buttons)
				last_buttons = buttons
			}
		} else { // dropped
			last_buttons = 0
			gamepads[jsid] = nil // to avoid reading
			fmt.Println(jsid, " Lost...")
		}
	}
}

func checkNewGamepads() {
	for {
		for id, jsx := range gamepads {
			if jsx == nil {
				js, err := joystick.Open(id)
				if err == nil {
					gamepads[id] = js
					fmt.Println("Opened gamepad ", id)
					fmt.Println("  Name: ", js.Name())
					fmt.Println("  # buttons : ", js.ButtonCount())
					fmt.Println("  # axes : ", js.AxisCount())
				}
			}
			// else do nothing since we already have a handle
		}
		time.Sleep(time.Second / 2) // check 2 times a second for new joysticks
	}
}

func CheckChanged() {
	go checkNewGamepads() // runs until application exits
	for {
		// fmt.Print(".")
		gamepadChanged(0)
		time.Sleep(time.Second / 60) // 60 times a second
	}
}
