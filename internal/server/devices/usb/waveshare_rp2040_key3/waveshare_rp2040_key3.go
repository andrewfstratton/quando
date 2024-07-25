//go:build local || full

package waveshare_rp2040_key3

import (
	"encoding/json"
	"fmt"
	"net/http"
	"quando/internal/server/devices/usb"

	"go.bug.st/serial"
)

type neoPixelJSON struct {
	Id  json.Number `json:"id"`
	Val string      `json:"val"`
}

var serialMode = serial.Mode{
	BaudRate: 115200,
	DataBits: 8,
	Parity:   serial.NoParity,
	StopBits: serial.OneStopBit,
}

var device = usb.Device{
	VID:        "2E8A",
	PID:        "9020",
	SerialMode: serialMode,
	NewLine:    "\r\n",
}

func HandlePixel(w http.ResponseWriter, req *http.Request) {
	var pixel neoPixelJSON
	err := json.NewDecoder(req.Body).Decode(&pixel)
	if err != nil {
		fmt.Println("Error parsing request", err)
		return
	} else {
		device.Send("P" + string(pixel.Id) + "," + string(pixel.Val))
	}
}
