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
	TEST_LINES = `11 gamepad.button(ButtonNum#0,PressRelease#1,Box:1)
4 gamepad.button(ButtonNum#0,PressRelease#0,Box:5)
6 gamepad.button(ButtonNum#0,PressRelease#2,Box:7)
2 gamepad.button(ButtonNum#1,PressRelease#2,Box:3)
8 gamepad.button(ButtonNum#2,PressRelease#2,Box:9)
10 gamepad.button(ButtonNum#3,PressRelease#2,Box:12)

1 system.log(Greeting"A",Txt"v")

5 system.log(Greeting"A",Txt"^")

7 system.log(Greeting"A",Txt"?")

3 system.log(Greeting"B",Txt"?")

9 system.log(Greeting"X",Txt"?")

12 system.log(Greeting"Y",Txt"?")
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
