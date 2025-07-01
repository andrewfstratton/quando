package log

import (
	"fmt"
	"time"

	"github.com/andrewfstratton/quandoscript/action/param"
	"github.com/andrewfstratton/quandoscript/block/widget"
	"github.com/andrewfstratton/quandoscript/block/widget/stringinput"
	"github.com/andrewfstratton/quandoscript/block/widget/text"
	"github.com/andrewfstratton/quandoscript/definition"
	"github.com/andrewfstratton/quandoscript/library"
)

type Defn struct {
	TypeName widget.None        `_:"system.log"`
	Class    widget.None        `_:"misc"`
	_        text.Text          `txt:"Log "`
	Greeting stringinput.String `empty:"greeting"`
	_        text.Text          `txt:" "`
	Txt      stringinput.String `empty:"name"`
}

func init() { // sets up the Block (UI) ONLY  - doesn't setup any action even though the early/late functions are referenced
	defn := Defn{}
	definition.Setup(&defn)
	library.NewBlock(defn).Op(
		func(early param.Params) func(param.Params) {
			greeting := defn.Greeting.Param(early)
			txt := defn.Txt.Param(early)
			return func(late param.Params) {
				txt.Update(late)
				greeting.Update(late)
				now := time.Now()
				fmt.Println("Log:", greeting.Val, txt.Val, now.Format(time.TimeOnly))
			}
		})
}
