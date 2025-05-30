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
	greeting := stringinput.New("greeting").Empty("greeting")
	txt := stringinput.New("txt").Empty("greeting")

	library.NewBlockType("server.log", "misc", op).Add(
		text.New("Log "),
		greeting,
		text.New(" "),
		txt)
}

func op(outer param.Params) func(param.Params) {
	greeting := param.StringParam{Lookup: "greeting", Val: ""}
	greeting.Update(outer)
	txt := param.StringParam{Lookup: "txt", Val: ""}
	return func(inner param.Params) {
		txt.Update(inner)
		now := time.Now()
		fmt.Println("Log:", now, greeting.Val, txt.Val)
	}
}
