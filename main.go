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
	TEST_LINES = `11 gamepad.button(ButtonNum#0,PressRelease#2,Vari"a",Box:13)
1 gamepad.button(ButtonNum#1,PressRelease#2,Vari"b",Box:2)

13 keyboard.control(Vari"a",Key"a",PressRelease#2,Ctrl#0,Alt#0,Shift#0)

2 keyboard.control(Vari"b",Key"",PressRelease#2,Ctrl#0,Alt#0,Shift#1)`
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
