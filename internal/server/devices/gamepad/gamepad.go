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

var getState *syscall.Proc

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
	UP         = 0x0001
	DOWN       = 0x0002
	LEFT       = 0x0004
	RIGHT      = 0x0008
	START_MENU = 0x0010
	BACK_VIEW  = 0x0020
	L_STICK    = 0x0040
	R_STICK    = 0x0080
	L_BUMPER   = 0x0100
	R_BUMPER   = 0x0200
	_          // guide not mapped
	A          = 0x1000
	B          = 0x2000
	X          = 0x4000
	Y          = 0x8000
)

func gamepadUpdate(num uint) {
	gamepad := gamepads[num]
	result, _, _ := getState.Call(uintptr(num), uintptr(unsafe.Pointer(&gamepad)))
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
	if getState == nil {
		fmt.Println("** XInput joystick not being checked...")
		return
	} // else
	for {
		for gamepad := range MAX_GAMEPADS { // note this will be 0..3
			gamepadUpdate(uint(gamepad))
		}
		time.Sleep(time.Second / 60) // 60 times a second
	}
}

func init() {
	dll, err := syscall.LoadDLL(XINPUT_DLL_FILENAME) // use older version for now
	if err != nil {
		fmt.Println("** Failed to find", XINPUT_DLL_FILENAME)
	} else {
		getState, err = dll.FindProc(XINPUT_GET_STATE)
		if err != nil {
			fmt.Println("** Failed to find proc :", XINPUT_GET_STATE)
		}
	}
}
