package headless

import (
	"fmt"
	_ "quando/internal/headless/system/log" // this calls init()
)

func init() {
	fmt.Println("\nQuando Go Server loading headless library ...")
}
