package gamepad

import (
	"fmt"

	"github.com/andrewfstratton/quandoscript/action/param"
	"github.com/andrewfstratton/quandoscript/block/widget/boxinput"
	"github.com/andrewfstratton/quandoscript/block/widget/menuinput"
	"github.com/andrewfstratton/quandoscript/block/widget/text"
	"github.com/andrewfstratton/quandoscript/library"
)

type Defn struct {
	TypeName     struct{}          `_:"gamepad.button"`
	Class        struct{}          `_:"server-devices"`
	_            text.Text         `txt:"🕹️️️️️ When "`
	Index        menuinput.MenuInt `0:"Ⓐ/✕" 1:"Ⓑ/◯" 2:"Ⓧ/☐" 3:"Ⓨ/🛆" 14:"🠈" 15:"🠊" 12:"🠉" 13:"🠋" 4:"👈 Bumper" 5:"👉 Bumper" 10:"📍👈" 11:"👉📍" 8:"Back 👈" 9:"👉 Start"`
	_            text.Text         `txt:" button " iconify:"true"`
	PressRelease menuinput.MenuInt `2:"⇕" 1:"Press" 0:"Release"`
	Box          boxinput.Box
}

func init() {
	defn := &Defn{}
	library.Block(defn).Op(
		func(early param.Params) func(param.Params) {
			index := defn.Index.Param(early)
			return func(late param.Params) {
				index.Update(late)
				fmt.Println("Button :", index.Val)
			}
		})
}
