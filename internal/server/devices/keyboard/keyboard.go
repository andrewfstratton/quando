//go:build full

package keyboard

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/go-vgo/robotgo"
)

const (
	KeysPerSecond = 8
	msDelay       = 1000 / KeysPerSecond
)

type keyJSON struct {
	Key   string `json:"key"`
	Press bool   `json:"press"`
	Shift bool   `json:"shift"`
	Ctrl  bool   `json:"ctrl"`
	Alt   bool   `json:"alt"`
}

type typeJSON string

func press_release_modifiers(modifiers []string, up_down string) {
	for _, key := range modifiers {
		robotgo.KeyToggle(key, up_down) // these will be shift/control/alt
	}
}

func press_release(key keyJSON) {
	modifiers := []string{}
	if key.Shift {
		modifiers = append(modifiers, "shift")
	}
	if key.Ctrl {
		modifiers = append(modifiers, "control")
	}
	if key.Alt {
		modifiers = append(modifiers, "alt")
	}
	state := "up"
	if key.Press { // press modifiers before pressing key
		state = "down"
		press_release_modifiers(modifiers, state)
	}
	robotgo.KeyToggle(key.Key, state)
	if !key.Press { // release modifiers after releasing key
		press_release_modifiers(modifiers, state)
	}
}

func type_string(str typeJSON) {
	robotgo.SetDelay(msDelay)
	robotgo.TypeStr(string(str))
}

func HandleKey(w http.ResponseWriter, req *http.Request) {
	var key keyJSON
	err := json.NewDecoder(req.Body).Decode(&key)
	if err != nil {
		fmt.Println("Error parsing request", err)
		return
	}
	press_release(key)
}

func HandleType(w http.ResponseWriter, req *http.Request) {
	var typeString typeJSON
	err := json.NewDecoder(req.Body).Decode(&typeString)
	if err != nil {
		fmt.Println("Error parsing request", err)
		return
	}
	type_string(typeString)
}
