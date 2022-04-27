package main

import (
	"fmt"
	"quando/internal/config"
	"quando/internal/server"
	"quando/internal/server/ip"
)

var handlers = []server.Handler{}

func main() {
	fmt.Println("Quando Go Server started")
	if config.RemoteClient() {
		fmt.Println("  Client available on local network at ", ip.PrivateIP()) // TODO show IP address
	}
	if config.RemoteEditor() {
		fmt.Println("**SECURITY WARNING** Editor available on local network at ", ip.PrivateIP()) // TODO show IP address
	}
	server.ServeHTTPandIO(handlers)
}
