package usb

import (
	"fmt"

	"go.bug.st/serial"
	"go.bug.st/serial/enumerator"
)

type Device struct {
	VID, PID   string
	SerialMode serial.Mode
	NewLine    string      // The sequence for a newline, i.e. "\r\n" for CircuitPython  and "\n" for MicroPython
	port       serial.Port // nil when not currently connected
}

func portName(device *Device) string {
	new_ports, err := enumerator.GetDetailedPortsList()
	if err != nil {
		return ""
	}
	for _, new_port := range new_ports {
		if new_port.IsUSB && new_port.VID == device.VID && new_port.PID == device.PID {
			fmt.Println("  Found port:", new_port.Name)
			return new_port.Name
		}
	}
	return ""
}

// func show_read(device serial.Port) {
// 	buffer := make([]byte, 100)
// 	for {
// 		count, err := device.Read(buffer)
// 		if err != nil {
// 			fmt.Println("Error reading:", err)
// 		} else if count != 0 {
// 			fmt.Print(string(buffer[:count]))
// 		}
// 	}
// }

func _send(device *Device, msg string) {
	sent, err := device.port.Write([]byte(msg + device.NewLine))
	if err != nil {
		device.port.Close()
		device.port = nil // force reconnect
	} else if sent != len(msg)+len(device.NewLine) {
		fmt.Println("Error sending msg '", msg, "' : ", len(msg)-sent, " characters not sent ")
	}
}

func Send(device *Device, msg string) {
	// fmt.Println("Send ", device.VID, ":", device.PID, ":", msg)
	if device.port == nil { // attempt to connect
		portName := portName(device)
		if portName != "" {
			port, err := serial.Open(portName, &device.SerialMode)
			if err == nil {
				device.port = port
			}
		}
	}
	if device.port != nil {
		_send(device, msg)
	}
}
