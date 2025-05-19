//go:build (local || full) && !windows

package gamepad

import "fmt"

func CheckChanged() {
	fmt.Println("** XInput joystick not being checked...needs to be windows")
	return
}
