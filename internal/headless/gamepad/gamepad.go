package gamepad

import (
	gamepad_windows "quando/internal/server/devices/gamepad"

	"github.com/andrewfstratton/quandoscript/action"
	"github.com/andrewfstratton/quandoscript/action/param"
	"github.com/andrewfstratton/quandoscript/block/widget"
	"github.com/andrewfstratton/quandoscript/block/widget/boxinput"
	"github.com/andrewfstratton/quandoscript/block/widget/menuinput"
	"github.com/andrewfstratton/quandoscript/block/widget/stringinput"
	"github.com/andrewfstratton/quandoscript/block/widget/text"
	"github.com/andrewfstratton/quandoscript/library"
	"github.com/andrewfstratton/quandoscript/property"
)

// N.B. Button 16 is not included since it doesn't work on Server + may open Xbox game bar on Windows
type Defn struct {
	TypeName     struct{}           `_:"gamepad.button"`
	Class        struct{}           `_:"server-devices"`
	_            text.Text          `txt:"🕹️️️️️ When "`
	ButtonNum    menuinput.MenuInt  `0:"Ⓐ/✕" 1:"Ⓑ/◯" 2:"Ⓧ/☐" 3:"Ⓨ/🛆" 14:"🠈" 15:"🠊" 12:"🠉" 13:"🠋" 4:"👈 Bumper" 5:"👉 Bumper" 10:"📍👈" 11:"👉📍" 8:"Back 👈" 9:"👉 Start"`
	_            text.Text          `txt:" button " iconify:"true"`
	PressRelease menuinput.MenuInt  `2:"⇕" 1:"pressed" 0:"released"`
	Vari         stringinput.String `empty:"⇕" show:"PressRelease=2"`
	Box          boxinput.Box
}

func init() {
	defn := &Defn{}
	library.Block(defn).Op(
		func(early param.Params) func(param.Params) {
			buttonNum := defn.ButtonNum.Param(early)
			press_release := defn.PressRelease.Param(early)
			vari := defn.Vari.Param(early)
			box := defn.Box.Param(early)
			return func(late param.Params) {
				buttonNum.Update(late)
				press_release.Update(late)
				vari.Update(late)
				box.Update(late)
				gamepad_windows.ButtonHandle(buttonNum.Int(),
					func(pressed bool) {
						if press_release.Val == widget.RELEASE && pressed {
							return
						}
						if press_release.Val == widget.PRESS && !pressed {
							return
						}
						if press_release.Val == widget.PRESS_RELEASE {
							property.SetBool(0, vari.Val, pressed)
						}
						action.Run(box.Val)
					})
			}
		})
}
