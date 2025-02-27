//go:build local || full

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

var gamepads [MAX_GAMEPADS]*Gamepad // stores the last returned to identify changes - or nil

const (
	UP       = "UP"
	DOWN     = "DOWN"
	LEFT     = "LEFT"
	RIGHT    = "RIGHT"
	START    = "START"
	BACK     = "BACK"
	L_STICK  = "L_STICK"
	R_STICK  = "R_STICK"
	L_BUMPER = "L_BUMPER"
	R_BUMPER = "R_BUMPER"
	_        // guide not mapped
	A        = "A"
	B        = "B"
	X        = "X"
	Y        = "Y"
)

func buttonNameToMask(name string) int {
	switch name {
	case UP:
		return 0x0001
	case DOWN:
		return 0x0002
	case LEFT:
		return 0x0004
	case RIGHT:
		return 0x0008
	case START:
		return 0x0010
	case BACK:
		return 0x0020
	case L_STICK:
		return 0x0040
	case R_STICK:
		return 0x0080
	case L_BUMPER:
		return 0x0100
	case R_BUMPER:
		return 0x0200
	case A:
		return 0x1000
	case B:
		return 0x2000
	case X:
		return 0x4000
	case Y:
		return 0x8000
	}
	return 0
}

func triggersChanged(gamepad_old, gamepad_new Gamepad) bool {
	// return as soon as we detect a change
	if gamepad_old.left_trigger != gamepad_new.left_trigger {
		return true
	}
	return gamepad_old.right_trigger != gamepad_new.right_trigger
}

func axesChanged(gamepad_old, gamepad_new Gamepad) bool {
	// return as soon as we detect a change
	if gamepad_old.left_x != gamepad_new.left_x {
		return true
	}
	if gamepad_old.left_y != gamepad_new.left_y {
		return true
	}
	if gamepad_old.right_x != gamepad_new.right_x {
		return true
	}
	return gamepad_old.right_y != gamepad_new.right_y
}

func gamepadUpdate(num uint) {
	var gamepad Gamepad
	result, _, _ := getState.Call(uintptr(num), uintptr(unsafe.Pointer(&gamepad)))
	if result == 0 { // success
		changed := false
		if gamepads[num] == nil {
			fmt.Println("Gamepad connected : ", num)
			changed = true
		} else {
			var last_gamepad = gamepads[num]
			if last_gamepad.button_masks != gamepad.button_masks {
				changed = true
			} else if triggersChanged(*last_gamepad, gamepad) {
				changed = true
			} else if axesChanged(*last_gamepad, gamepad) {
				changed = true
			}
		}
		if changed {
			fmt.Println("changed ", num, gamepad.button_masks)
		}
		gamepads[num] = &gamepad // always update even state hasn't changed
	} else if gamepads[num] != nil { // has just disconnected
		gamepads[num] = nil
		fmt.Println("Gamepad disconnected : ", num)
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
