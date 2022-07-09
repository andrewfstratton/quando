//go:build local || full

package server

import "quando/internal/server/devices/usb/ubit"
import "quando/internal/server/system"

func init() {
	go ubit.CheckMessages()
	go system.CheckChanged()
}
