package keyboard

import (
	"quando/internal/server/devices/control_keyboard"

	"github.com/andrewfstratton/quandoscript/action/param"
	"github.com/andrewfstratton/quandoscript/block/widget"
	"github.com/andrewfstratton/quandoscript/block/widget/menuinput"
	"github.com/andrewfstratton/quandoscript/block/widget/stringinput"
	"github.com/andrewfstratton/quandoscript/block/widget/text"
	"github.com/andrewfstratton/quandoscript/definition"
	"github.com/andrewfstratton/quandoscript/library"
	"github.com/andrewfstratton/quandoscript/property"
)

type Defn struct {
	TypeName widget.None        `_:"keyboard.control"`
	Class    widget.None        `_:"server-devices"`
	Vari     stringinput.String `empty:"⇕" show:"PressRelease=2"`
	_        text.Text          `txt:"⌨️ Key "`
	_        text.Text          `txt:"ctrl+" show:"Ctrl=1"`
	_        text.Text          `txt:"alt+" show:"Alt=1"`
	_        text.Text          `txt:"shift+" show:"Shift=1"`
	Key      stringinput.String `empty:"🗚" length:"1"`
	_        text.Text          `txt:" "`
	widget.P_ressRelease
	HoverDefn `hover:"true"`
}

type HoverDefn struct {
	_          text.Text `txt:"<br>"`
	ToggleDefn `toggle:"true"`
}

type ToggleDefn struct {
	Ctrl  menuinput.MenuInt `0:"no ctrl" 1:"ctrl"`
	Alt   menuinput.MenuInt `0:"no alt" 1:"alt"`
	Shift menuinput.MenuInt `0:"no shift" 1:"shift"`
}

func init() {
	defn := Defn{}
	definition.Setup(&defn)
	library.NewBlock(defn).Op(
		func(early param.Params) func(param.Params) {
			key := defn.Key.Param(early)
			press_release := defn.PressRelease.Param(early)
			ctrl := defn.Ctrl.Param(early)
			alt := defn.Alt.Param(early)
			shift := defn.Shift.Param(early)
			vari := defn.Vari.Param(early)
			return func(late param.Params) {
				key.Update(late)
				vari.Update(late)
				press := press_release.Int() == widget.PRESS
				if press_release.Int() == widget.PRESS_RELEASE {
					press = property.GetBool(0, vari.Val)
				}
				control_keyboard.PressRelease(key.Val, press, shift.Bool(), ctrl.Bool(), alt.Bool())
			}
		})
}
