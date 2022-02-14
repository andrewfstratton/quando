package keyboard

import (
	"encoding/json"
	"fmt"
	"io"
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
	down := "up"
	if key.Press {
		down = "down"
	}
	robotgo.KeyToggle(key.Key, down)
}

func type_string(str typeJSON) {
	robotgo.SetDelay(msDelay)
	robotgo.TypeStr(string(str))
}

func getBytes(req *http.Request) []byte {
	bytes, err := io.ReadAll(req.Body)
	if err != nil {
		fmt.Println("  read error ", err, string(bytes))
		return nil
	}
	return bytes
}

func HandleKey(w http.ResponseWriter, req *http.Request) {
	var key keyJSON
	bytes := getBytes(req)
	if bytes != nil {
		err := json.Unmarshal(bytes, &key)
		if err != nil {
			fmt.Println("  unexpected parse error ", err, string(bytes))
			return
		}
		press_release(key)
	}
}

func HandleType(w http.ResponseWriter, req *http.Request) {
	var typeString typeJSON
	bytes := getBytes(req)
	if bytes != nil {
		err := json.Unmarshal(bytes, &typeString)
		if err != nil {
			fmt.Println("  unexpected parse error ", err, string(bytes))
			return
		}
		type_string(typeString)
	}
}
