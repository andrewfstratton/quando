//go:build full

package main

import (
	"fmt"
	"quando/internal/server"
	"quando/internal/server/devices/keyboard"
	"quando/internal/server/devices/mouse"
)

func init() {
	fmt.Println("** WARNING - Scripts can control keyboard and mouse **")
	handlers = append(handlers,
		server.Handler{Url: "/control/key", Func: keyboard.HandleKey},
		server.Handler{Url: "/control/type", Func: keyboard.HandleType},
		server.Handler{Url: "/control/mouse", Func: mouse.HandleMouse},
	)
}
