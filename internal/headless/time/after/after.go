package after

import (
	"time"

	"github.com/andrewfstratton/quandoscript/action"
	"github.com/andrewfstratton/quandoscript/action/param"
	"github.com/andrewfstratton/quandoscript/block/widget"
	"github.com/andrewfstratton/quandoscript/block/widget/boxinput"
	"github.com/andrewfstratton/quandoscript/block/widget/numberinput"
	"github.com/andrewfstratton/quandoscript/block/widget/text"
	"github.com/andrewfstratton/quandoscript/definition"
	"github.com/andrewfstratton/quandoscript/library"
)

type Defn struct {
	TypeName widget.None        `_:"time.after"`
	Class    widget.None        `_:"time"`
	_        text.Text          `txt:"After " iconify:"true"`
	Secs     numberinput.Number `empty:"seconds" min:"0" max:"999" width:"4" default:"1"`
	_        text.Text          `txt:"seconds"`
	Box      boxinput.Box
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
				time.AfterFunc(secs.Duration(), func() {
					action.Run(box.Val)
				})
			}
		})
}
