//go:build local || full

package gamepad

import (
	"encoding/json"
	"fmt"
	"quando/internal/server/socket"
	"syscall"
	"time"
	"unsafe"
)

const (
	MAX_GAMEPADS        = 4
	XINPUT_DLL_FILENAME = "xinput1_3.dll"
	XINPUT_GET_STATE    = "XInputGetState"
	// Buton mapping for reference
	// "UP" 0x0001
	// "DOWN" 0x0002
	// "LEFT" 0x0004
	// "RIGHT" 0x0008
	// "START" 0x0010
	// "BACK" 0x0020
	// "L_STICK" 0x0040
	// "R_STICK" 0x0080
	// "L_BUMPER" 0x0100
	// "R_BUMPER" 0x0200
	// "A" 0x1000
	// "B" 0x2000
	// "X" 0x4000
	// "Y" 0x8000
	// N.B. HOME/GUIDE Does not map with standard call - would be 0x0400
)

var getState *syscall.Proc

type Gamepad struct {
	_             uint32 // packet - updates too often and not useful
	button_mask   uint16
	left_trigger  uint8
	right_trigger uint8
	left_x        int16
	left_y        int16
	right_x       int16
	right_y       int16
}

var gamepads [MAX_GAMEPADS]*Gamepad // stores the last returned to identify changes - or nil

type gamepadJSON struct {
	Id       int8   `json:"id"`
	Drop     bool   `json:"drop,omitempty"`
	Mask     uint16 `json:"mask,omitempty"`
	Ltrigger uint8  `json:"l_trigger,omitempty"`
	Rtrigger uint8  `json:"r_trigger,omitempty"`
	Lx       int16  `json:"l_x,omitempty"`
	Ly       int16  `json:"l_y,omitempty"`
	Rx       int16  `json:"r_x,omitempty"`
	Ry       int16  `json:"r_y,omitempty"`
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

func gamepadUpdated(num uint) bool {
	changed := false
	var gamepad Gamepad
	result, _, _ := getState.Call(uintptr(num), uintptr(unsafe.Pointer(&gamepad)))
	if result == 0 { // success
		if gamepads[num] == nil {
			fmt.Println("Gamepad connected : ", num)
			changed = true
		} else {
			var last_gamepad = gamepads[num]
			if last_gamepad.button_mask != gamepad.button_mask {
				changed = true
			} else if triggersChanged(*last_gamepad, gamepad) {
				changed = true
			} else if axesChanged(*last_gamepad, gamepad) {
				changed = true
			}
		}
		gamepads[num] = &gamepad // always update even state hasn't changed
	} else if gamepads[num] != nil { // has just disconnected
		changed = true
		gamepads[num] = nil
	}
	return changed
}

func addPostJSON(gamepad *Gamepad, num int, gamepad_json *gamepadJSON) {
	gamepad_json.Id = int8(num)
	if gamepad == nil { // dropped
		gamepad_json.Drop = true
	} else {
		gamepad_json.Mask = gamepad.button_mask
		gamepad_json.Ltrigger = gamepad.left_trigger
		gamepad_json.Rtrigger = gamepad.right_trigger
		gamepad_json.Lx = gamepad.left_x
		gamepad_json.Ly = gamepad.left_y
		gamepad_json.Rx = gamepad.right_x
		gamepad_json.Ry = gamepad.right_y
	}
}

func CheckChanged() {
	if getState == nil {
		fmt.Println("** XInput joystick not being checked...")
		return
	} // else
	for {
		updated := false
		gamepad_json := gamepadJSON{}
		for num := range MAX_GAMEPADS { // note this will be 0..3
			if gamepadUpdated(uint(num)) {
				updated = true
				var gamepad *Gamepad // is nil
				if gamepads[num] != nil {
					gamepad = gamepads[num]
				}
				addPostJSON(gamepad, num, &gamepad_json)
			}
		}
		if updated {
			bout, err := json.Marshal(gamepad_json)
			if err != nil {
				fmt.Println("Error marshalling gamepad", err)
			} else {
				str := string(bout)
				prefix := `{"type":"gamepad"`
				if str != "{}" {
					prefix += ","
				}
				str = prefix + str[1:]
				socket.Broadcast(str)
			}
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
