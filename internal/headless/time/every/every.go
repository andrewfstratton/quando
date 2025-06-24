package every

import (
	"time"

	"github.com/andrewfstratton/quandoscript/action"
	"github.com/andrewfstratton/quandoscript/action/param"
	"github.com/andrewfstratton/quandoscript/block/widget/boxinput"
	"github.com/andrewfstratton/quandoscript/block/widget/numberinput"
	"github.com/andrewfstratton/quandoscript/block/widget/text"
	"github.com/andrewfstratton/quandoscript/library"
)

type Every struct {
	TypeName struct{}           `_:"time.every"`
	Class    struct{}           `_:"time"`
	_        text.Text          `txt:"Every " iconify:"true"`
	Secs     numberinput.Number `empty:"seconds" min:"0" max:"999" width:"4" default:"1"`
	_        text.Text          `txt:"seconds"`
	Box      boxinput.Box
}

func init() {
	defn := &Every{}
	library.Block(defn).Op(
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
