//go:build full

package gamepad

import (
	"fmt"
	"time"

	"github.com/simulatedsimian/joystick"
)

const MAX_GAMEPAD = 8

type Gamepad struct {
	last_buttons uint32
	last_axes    []int
	joystick     joystick.Joystick
}

var gamepads [MAX_GAMEPAD]Gamepad

func gamepadUpdate(num int) {
	gamepad := gamepads[num]
	if joystick := gamepad.joystick; joystick != nil {
		state, err := joystick.Read()
		if err == nil {
			buttons := state.Buttons
			if gamepad.last_buttons != buttons {
				fmt.Println(state.Buttons)
				gamepads[num].last_buttons = buttons
			}
		} else { // dropped
			gamepads[num].last_buttons = 0
			gamepads[num].joystick = nil // to avoid reading
			fmt.Println(num, " Lost...")
		}
	}
}

func checkNewGamepads() {
	for {
		for num, gamepad := range gamepads {
			if gamepad.joystick == nil {
				js, err := joystick.Open(num)
				if err == nil {
					_, err := js.Read()
					if err == nil {
						gamepads[num].joystick = js
						gamepads[num].last_buttons = 0
						fmt.Println("Opened gamepad ", num)
						fmt.Println("  Name: ", js.Name())
						fmt.Println("  # buttons : ", js.ButtonCount())
						fmt.Println("  # axes : ", js.AxisCount())
					}
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
		gamepadUpdate(0)
		gamepadUpdate(1)
		time.Sleep(time.Second / 60) // 60 times a second
	}
}
