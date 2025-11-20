//go:build full

package keyboard

import (
	"encoding/json"
	"fmt"
	"net/http"
	"quando/internal/server/socket"

	"github.com/go-vgo/robotgo"
	gohook "github.com/robotn/gohook"
)

const (
	KeysPerSecond = 8
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

type KeyboardJSON struct {
	Key  string `json:"key"`
	Down bool   `json:"down,omitempty"`
}

var MapKeycodeName = map[uint16]string{
	// Commented out already give correct name which is shown
	8:  "backspace", // also num clear
	9:  "tab",
	13: "enter", // also num enter and num=
	19: "pause",
	20: "", // capslock disabled - toggle
	27: "esc",
	32: "space",
	33: "pageup",
	34: "pagedown",
	35: "end",
	36: "home",
	37: "left",
	38: "up",
	39: "right",
	40: "down",
	// 42: "print", // untested
	44: "printscreen",
	// 45: "insert",
	// 46: "delete",
	48:  "0",
	49:  "1",
	50:  "2",
	51:  "3",
	52:  "4",
	53:  "5",
	54:  "6",
	55:  "7",
	56:  "8",
	57:  "9",
	65:  "a",
	66:  "b",
	67:  "c",
	68:  "d",
	69:  "e",
	70:  "f",
	71:  "g",
	72:  "h",
	73:  "i",
	74:  "j",
	75:  "k",
	76:  "l",
	77:  "m",
	78:  "n",
	79:  "o",
	80:  "p",
	81:  "q",
	82:  "r",
	83:  "s",
	84:  "t",
	85:  "u",
	86:  "v",
	87:  "w",
	88:  "x",
	89:  "y",
	90:  "z",
	91:  "",     // cmd disabled - system pops up
	92:  "",     // rcmd disabled - system pops up
	93:  "menu", // risky
	96:  "num0", // ignore numlock status
	97:  "num1",
	98:  "num2",
	99:  "num3",
	100: "num5",
	101: "num6",
	102: "num7",
	103: "num8",
	104: "num9",
	105: "num9",
	106: "num*",
	107: "num+",
	109: "num-",
	110: "num.",
	111: "num/",
	// 112 to 123 - f1 to f12, likely to f23
	144: "", // numlock ignored since isn't raised until number keys pressed?!
	160: "shift",
	161: "rshift",
	162: "ctrl",
	163: "rctrl",
	164: "alt",
	165: "ralt", // risky since also  raises ctrl press
	173: "audio_mute",
	174: "audio_vol_down",
	175: "audio_vol_up",
	176: "audio_next",
	177: "audio_prev",
	// 178: "audio_stop", // untested
	179: "audio_pause",
	186: ";",
	187: "=",
	188: ",",
	189: "-",
	190: ".",
	191: "/",
	192: "'",
	219: "[",
	220: `\`,
	221: "]",
	222: "#",
	223: "`",
}

func CheckChanged() { // performance isn't a concern with <60 changes per second
	ch := gohook.Start()
	defer gohook.End()

	for e := range ch {
		if e.Kind == gohook.KeyDown || e.Kind == gohook.KeyUp {
			down := (e.Kind == gohook.KeyDown)
			rawcode := e.Rawcode
			key, found := MapKeycodeName[rawcode]
			if !found {
				key = gohook.RawcodetoKeychar(rawcode)
			}
			if key != "" {
				keyboardJSON := &KeyboardJSON{Key: key, Down: down}
				// TODO refactor to a common util broadcast
				bout, err := json.Marshal(keyboardJSON)
				if err != nil {
					fmt.Println("Error marshalling keyboard", err)
				} else {
					str := string(bout)
					prefix := `{"type":"keyboard"`
					if str != "{}" {
						prefix += ","
					}
					str = prefix + str[1:]
					socket.Broadcast(string(bout))
					// fmt.Println(str, rawcode)
				}
			}
		}
	}
}

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
