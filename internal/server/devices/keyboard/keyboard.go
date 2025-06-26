package keyboard

import (
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

func PressRelease(key string, press int, shift, ctrl, alt bool) {
	modifiers := []string{}
	if shift {
		modifiers = append(modifiers, "shift")
	}
	if ctrl {
		modifiers = append(modifiers, "control")
	}
	if alt {
		modifiers = append(modifiers, "alt")
	}
	state := "up"
	if press == 1 { // press modifiers before pressing key
		state = "down"
		press_release_modifiers(modifiers, state)
	}
	robotgo.KeyToggle(key, state)
	if press != 1 { // release modifiers after releasing key
		press_release_modifiers(modifiers, state)
	}
}

func TypeString(str string) {
	robotgo.SetDelay(msDelay)
	robotgo.TypeStr(str)
}
