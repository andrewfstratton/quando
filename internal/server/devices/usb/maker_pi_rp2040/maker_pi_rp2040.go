package maker_pi_rp2040

import (
	"encoding/json"
	"fmt"
	"net/http"
	"quando/internal/server/devices/usb"

	"go.bug.st/serial"
)

type servoJSON struct {
	Servo json.Number `json:"servo"`
	Angle json.Number `json:"angle"`
}

var serial_mode = serial.Mode{
	BaudRate: 115200,
	DataBits: 8,
	Parity:   serial.NoParity,
	StopBits: serial.OneStopBit,
}

var device = usb.Device{
	VID:        "2E8A",
	PID:        "1000",
	SerialMode: serial_mode,
	NewLine:    "\r\n",
}

func HandleServo(w http.ResponseWriter, req *http.Request) {
	var servo servoJSON
	err := json.NewDecoder(req.Body).Decode(&servo)
	if err != nil {
		fmt.Println("Error parsing request", err)
		return
	} else {
		device.Send("T=" + string(servo.Servo) + "," + string(servo.Angle))
	}
}
