//go:build local || full

package server

import (
	"quando/internal/server/devices/joystick"
	"quando/internal/server/devices/usb/ubit"
	"quando/internal/server/system"
)

func init() {
	go ubit.CheckMessages()
	go joystick.CheckChanged()
	go system.CheckChanged()
}
