package menu

import (
	"quando/quandoscript/block"
)

const (
	UNKNOWN_CLASS = "unknown"
)

type Menu struct {
	class  string
	blocks []block.Block
}

func New(class string) *Menu {
	return &Menu{class: class}
}

func (menu *Menu) Add(block *block.Block) {
	menu.blocks = append(menu.blocks, *block)
}

func (menu *Menu) CSSClass(prefix string) string {
	if menu.class == "" {
		return prefix + UNKNOWN_CLASS
	}
	return prefix + menu.class
}
