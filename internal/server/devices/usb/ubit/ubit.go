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

type iconJSON struct {
	Val json.Number `json:"val"`
}

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
	VID:        "0D28",
	PID:        "0204",
	SerialMode: serial_mode,
	NewLine:    "\n",
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

func HandleIcon(w http.ResponseWriter, req *http.Request) {
	var icon iconJSON
	err := json.NewDecoder(req.Body).Decode(&icon)
	if err != nil {
		fmt.Println("Error parsing request", err)
		return
	} else {
		usb.Send(&device, "I="+string(icon.Val))
	}
}

func HandleServo(w http.ResponseWriter, req *http.Request) {
	var servo servoJSON
	err := json.NewDecoder(req.Body).Decode(&servo)
	if err != nil {
		fmt.Println("Error parsing request", err)
		return
	} else {
		usb.Send(&device, "T="+string(servo.Servo)+","+string(servo.Angle))
	}
}
