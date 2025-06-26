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
	MAX_BUTTONS         = 16
	XINPUT_DLL_FILENAME = "xinput1_3.dll"
	XINPUT_GET_STATE    = "XInputGetState"
)

var maskToButton = map[uint16]int{
	0x0001: 12, // "UP"
	0x0002: 13, // "DOWN"
	0x0004: 14, // "LEFT"
	0x0008: 15, // "RIGHT"
	0x0010: 9,  // "START"
	0x0020: 8,  // "BACK"
	0x0040: 10, // "L_STICK"
	0x0080: 11, // "R_STICK"
	0x0100: 4,  // "L_BUMPER"
	0x0200: 5,  // "R_BUMPER"
	0x1000: 0,  // "A"
	0x2000: 1,  // "B"
	0x4000: 2,  // "X"
	0x8000: 3,  // "Y"
	// 0x0400: 16, // "HOME/GUIDE" - Does not work with standard windows call
}

var getState *syscall.Proc

type (
	GamepadMask struct {
		Gamepad int
		Mask    uint16
	}
	MaskChannel chan (GamepadMask)
	Gamepad     struct {
		_             uint32 // packet - updates too often and not useful
		button_mask   uint16
		left_trigger  uint8
		right_trigger uint8
		left_x        int16
		left_y        int16
		right_x       int16
		right_y       int16
	}
	ButtonHandler func(bool)
)

var (
	gamepads     [MAX_GAMEPADS]*Gamepad                     // stores the last returned to identify changes - or nil
	maskChannel  = make(MaskChannel, 0)                     // all button mask changes are sent on this...
	maskHandlers [MAX_GAMEPADS][MAX_BUTTONS][]ButtonHandler // handlers for each gamepad and each button
)

func ButtonHandle(num int, handler ButtonHandler) {
	maskHandlers[0][num] = append(maskHandlers[0][num], handler)
}

func maskUpdate() {
	last_masks := make([]uint16, MAX_GAMEPADS)
	for {
		mask := <-maskChannel
		last_mask := last_masks[mask.Gamepad]
		for m, button := range maskToButton { // check each mask bit
			if (last_mask & m) != (m & mask.Mask) { // i.e. if mask bit has changed
				pressed := false
				if (m & mask.Mask) != 0 {
					pressed = true
				}
				for _, handler := range maskHandlers[mask.Gamepad][button] { // call any (may be none) handlers
					handler(pressed)
				}
			}
		}
		last_masks[mask.Gamepad] = mask.Mask
	}
}

func gamepadUpdate(num int) {
	var gamepad Gamepad
	last_gamepad := gamepads[num]
	result, _, _ := getState.Call(uintptr(uint(num)), uintptr(unsafe.Pointer(&gamepad)))
	gamepadMask := GamepadMask{Gamepad: num, Mask: 0}
	// swap success round to do fail first
	if result == 0 { // success
		gamepadMask.Mask = gamepad.button_mask
		if last_gamepad == nil {
			fmt.Println("Gamepad connected : ", num)
			if gamepad.button_mask != 0 {
				maskChannel <- gamepadMask
			}
		} else {
			if last_gamepad.button_mask != gamepad.button_mask {
				maskChannel <- gamepadMask
			}
		}
		gamepads[num] = &gamepad // always update
	} else if last_gamepad != nil { // has just disconnected
		fmt.Println("Gamepad disconnected : ", num)
		gamepads[num] = nil
		maskChannel <- gamepadMask
	}
}

func CheckChanged() {
	if getState == nil {
		fmt.Println("** XInput joystick not being checked...")
		return
	}
	go maskUpdate()
	for {
		// for num := range MAX_GAMEPADS { // note this will be 0..3
		gamepadUpdate(0)
		// gamepadUpdate(num)
		// }
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
