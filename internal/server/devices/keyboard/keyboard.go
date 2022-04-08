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
}

type typeJSON string

func press_release(key keyJSON) {
	state := "up"
	if key.Press {
		state = "down"
	}
	robotgo.KeyToggle(key.Key, state)
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
