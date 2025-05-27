package log

import (
	"fmt"

	"github.com/andrewfstratton/quandoscript/block/widget/stringinput"
	"github.com/andrewfstratton/quandoscript/block/widget/text"
	"github.com/andrewfstratton/quandoscript/library"
	"github.com/andrewfstratton/quandoscript/parse"
	"github.com/andrewfstratton/quandoscript/run/param"
)

func init() {
	server_log := library.NewBlockType("server.log", "misc", setup)
	server_log.Add(text.New("Log "))
	server_log.Add(stringinput.New("txt").Empty("message"))
}

func setup(params param.Params) func(param.Params) {
	setup_txt, setup_found := params["txt"]
	return func(params param.Params) {
		txt, found := params["txt"]
		if !found {
			if setup_found {
				txt = setup_txt
			} else {
				txt.Qtype = parse.UNKNOWN
			}
		}
		if txt.Qtype != parse.STRING {
			fmt.Println("Error : no 'txt' parameter")
			return
		}
		fmt.Println("Log: ", txt.Val.(string))
	}
}
