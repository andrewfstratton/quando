//go:build local || full

package main

import (
	"quando/internal/server"
	"quando/internal/server/devices/usb/badger2040"
	"quando/internal/server/devices/usb/maker_pi_rp2040"
	"quando/internal/server/devices/usb/rpi_pico_w"
	"quando/internal/server/devices/usb/ubit"
	"quando/internal/tray"
)

func init() {
	go tray.Run()
	handlers = append(handlers,
		server.Handler{Url: "/control/ubit/display", Func: ubit.HandleDisplay},
		server.Handler{Url: "/control/ubit/icon", Func: ubit.HandleIcon},
		server.Handler{Url: "/control/ubit/turn", Func: ubit.HandleServo},
		server.Handler{Url: "/control/maker_pi_rp2040/turn", Func: maker_pi_rp2040.HandleServo},
		server.Handler{Url: "/control/rpi_pico_w/led", Func: rpi_pico_w.HandleLed},
		server.Handler{Url: "/control/badger2040/button", Func: badger2040.HandleHIDButton},
	)
}
