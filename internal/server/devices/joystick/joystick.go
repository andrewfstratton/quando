//go:build full

package joystick

import (
	"fmt"
	"time"

	"github.com/simulatedsimian/joystick"
)

const MAX_JOYSTICKS = 8

var joysticks [MAX_JOYSTICKS]joystick.Joystick
var last_buttons uint32 = 0

func joystickChanged(jsid int) {
	if js := joysticks[jsid]; js != nil {
		state, err := js.Read()
		if err == nil {
			buttons := state.Buttons
			if last_buttons != buttons {
				fmt.Println(state.Buttons)
				last_buttons = buttons
			}
		} else { // dropped
			last_buttons = 0
			joysticks[jsid] = nil // to avoid reading
			fmt.Println(jsid, " Lost...")
		}
	}
}

func checkNewJoysticks() {
	for {
		for id, jsx := range joysticks {
			if jsx == nil {
				js, err := joystick.Open(id)
				if err == nil {
					joysticks[id] = js
					fmt.Println("Opened joystick ", id)
					fmt.Println("Joystick Name: ", js.Name())
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
	go checkNewJoysticks() // runs until application exits
	for {
		// fmt.Print(".")
		joystickChanged(0)
		time.Sleep(time.Second / 60) // 60 times a second
	}
}
