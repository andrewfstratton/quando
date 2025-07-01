package every

import (
	"time"

	"github.com/andrewfstratton/quandoscript/action"
	"github.com/andrewfstratton/quandoscript/action/param"
	"github.com/andrewfstratton/quandoscript/block/widget"
	"github.com/andrewfstratton/quandoscript/block/widget/text"
	"github.com/andrewfstratton/quandoscript/definition"
	"github.com/andrewfstratton/quandoscript/library"
)

type Defn struct {
	TypeName widget.None `_:"time.every"`
	Class    widget.None `_:"time"`
	_        text.Text   `txt:"Every " iconify:"true"`
	widget.S_ecs
	_ text.Text `txt:"seconds"`
	widget.B_ox
}

func init() {
	defn := Defn{}
	definition.Setup(&defn)
	library.NewBlock(defn).Op(
		func(early param.Params) func(param.Params) {
			secs := defn.Secs.Param(early)
			box := defn.Box.Param(early)
			return func(late param.Params) {
				secs.Update(late)
				box.Update(late)
				go func() {
					for range time.Tick(secs.Duration()) {
						action.Run(box.Val)
					}
				}()
			}
		})
}
