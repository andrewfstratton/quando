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
	TypeName     widget.None        `_:"keyboard.control"`
	Class        widget.None        `_:"server-devices"`
	Vari         stringinput.String `empty:"⇕" show:"PressRelease=2"`
	_            text.Text          `txt:"⌨️ Key "`
	_            text.Text          `txt:"ctrl+" show:"Ctrl=1"`
	_            text.Text          `txt:"alt+" show:"Alt=1"`
	_            text.Text          `txt:"shift+" show:"Shift=1"`
	Key          stringinput.String `empty:"🗚" length:"1"`
	_            text.Text          `txt:" "`
	PressRelease menuinput.MenuInt  `2:"⇕" 1:"press" 0:"release"`
	_            text.Text          `txt:"<br>" hover:"true"`
	Ctrl         menuinput.MenuInt  `0:"no ctrl" 1:"ctrl" toggle:"true" hover:"true"`
	_            text.Text          `txt:" " hover:"true"`
	Alt          menuinput.MenuInt  `0:"no alt" 1:"alt" toggle:"true" hover:"true"`
	_            text.Text          `txt:" " hover:"true"`
	Shift        menuinput.MenuInt  `0:"no shift" 1:"shift" toggle:"true" hover:"true"`
}

type SpecialDefn struct {
	TypeName     widget.None        `_:"keyboard.controlspecial"`
	Class        widget.None        `_:"server-devices"`
	Vari         stringinput.String `empty:"⇕" show:"PressRelease=2"`
	_            text.Text          `txt:"⌨️ Special Key "`
	_            text.Text          `txt:"ctrl+" show:"Ctrl=1"`
	_            text.Text          `txt:"alt+" show:"Alt=1"`
	_            text.Text          `txt:"shift+" show:"Shift=1"`
	Key          menuinput.MenuStr  `shift:"Shift" ctrl:"Ctrl" alt:"Alt" cmd:"Win/Cmd" tab:"Tab" delete:"Delete" backspace:"Backspace" enter:"Enter" space:"Space" up:"🠅 Up" down:"🠇 Down" left:"🠄 Left" right:"🠆 Right" pageup:"Page Up" pagedown:"Page Down" esc:"Escape" home:"Home" insert:"Insert" pause:"Pause" end:"End" printscreen:"Print Screen" print:"Print" rshift:"Shift Right" rctrl:"Ctrl Right" rcmd:"Cmd Right" ralt:"Alt Right" capslock:"Caps Lock" numlock:"Num Lock" menu:"Menu (Win)" f1:"F1" f2:"F2" f3:"F3" f4:"F4" f5:"F5" f6:"F6" f7:"F7" f8:"F8" f9:"F9" f10:"F10" f11:"F11" f12:"F12" f13:"F13" f14:"F14" f15:"F15" f16:"F16" f17:"F17" f18:"F18" f19:"F19" f20:"F20" f21:"F21" f22:"F22" f23:"F23" f24:"F24" audio_mute:"Mute" audio_vol_down:"Volume Down" audio_vol_up:"Volume Up" audio_play:"Play" audio_stop:"Stop" audio_pause:"Pause" audio_prev:"Previous" audio_next:"Next" num0:"Num 0" num1:"Num 1" num2:"Num 2" num3:"Num 3" num4:"Num 4" num5:"Num 5" num6:"Num 6" num7:"Num 7" num8:"Num 8" num9:"Num 9" num_lock:"Num Lock" num.:"Num ." num+:"Num +" num-:"Num -" num*:"Num *" num/:"Num /" num_clear:"Num Clear" num_enter:"Num Enter" num_equal:"Num ="`
	_            text.Text          `txt:" "`
	PressRelease menuinput.MenuInt  `2:"⇕" 1:"press" 0:"release"`
	_            text.Text          `txt:"<br>" hover:"true"`
	Ctrl         menuinput.MenuInt  `0:"no ctrl" 1:"ctrl" toggle:"true" hover:"true"`
	_            text.Text          `txt:" " hover:"true"`
	Alt          menuinput.MenuInt  `0:"no alt" 1:"alt" toggle:"true" hover:"true"`
	_            text.Text          `txt:" " hover:"true"`
	Shift        menuinput.MenuInt  `0:"no shift" 1:"shift" toggle:"true" hover:"true"`
}

func init() {
	initKeyControl()
	initKeyControlSpecial()
}

func initKeyControl() {
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

func initKeyControlSpecial() {
	defn := SpecialDefn{}
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
