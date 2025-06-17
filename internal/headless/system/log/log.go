package log

import (
	"fmt"
	"time"

	"github.com/andrewfstratton/quandoscript/action/param"
	"github.com/andrewfstratton/quandoscript/block/widget/stringinput"
	"github.com/andrewfstratton/quandoscript/block/widget/text"
	"github.com/andrewfstratton/quandoscript/library"
)

type LogDefn struct {
	TypeName struct{}                `_:"system.log"`
	Class    struct{}                `_:"misc"`
	_        text.Text               `txt:"Log "`
	Greeting stringinput.StringInput `empty:"greeting"`
	_        text.Text               `txt:" "`
	Txt      stringinput.StringInput `empty:"name"`
}

func init() { // sets up the Block (UI) ONLY  - doesn't setup any action even though the early/late functions are referenced
	log := &LogDefn{}
	library.Block(log).Op(
		// log := &LogDefn{}
		// block.New(log).Op(
		func(early param.Params) func(param.Params) {
			greeting := log.Greeting.Param(early)
			txt := log.Txt.Param(early)
			return func(late param.Params) {
				txt.Update(late)
				greeting.Update(late)
				now := time.Now()
				fmt.Println("Log:", greeting.Val, txt.Val, now.Format(time.TimeOnly))
			}
		})
}
