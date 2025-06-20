package main

import (
	"fmt"
	"quando/internal/config"
	_ "quando/internal/headless" // calls init() for blocks
	"quando/internal/server"
	"quando/internal/server/ip"
)

var handlers = []server.Handler{} // handlers are added for full/local builds, e.g. using build_full.bat

func main() {
	fmt.Println("Quando Go Server started")
	ipAddress := ip.PrivateIP()
	if config.Remote() {
		fmt.Println("**SECURITY WARNING** Quando can be accessed remotely at ", ipAddress)
	}
	server.ServeHTTPandIO(handlers)
}
