package log

import (
	"fmt"
	"time"

	"quando/quandoscript/action/param"
	"quando/quandoscript/block"
	"quando/quandoscript/block/widget/stringinput"
	"quando/quandoscript/block/widget/text"
)

type LogDefn struct {
	TypeName struct{}                `_:"system.log"`
	Class    struct{}                `_:"quando-misc"`
	_        text.Text               `txt:"Log "`
	Greeting stringinput.StringInput `empty:"greeting"`
	_        text.Text               `txt:" "`
	Txt      stringinput.StringInput `empty:"name"`
}

func init() { // sets up the Block (UI) ONLY  - doesn't setup any action even though the early/late functions are referenced
	log := &LogDefn{}
	block.New(log).Op(
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
