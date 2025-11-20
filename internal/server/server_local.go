//go:build local || full

package server

import (
	gamepad "quando/internal/server/devices/gamepad"
	"quando/internal/server/devices/usb/ubit"
)

func init() {
	go ubit.CheckMessages()
	go gamepad.CheckChanged()
}
