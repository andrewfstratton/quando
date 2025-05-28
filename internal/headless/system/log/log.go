package log

import (
	"fmt"
	"time"

	"github.com/andrewfstratton/quandoscript/block/widget/stringinput"
	"github.com/andrewfstratton/quandoscript/block/widget/text"
	"github.com/andrewfstratton/quandoscript/library"
	"github.com/andrewfstratton/quandoscript/run/param"
)

func init() {
	server_log := library.NewBlockType("server.log", "misc", setup)
	server_log.Add(text.New("Log "))
	server_log.Add(stringinput.New("greeting").Empty("greeting"))
	server_log.Add(text.New(" "))
	server_log.Add(stringinput.New("txt").Empty("message"))
}

func setup(outer param.Params) func(param.Params) {
	greeting := param.StringParam{Lookup: "greeting", Val: ""}
	greeting.Update(outer)
	txt := param.StringParam{Lookup: "txt", Val: ""}
	return func(inner param.Params) {
		txt.Update(inner)
		now := time.Now()
		fmt.Println("Log:", now, greeting.Val, txt.Val)
	}
}
