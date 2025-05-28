package main

import (
	"fmt"
	"quando/internal/config"
	_ "quando/internal/headless" // calls init()
	"quando/internal/server"
	"quando/internal/server/ip"

	"github.com/andrewfstratton/quandoscript/library"
	"github.com/andrewfstratton/quandoscript/run/param"
)

var handlers = []server.Handler{} // handlers are added for full/local builds, e.g. using build_full.bat

func main() {
	fmt.Println("Quando Go Server started")
	ipAddress := ip.PrivateIP()
	if config.Remote() {
		fmt.Println("**SECURITY WARNING** Quando can be accessed remotely at ", ipAddress)
	}
	block, found := library.FindBlockType("server.log")
	if found {
		outer := param.Params{}
		outer["txt"] = param.Param{Val: "Bob", Qtype: param.STRING}
		inner := param.Params{}
		inner["greeting"] = param.Param{Val: "Hi", Qtype: param.STRING}
		block.Op(inner)(outer)
	}
	server.ServeHTTPandIO(handlers)
}
