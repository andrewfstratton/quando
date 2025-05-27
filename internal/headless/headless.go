package headless

import (
	"fmt"
	_ "quando/internal/headless/system/log" // this calls init()
)

func init() {
	fmt.Println("Quando Go Server loading headless library ...")
}
