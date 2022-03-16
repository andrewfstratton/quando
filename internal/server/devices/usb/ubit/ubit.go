package ubit

import (
	"encoding/json"
	"fmt"
	"net/http"
	"quando/internal/server/devices/usb"

	"go.bug.st/serial"
)

type displayJSON struct {
	Val string `json:"val"`
}

var serial_mode = serial.Mode{
	BaudRate: 115200,
	DataBits: 8,
	Parity:   serial.NoParity,
	StopBits: serial.OneStopBit,
}

var device = usb.Device{
	VID:        "0D28",
	PID:        "0204",
	SerialMode: serial_mode,
}

func HandleDisplay(w http.ResponseWriter, req *http.Request) {
	var display displayJSON
	err := json.NewDecoder(req.Body).Decode(&display)
	if err != nil {
		fmt.Println("Error parsing request", err)
		return
	} else {
		usb.Send(&device, "D="+display.Val)
	}
}
