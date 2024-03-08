//go:build local || full

package badger2040

import (
	"encoding/json"
	"fmt"
	"net/http"
	"quando/internal/server/devices/usb"
	"strconv"

	"go.bug.st/serial"
)

type buttonJSON struct {
	Num   json.Number `json:"num,omitempty"` // add one before send to avoid 0 being same as empty
	Press string      `json:"press"`         // use 1 press and 0 release
}

var serialMode = serial.Mode{
	BaudRate: 115200,
	DataBits: 8,
	Parity:   serial.NoParity,
	StopBits: serial.OneStopBit,
}

var device = usb.Device{
	VID:        "2E8A",
	PID:        "0003",
	SerialMode: serialMode,
	NewLine:    "\r\n",
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
			message := "B" + strconv.Itoa(ibtn) + "," + (button.Press)
			// fmt.Println(message)
			device.Send(message)
		}
	}
}
