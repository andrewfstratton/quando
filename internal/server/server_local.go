//go:build local || full

package server

import "quando/internal/server/devices/usb/ubit"

func init() {
	go ubit.CheckMessages()
}
