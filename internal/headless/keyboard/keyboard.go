package keyboard

import (
	device_keyboard "quando/internal/server/devices/keyboard"

	"github.com/andrewfstratton/quandoscript/action/param"
	"github.com/andrewfstratton/quandoscript/block/widget/menuinput"
	"github.com/andrewfstratton/quandoscript/block/widget/stringinput"
	"github.com/andrewfstratton/quandoscript/block/widget/text"
	"github.com/andrewfstratton/quandoscript/library"
)

type Defn struct {
	TypeName     struct{}           `_:"keyboard.control"`
	Class        struct{}           `_:"server-devices"`
	Var          stringinput.String `empty:"⇕" show:"PressRelease=2"`
	_            text.Text          `txt:"⌨️ Key "`
	_            text.Text          `txt:"ctrl+" show:"Ctrl=1"`
	_            text.Text          `txt:"shift+" show:"Shift=1"`
	_            text.Text          `txt:"alt+" show:"Alt=1"`
	Key          stringinput.String `empty:"🗚" length:"1"`
	_            text.Text          `txt:" "`
	PressRelease menuinput.MenuInt  `2:"⇕" 1:"press" 0:"release"`
	_            text.Text          `txt:"<br>" hover:"true"`
	Ctrl         menuinput.MenuInt  `0:"no ctrl" 1:"ctrl" hover:"true"`
	Alt          menuinput.MenuInt  `0:"no alt" 1:"alt" hover:"true"`
	Shift        menuinput.MenuInt  `0:"no shift" 1:"shift" hover:"true"`
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
			return func(late param.Params) {
				key.Update(late)
				press_release.Update(late)
				device_keyboard.PressRelease(key.Val, press_release.Int(), shift.Bool(), ctrl.Bool(), alt.Bool())
			}
		})
}
