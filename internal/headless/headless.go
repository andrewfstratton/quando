package headless

import (
	"github.com/andrewfstratton/quandoscript/block/widget/stringinput"
	"github.com/andrewfstratton/quandoscript/block/widget/text"
	"github.com/andrewfstratton/quandoscript/library"
)

func AddBlocks() {
	server_log := library.NewBlockType("server.log", "misc")
	server_log.Add(text.New("Log "))
	server_log.Add(stringinput.New("txt").Empty("message"))
}
