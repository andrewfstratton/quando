package headless

import (
	"fmt"
	// below are for side effects, i.e. calling init()
	_ "quando/internal/headless/gamepad"
	_ "quando/internal/headless/keyboard"
	_ "quando/internal/headless/system/log"
	_ "quando/internal/headless/time/after"
	_ "quando/internal/headless/time/every"
)

func init() {
	fmt.Println("Quando Go Server loading headless library ...")
}
