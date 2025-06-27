package keyboard

import (
	device_keyboard "quando/internal/server/devices/keyboard"

	"github.com/andrewfstratton/quandoscript/action/param"
	"github.com/andrewfstratton/quandoscript/block/widget"
	"github.com/andrewfstratton/quandoscript/block/widget/menuinput"
	"github.com/andrewfstratton/quandoscript/block/widget/stringinput"
	"github.com/andrewfstratton/quandoscript/block/widget/text"
	"github.com/andrewfstratton/quandoscript/library"
	"github.com/andrewfstratton/quandoscript/property"
)

type Defn struct {
	TypeName     struct{}           `_:"keyboard.control"`
	Class        struct{}           `_:"server-devices"`
	Vari         stringinput.String `empty:"⇕" show:"PressRelease=2"`
	_            text.Text          `txt:"⌨️ Key "`
	_            text.Text          `txt:"ctrl+" show:"Ctrl=1"`
	_            text.Text          `txt:"alt+" show:"Alt=1"`
	_            text.Text          `txt:"shift+" show:"Shift=1"`
	Key          stringinput.String `empty:"🗚" length:"1"`
	_            text.Text          `txt:" "`
	PressRelease menuinput.MenuInt  `2:"⇕" 1:"press" 0:"release"`
	_            text.Text          `txt:"<br>" hover:"true"`
	Ctrl         menuinput.MenuInt  `0:"no ctrl" 1:"ctrl" hover:"true" toggle:"true"`
	Alt          menuinput.MenuInt  `0:"no alt" 1:"alt" hover:"true" toggle:"true"`
	Shift        menuinput.MenuInt  `0:"no shift" 1:"shift" hover:"true" toggle:"true"`
}

func init() {
	defn := &Defn{}
	library.Block(defn).Op(
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
				device_keyboard.PressRelease(key.Val, press, shift.Bool(), ctrl.Bool(), alt.Bool())
			}
		})
}
