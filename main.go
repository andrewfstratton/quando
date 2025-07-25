package main

import (
	"fmt"
	"quando/internal/config"

	// call init for blocks
	_ "quando/internal/client"
	_ "quando/internal/headless"

	"quando/internal/server"
	"quando/internal/server/ip"

	"github.com/andrewfstratton/quandoscript/action"
	"github.com/andrewfstratton/quandoscript/library"
)

var handlers = []server.Handler{} // handlers are added for full/local builds, e.g. using build_full.bat

const (
	TEST_LINES = ``
)

func main() {
	fmt.Println("Quando Go Server started")
	ipAddress := ip.PrivateIP()
	if config.Remote() {
		fmt.Println("**SECURITY WARNING** Quando can be accessed remotely at ", ipAddress)
	}
	library.Parse(TEST_LINES)
	warn := action.Start()
	if warn != "" {
		fmt.Println(warn)
	}
	server.ServeHTTPandIO(handlers)
}
