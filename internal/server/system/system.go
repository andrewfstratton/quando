//go:build local || full

package system

import (
	"encoding/json"
	"quando/internal/server/socket"
	"time"

	"github.com/go-vgo/robotgo"
)

var lastTitle = ""

const JS_TYPE = "system"

type postJSON struct {
	Title string `json:"title,omitempty"`
}

func changedFocus() {
	newTitle := robotgo.GetTitle()
	if newTitle != "" && (newTitle != lastTitle) {
		postJson := &postJSON{Title: newTitle}
		bout, err := json.Marshal(postJson)
		socket.BroadcastJSON(JS_TYPE, bout, err)
		lastTitle = newTitle
	}
}

func CheckChanged() {
	for {
		changedFocus()
		time.Sleep(100 * time.Millisecond)
	}
}
