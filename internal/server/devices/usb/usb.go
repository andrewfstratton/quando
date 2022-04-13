package usb

import (
	"bufio"
	"fmt"

	"go.bug.st/serial"
	"go.bug.st/serial/enumerator"
)

type Device struct {
	VID, PID   string
	SerialMode serial.Mode
	NewLine    string         // The sequence for a newline, i.e. "\r\n" for CircuitPython  and "\n" for MicroPython
	port       serial.Port    // nil when not currently connected
	scanner    *bufio.Scanner // nil when not created
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

func (device *Device) GetLine() string {
	result := ""
	if device.Opened() {
		if device.scanner == nil {
			device.scanner = bufio.NewScanner(device.port)
		}
		if device.scanner.Scan() {
			result = device.scanner.Text()
			// fmt.Println(" " + result)
		} else {
			// fmt.Println(" Scan off")
			device.scanner = nil
			device.port = nil
		}
	}
	return result
}

func send(device *Device, msg string) {
	sent, err := device.port.Write([]byte(msg + device.NewLine))
	if err != nil {
		device.port.Close()
		device.port = nil    // force reconnect
		device.scanner = nil // remove scanner
	} else if sent != len(msg)+len(device.NewLine) {
		fmt.Println("Error sending msg '", msg, "' : ", len(msg)-sent, " characters not sent ")
	}
}

func (device *Device) Opened() bool {
	if device.port != nil {
		return true
	}
	// attempt to connect
	portName := portName(device)
	if portName == "" { // i.e. failed to connect
		return false
	}
	port, err := serial.Open(portName, &device.SerialMode)
	if err != nil { // i.e. failed to open
		return false
	}
	device.port = port
	err = port.ResetInputBuffer()
	if err != nil {
		fmt.Println("error resetting port buffer")
	}
	return true
}

func (device *Device) Send(msg string) {
	// fmt.Println("Send ", device.VID, ":", device.PID, ":", msg)
	if device.Opened() {
		send(device, msg)
	}
}
