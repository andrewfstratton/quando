//go:build local || full

package server

import (
	"quando/internal/server/devices/gamepad"
	"quando/internal/server/devices/usb/ubit"
	"quando/internal/server/system"
)

func init() {
	go ubit.CheckMessages()
	go gamepad.CheckChanged()
	go system.CheckChanged()
}
