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
	TEST_LINES = `2 1 gamepad.button(ButtonNum#2,PressRelease#2,Vari"x",Box:1)
3 4 gamepad.button(ButtonNum#0,PressRelease#2,Vari"a",Box:4)
5 6 gamepad.button(ButtonNum#3,PressRelease#2,Vari"y",Box:6)
7 8 gamepad.button(ButtonNum#1,PressRelease#2,Vari"b",Box:8)
9 10 gamepad.button(ButtonNum#5,PressRelease#2,Vari"bump",Box:10)

1 keyboard.controlspecial(Vari"x",Key"delete",PressRelease#2,Ctrl#0,Alt#0,Shift#0)

4 keyboard.controlspecial(Vari"a",Key"down",PressRelease#2,Ctrl#0,Alt#0,Shift#0)

6 keyboard.controlspecial(Vari"y",Key"up",PressRelease#2,Ctrl#0,Alt#0,Shift#0)

8 keyboard.controlspecial(Vari"b",Key"backspace",PressRelease#2,Ctrl#0,Alt#0,Shift#0)

10 keyboard.controlspecial(Vari"bump",Key"tab",PressRelease#2,Ctrl#0,Alt#1,Shift#0)`
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
