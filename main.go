package main

import (
	"fmt"
	"quando/internal/config"
	"quando/internal/server"
)

func main() {
	fmt.Println("Quando Go Server started")
	if config.RemoteClient() {
		fmt.Println("  Client available remotely at ...") // TODO show IP address
	}
	if config.RemoteEditor() {
		fmt.Println("**SECURITY WARNING** Editor available remotely at ...") // TODO show IP address
	}
	server.ServeHTTPandIO()
}
