package main

import (
	"fmt"
	"quando/internal/config"
	_ "quando/internal/headless" // calls init()
	"quando/internal/server"
	"quando/internal/server/ip"

	"github.com/andrewfstratton/quandoscript/action"
	"github.com/andrewfstratton/quandoscript/library"
)

var handlers = []server.Handler{} // handlers are added for full/local builds, e.g. using build_full.bat

const (
	// 1 system.after(secs#2,callback:3)
	// 2 system.every(secs#0.5,callback:7)

	// 3 system.log(greeting"Hello",txt"Jane")
	// 4 system.log(greeting"Bye",txt"Bob")
	// 5 system.after(secs#0.9,callback:6)

	// 6 system.log(greeting"Bye",txt"Jane")

	TEST_LINES = `0 system.log(greeting"Hi",txt"Bob")
7 system.log(txt".")
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
	// block, found := library.FindBlock("system.log")
	// if found {
	// 	outer := param.Params{}
	// 	outer["txt"] = param.Param{Val: "Bob", Qtype: definition.STRING}
	// 	inner := param.Params{}
	// 	inner["greeting"] = param.Param{Val: "Hi", Qtype: param.STRING}
	// 	block.OpOp(inner)(outer)
	// }
	server.ServeHTTPandIO(handlers)
}
