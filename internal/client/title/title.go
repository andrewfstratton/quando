package title

import (
	"quando/internal/server/client"

	"github.com/andrewfstratton/quandoscript/action/param"
	"github.com/andrewfstratton/quandoscript/block/widget"
	"github.com/andrewfstratton/quandoscript/block/widget/menuinput"
	"github.com/andrewfstratton/quandoscript/block/widget/stringinput"
	"github.com/andrewfstratton/quandoscript/block/widget/text"
	"github.com/andrewfstratton/quandoscript/definition"
	"github.com/andrewfstratton/quandoscript/library"
)

type Defn struct {
	TypeName widget.None        `_:"client.title"`
	Class    widget.None        `_:"display"`
	_        text.Text          `txt:"⚡" show:"Source=_val"`
	_        text.Text          `txt:"❓" show:"Source=_txt"`
	Add      menuinput.MenuInt  `0:"show" 1:"add" toggle:"true"`
	_        text.Text          `txt:" Title "`
	Title    stringinput.String `empty:"title" show:"Source=_quot"`
	_        text.Text          `txt:"<br>" hover:"true"`
	Source   menuinput.MenuStr  `_quot:"&quot;&quot;" _txt:"❓" _val:"⚡" toggle:"true" hover:"true"`
}

func init() {
	defn := Defn{}
	definition.Setup(&defn)
	library.NewBlock(defn).Op(
		func(early param.Params) func(param.Params) {
			title := defn.Title.Param(early)
			add := defn.Add.Param(early)
			source := defn.Source.Param(early)
			return func(late param.Params) {
				title.Update(late)
				add.Update(late)
				source.Update(late)
				txt := title.Val
				switch source.Val {
				case "_txt":
					txt = "$"
				case "_val":
					txt = "0.5"
				}
				client.Title(add.Bool(), txt)
			}
		})
}
