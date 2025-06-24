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
	PressRelease menuinput.MenuInt `2:"⇕" 1:"press" 0:"release"`
	Box          boxinput.Box
}

const (
	Release      = 0
	Press        = 1
	PressRelease = 2
)

func init() {
	defn := &Defn{}
	library.Block(defn).Op(
		func(early param.Params) func(param.Params) {
			index := defn.Index.Param(early)
			press_release := defn.PressRelease.Param(early)
			return func(late param.Params) {
				index.Update(late)
				press_release.Update(late)
				fmt.Println("Button :", index.Val)
			}
		})
}
