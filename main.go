package main

import (
	"fmt"
	"quando/internal/config"
	"quando/internal/server"
	"quando/internal/server/ip"
)

var handlers = []server.Handler{} // extra handlers are added when built as full version

func main() {
	fmt.Println("Quando Go Server started")
	ipAddress := ip.PrivateIP()
	if config.RemoteClient() {
		fmt.Println("  Warning: Client can be accessed remotely at ", ipAddress)
	}
	if config.RemoteEditor() {
		fmt.Println("**SECURITY WARNING** Editor can be accessed remotely at ", ipAddress)
	}
	server.ServeHTTPandIO(handlers)
}
