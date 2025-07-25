package client

import (
	"fmt"
	// below are for side effects, i.e. calling init()
	_ "quando/internal/client/title"
)

func init() {
	fmt.Println("Quando Go Server loading Client library ...")
}
