//go:build full

package gamepad

import (
	"fmt"
	"syscall"
	"time"
	"unsafe"
)

const (
	MAX_GAMEPADS        = 4
	XINPUT_DLL_FILENAME = "xinput1_3.dll"
	XINPUT_GET_STATE    = "XInputGetState"
)

var getXInputState *syscall.Proc

type BUTTON_MASK uint16
type Gamepad struct {
	_             uint32 // packet - updates too often and not useful
	button_masks  BUTTON_MASK
	left_trigger  uint8
	right_trigger uint8
	left_x        int16
	left_y        int16
	right_x       int16
	right_y       int16
}

var gamepads [MAX_GAMEPADS]Gamepad
var last_buttons [MAX_GAMEPADS]BUTTON_MASK

const (
	UP = 1 << iota
	DOWN
	LEFT
	RIGHT
	START
	BACK
	L_STICK
	R_STICK
	L_BUMPER
	R_BUMPER
	_ // not mapped
	_ // not mapped
	A
	B
	X
	Y
)

func gamepadUpdate(num uint) {
	gamepad := gamepads[num]
	result, _, _ := getXInputState.Call(uintptr(num), uintptr(unsafe.Pointer(&gamepad)))
	if result == 0 { // success
		if last_buttons[num] != gamepad.button_masks {
			last_buttons[num] = gamepad.button_masks
			fmt.Println("changed ", num, gamepad.button_masks)
		}
	} else if last_buttons[num] != 0 {
		last_buttons[num] = 0
		fmt.Println("lost ", num)
	}
}

func CheckChanged() {
	if getXInputState == nil {
		fmt.Println("** XInput joystick not being checked...")
		return
	} // else
	for {
		for num := range gamepads {
			gamepadUpdate(uint(num))
		}
		time.Sleep(time.Second / 60) // 60 times a second
	}
}

func init() {
	dll, err := syscall.LoadDLL(XINPUT_DLL_FILENAME) // use older version for now
	if err != nil {
		fmt.Println("** Failed to find", XINPUT_DLL_FILENAME)
	} else {
		getXInputState, err = dll.FindProc(XINPUT_GET_STATE)
		if err != nil {
			fmt.Println("** Failed to find proc :", XINPUT_GET_STATE)
		}
	}
}
