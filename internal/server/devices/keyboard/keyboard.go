//go:build full

package keyboard

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/go-vgo/robotgo"
)

const (
	KeysPerSecond = 8 // Speed at which virtual keys can be pressed.  Equivalent to 100 words/minute
	msDelay       = 1000 / KeysPerSecond
)

type KeyJSON struct {
	Key   string `json:"key"`
	Press bool   `json:"press"`
	Shift bool   `json:"shift"`
	Ctrl  bool   `json:"ctrl"`
	Alt   bool   `json:"alt"`
}

type TypeJSON string

func _append_mod(mods []any, state bool, mod string) []any {
	if state {
		return append(mods, mod)
	}
	return mods
}

func press_release(key KeyJSON) {
	state := "up"
	if key.Press {
		state = "down"
	}
	modifiers := []any{state} // have to add up/down first ...
	modifiers = _append_mod(modifiers, key.Shift, "shift")
	modifiers = _append_mod(modifiers, key.Ctrl, "ctrl")
	modifiers = _append_mod(modifiers, key.Alt, "alt")
	robotgo.KeyToggle(key.Key, modifiers...)
}

func type_string(str TypeJSON) {
	robotgo.SetDelay(msDelay)
	robotgo.TypeStr(string(str))
}

func HandleKey(w http.ResponseWriter, req *http.Request) {
	var key KeyJSON
	err := json.NewDecoder(req.Body).Decode(&key)
	if err != nil {
		fmt.Println("Error parsing request", err)
		return
	}
	press_release(key)
}

func HandleType(w http.ResponseWriter, req *http.Request) {
	var typeString TypeJSON
	err := json.NewDecoder(req.Body).Decode(&typeString)
	if err != nil {
		fmt.Println("Error parsing request", err)
		return
	}
	type_string(typeString)
}
