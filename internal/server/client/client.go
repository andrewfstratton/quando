package client

import "fmt"

func Title(add bool, txt string) { // TODO send to attached client/s
	fmt.Println("Title:", txt, add)
}
