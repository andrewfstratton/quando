package headless

import (
	"fmt"
	_ "quando/internal/headless/system/log" // this calls init()
	_ "quando/internal/headless/time/after"
	_ "quando/internal/headless/time/every"
)

func init() {
	fmt.Println("\nQuando Go Server loading headless library ...")
}
