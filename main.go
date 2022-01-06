package main

import (
	"fmt"
	"quando/internal/config"
)

func main() {
	fmt.Println("Quando Go Server started")
	if config.Remote_client() {
		fmt.Println("  Client available remotely at ...") // TODO show IP address
	}
	if config.Remote_editor() {
		fmt.Println("**SECURITY WARNING** Editor available remotely at ...") // TODO show IP address
	}
}
