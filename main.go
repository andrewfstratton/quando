package main

import (
	"fmt"
	"quando/internal/config"
	_ "quando/internal/headless" // calls init() for blocks
	"quando/internal/server"
	"quando/internal/server/ip"

	"github.com/andrewfstratton/quandoscript/action"
	"github.com/andrewfstratton/quandoscript/library"
)

var handlers = []server.Handler{} // handlers are added for full/local builds, e.g. using build_full.bat

const (
	TEST_LINES = `1 2 gamepad.button(ButtonNum#0,PressRelease#1,Vari"",Box:2)
3 4 gamepad.button(ButtonNum#0,PressRelease#0,Vari"",Box:4)

2 system.log(Greeting"A",Txt"v")

4 system.log(Greeting"A",Txt"^")
`
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
