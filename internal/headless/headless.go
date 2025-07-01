package headless

import (
	"fmt"
	// below are side effects, i.e. call init()
	_ "quando/internal/headless/gamepad"
	_ "quando/internal/headless/keyboard"
	_ "quando/internal/headless/system/log"
	_ "quando/internal/headless/time/after"
	_ "quando/internal/headless/time/every"
)

func init() {
	fmt.Println("\nQuando Go Server loading headless library ...")
}
