//go:build full

package mouse

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/go-vgo/robotgo"
)

type mouseJSON struct {
	X        *float32 `json:"x,omitempty"`
	Y        *float32 `json:"y,omitempty"`
	Relative bool     `json:"relative,omitempty"`
	Time     *float32 `json:"best_time,omitempty"`
	Left     string   `json:"left"`
	Middle   string   `json:"middle"`
	Right    string   `json:"right"`
}

var (
	last_left   = ""
	last_middle = ""
	last_right  = ""
)

func check_mouse(button_action string, last_action *string, button_name string) {
	if button_action != "" {
		if button_action != *last_action {
			switch button_action {
			case "click":
				robotgo.Click(button_name)
				*last_action = "up"
			case "up":
				robotgo.Toggle(button_name, "up")
				*last_action = button_action
			case "down":
				robotgo.Toggle(button_name, "down")
				*last_action = button_action
			default:
				fmt.Println("runtime error or hacking - unexpected mouse button action:", button_action, " for ", button_name)
			}
		}
	}
}

const INTERVAL = time.Duration(time.Second / 30)
const MAX_INTERVAL_SKIP = time.Duration(INTERVAL * 5) // i.e. allow 1/6th of a second jump at max

type movePair struct{ x, y *int }

type moveChannel chan (movePair)

var moves moveChannel

func clamp(target *int, min, max int) {
	if *target < min {
		*target = min
	} else if *target > max {
		*target = max
	}
}

var last_time time.Time = time.Now()

func interval(dx, dy int) {
	new_time := time.Now()
	time_diff := new_time.Sub(last_time)
	last_time = new_time
	if dx == 0 && dy == 0 { // i.e. no movement
		return
	} // else update location based on the interval and movement
	dy = -dy // invert vertical movement due to display coordinates being 0 at top
	// fmt.Println(" ", time_diff)
	current_x, current_y := robotgo.Location() // removed due to bug with scaled display
	if time_diff > MAX_INTERVAL_SKIP {
		time_diff = MAX_INTERVAL_SKIP
	}
	// calculate movement from time difference
	move_x := int(float64(dx) * time_diff.Seconds())
	move_y := int(float64(dy) * time_diff.Seconds())
	x := current_x + move_x
	y := current_y + move_y
	// apply limits
	width, height := robotgo.GetScreenSize()
	clamp(&x, 0, width)
	clamp(&y, 0, height)
	if current_x != x || current_y != y { // double check to avoid update when no movement
		robotgo.Move(x, y, robotgo.GetMainId()) // update position : cannot use Smooth since that lifts the mouse buttons
	}
}

func updateRelativeMove(moves moveChannel) {
	dx := 0
	dy := 0
	go func() { // run interval regularily
		for {
			interval(dx, dy)
			time.Sleep(INTERVAL)
		}
	}()
	for {
		new_move := <-moves
		if new_move.x != nil {
			dx = *new_move.x
		}
		if new_move.y != nil {
			dy = *new_move.y
		}
		// fmt.Println("<-", dx, dy)
	}
}

func pixelPerSecond(val float32, max_pixels int, best_time float32) int {
	pixels := int((float32(max_pixels) * (2 * (val - 0.5))) / best_time)
	return pixels
}

func mouseMoveRelative(x_val, y_val *float32, best_time float32) {
	width, height := robotgo.GetScreenSize()
	move_pair := movePair{nil, nil}
	if x_val != nil {
		pixels := pixelPerSecond(*x_val, width, best_time)
		move_pair.x = &pixels
	}
	if y_val != nil {
		pixels := pixelPerSecond(*y_val, height, best_time)
		move_pair.y = &pixels
	}
	moves <- move_pair
}

func move_press(mouse mouseJSON) {
	check_mouse(mouse.Left, &last_left, "left")
	check_mouse(mouse.Right, &last_right, "right")
	check_mouse(mouse.Middle, &last_middle, "center")

	if mouse.X != nil || mouse.Y != nil { // i.e. either x and/or y is changed
		x, y := robotgo.Location()
		if mouse.Relative {
			mouseMoveRelative(mouse.X, mouse.Y, *mouse.Time)
		} else { // i.e. absolute
			width, height := robotgo.GetScreenSize()
			if mouse.X != nil {
				x = int(*mouse.X * float32(width) / 1.25)
			}
			if mouse.Y != nil {
				y = int(*mouse.Y * float32(height) / 1.25)
			}
			robotgo.Move(x, y, robotgo.GetMainId())
		}
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

func init() {
	moves = make(moveChannel, 0)
	go updateRelativeMove(moves)
}
