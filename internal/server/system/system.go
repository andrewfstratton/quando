//go:build local || full

package system

import (
	"encoding/json"
	"fmt"
	"quando/internal/server/socket"
	"time"

	"github.com/go-vgo/robotgo"
)

var lastTitle = ""

type postJSON struct {
	Title string `json:"title,omitempty"`
}

func changedFocus() {
	newTitle := robotgo.GetTitle()
	if newTitle != "" && (newTitle != lastTitle) {
		postJson := postJSON{}
		postJson.Title = newTitle
		bout, err := json.Marshal(postJson)
		if err != nil {
			fmt.Println("Error marshalling title", err, ":", newTitle)
		} else {
			str := string(bout)
			prefix := `{"type":"system"`
			if str != "{}" {
				prefix += ","
			}
			str = prefix + str[1:]
			socket.Broadcast(str)
		}
		lastTitle = newTitle
	}
}

func CheckChanged() {
	for {
		changedFocus()
		time.Sleep(100 * time.Millisecond)
	}
}
