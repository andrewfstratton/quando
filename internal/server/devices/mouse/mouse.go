package mouse

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/go-vgo/robotgo"
)

type mouseJSON struct {
	X      *float32 `json:"x,omitempty"`
	Y      *float32 `json:"y,omitempty"`
	Left   *bool    `json:"left,omitempty"`
	Middle *bool    `json:"middle,omitempty"`
	Right  *bool    `json:"right,omitempty"`
}

var (
	last_left   = false
	last_middle = false
	last_right  = false
)

func check_mouse(button *bool, last_button *bool, button_name string) {
	if button != nil {
		if *button != *last_button {
			direction := "down"
			if !*button {
				direction = "up"
			}
			robotgo.Toggle(button_name, direction)
			*last_button = *button
		}
	}
}

func move_press(mouse mouseJSON) {
	check_mouse(mouse.Left, &last_left, "left")
	check_mouse(mouse.Right, &last_right, "right")
	check_mouse(mouse.Middle, &last_middle, "center")

	if mouse.X != nil && mouse.Y != nil {
		width, height := robotgo.GetScreenSize()
		x := int(*mouse.X * float32(width))
		y := int(*mouse.Y * float32(height))
		robotgo.Move(x, y)
	}
}

func HandleMouse(w http.ResponseWriter, req *http.Request) {
	var mouse mouseJSON
	err := json.NewDecoder(req.Body).Decode(&mouse)
	if err != nil {
		fmt.Println("Error parsing request", err)
		return
	}
	move_press(mouse)
}
