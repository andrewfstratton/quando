//go:build local || full

package rpi_pico_w

import (
	"encoding/json"
	"fmt"
	"net/http"
	"quando/internal/server/devices/usb"

	"go.bug.st/serial"
)

type ledJSON struct {
	Led json.Number `json:"on_off"`
}

var serialMode = serial.Mode{
	BaudRate: 115200,
	DataBits: 8,
	Parity:   serial.NoParity,
	StopBits: serial.OneStopBit,
}

var device = usb.Device{
	VID:        "2E8A",
	PID:        "0005",
	SerialMode: serialMode,
	NewLine:    "\r\n",
}

func HandleLed(w http.ResponseWriter, req *http.Request) {
	var led ledJSON
	err := json.NewDecoder(req.Body).Decode(&led)
	if err != nil {
		fmt.Println("Error parsing request", err)
		return
	} else {
		device.Send("L=" + string(led.Led))
	}
}
