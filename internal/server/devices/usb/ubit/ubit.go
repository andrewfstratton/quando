//go:build local || full

package ubit

import (
	"encoding/json"
	"fmt"
	"net/http"
	"quando/internal/server/devices/usb"
	"quando/internal/server/socket"
	"strings"
	"time"

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

type serialJSON struct {
	Roll  json.Number `json:"Ro"`
	Pitch json.Number `json:"Pi"`
}

type postJSON struct {
	ButtonA     *bool  `json:"button_a,omitempty"`
	ButtonB     *bool  `json:"button_b,omitempty"`
	Pin0        *bool  `json:"pin_0,omitempty"`
	Pin1        *bool  `json:"pin_1,omitempty"`
	Pin2        *bool  `json:"pin_2,omitempty"`
	Orientation string `json:"orientation,omitempty"`
}

type postAngleJSON struct {
	Roll  json.Number `json:"roll,omitempty"`
	Pitch json.Number `json:"pitch,omitempty"`
}

var lookupGesture = map[string]string{
	"^": "up",
	"v": "down",
	"<": "left",
	">": "right",
	"B": "backward",
	"F": "forward",
}

var serialMode = serial.Mode{
	BaudRate: 115200,
	DataBits: 8,
	Parity:   serial.NoParity,
	StopBits: serial.OneStopBit,
}

var device = usb.Device{
	VID:        "0D28",
	PID:        "0204",
	SerialMode: serialMode,
	NewLine:    "\n",
}

var pressed = new(bool)

func HandleDisplay(w http.ResponseWriter, req *http.Request) {
	display := displayJSON{}
	err := json.NewDecoder(req.Body).Decode(&display)
	if err != nil {
		fmt.Println("Error parsing request", err)
		return
	} else {
		device.Send("D=" + display.Val)
	}
}

func HandleIcon(w http.ResponseWriter, req *http.Request) {
	icon := iconJSON{}
	err := json.NewDecoder(req.Body).Decode(&icon)
	if err != nil {
		fmt.Println("Error parsing request", err)
		return
	} else {
		device.Send("I=" + string(icon.Val))
	}
}

func HandleServo(w http.ResponseWriter, req *http.Request) {
	servo := servoJSON{}
	err := json.NewDecoder(req.Body).Decode(&servo)
	if err != nil {
		fmt.Println("Error parsing request", err)
		return
	} else {
		device.Send("T=" + string(servo.Servo) + "," + string(servo.Angle))
	}
}

func handleButtonGestureTouchPin(msg string) {
	post_json := postJSON{}
	if strings.Contains(msg, "a") {
		post_json.ButtonA = pressed
	}
	if strings.Contains(msg, "b") {
		post_json.ButtonB = pressed
	}
	if strings.Contains(msg, "0") {
		post_json.Pin0 = pressed
	}
	if strings.Contains(msg, "1") {
		post_json.Pin1 = pressed
	}
	if strings.Contains(msg, "2") {
		post_json.Pin2 = pressed
	}
	orientation := ""
	for k, v := range lookupGesture {
		if strings.Contains(msg, k) {
			orientation = v
			break // can only match one orientation (gesture)
		}
	}
	if orientation != "" {
		post_json.Orientation = orientation
	}
	bout, err := json.Marshal(post_json)
	if err != nil {
		fmt.Println("Error marshalling message", err, ":", msg)
	} else {
		str := string(bout)
		prefix := `{"type":"ubit"`
		if str != "{}" {
			prefix += ","
		}
		str = prefix + str[1:]
		socket.Broadcast(str)
	}
}

func handleMessage(msg string) {
	serial_in := serialJSON{}
	err := json.Unmarshal([]byte(msg), &serial_in)
	if err != nil || msg == "" { // i.e. non JSON - so this is encode gesture/button/pin touch
		handleButtonGestureTouchPin(msg)
	} else {
		sendAngle := postAngleJSON{}
		sendAngle.Roll = serial_in.Roll
		sendAngle.Pitch = serial_in.Pitch
		bout, err := json.Marshal(sendAngle)
		if err != nil {
			fmt.Println("Error marshalling message", err, ":", msg)
		} else {
			str := string(bout)
			if str != "{}" {
				prefix := `{"type":"ubit",`
				str = prefix + str[1:]
				socket.Broadcast(str)
				// fmt.Println("  send ", str)
			}
		}
	}
}

func CheckMessages() {
	for {
		response := device.GetLine()
		if response == "" {
			time.Sleep(100 * time.Millisecond)
		} else {
			handleMessage(response)
		}
	}
}

func init() {
	*pressed = true
}
