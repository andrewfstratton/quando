//go:build local || full

package rpi_pico_w

import (
	"encoding/json"
	"fmt"
	"net/http"
	"quando/internal/server/devices/usb"
	"strconv"

	"go.bug.st/serial"
)

type ledJSON struct {
	Led json.Number `json:"on_off"`
}

type buttonJSON struct {
	Num   json.Number `json:"num,omitempty"` // add one before send to avoid 0 being same as empty
	Press string      `json:"press"`         // use B press and b release
}

type axisJSON struct {
	Id  string      `json:"id"`            // one of XYZxyz
	Num json.Number `json:"num,omitempty"` // add one before send to avoid 0 being same as empty
}

var serialMode = serial.Mode{
	BaudRate: 115200,
	DataBits: 8,
	Parity:   serial.NoParity,
	StopBits: serial.OneStopBit,
}

var device = usb.Device{
	VID:        "2E8A",
	PID:        "000A",
	SerialMode: serialMode,
	NewLine:    "\r",
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

func HandleHIDButton(w http.ResponseWriter, req *http.Request) {
	var button buttonJSON
	err := json.NewDecoder(req.Body).Decode(&button)
	if err != nil {
		fmt.Println("Error parsing request", err)
		return
	} else {
		btn, err := button.Num.Int64()
		ibtn := int(btn - 1) // -1 is due to empty being 0 so +1 was added before sending here
		if (err == nil) && (ibtn >= 0) {
			if (err == nil) && (ibtn >= 0) {
				message := button.Press + strconv.Itoa(ibtn) // button.Press is 'b' or 'B'
				device.Send(message)
			}
		}
	}
}

func HandleHIDAxis(w http.ResponseWriter, req *http.Request) {
	var axis axisJSON
	err := json.NewDecoder(req.Body).Decode(&axis)
	if err != nil {
		fmt.Println("Error parsing request", err)
		return
	} else {
		val64, err := axis.Num.Int64()
		if (err == nil) && (val64 > 0) {
			message := axis.Id + strconv.Itoa(int(val64-32768)) // -1 adjustment for zero avoidance
			device.Send(message)
		}
	}
}
