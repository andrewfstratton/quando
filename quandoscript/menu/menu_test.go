package menu

import (
	"testing"

	"quando/quandoscript/assert"
	"quando/quandoscript/block"
)

func TestNew(t *testing.T) {
	menu := New("")
	assert.Eq(t, menu.class, "")

	menu = New("system")
	assert.Eq(t, menu.class, "system")
}

func TestAddBlock(t *testing.T) {
	b := block.AddNew("quando.unique.id", "system")
	menu := New("system")
	assert.Eq(t, len(menu.blocks), 0)
	menu.Add(b)
	assert.Eq(t, len(menu.blocks), 1)
}

func TestClass(t *testing.T) {
	menu := New("")
	assert.Eq(t, menu.CSSClass("quando-"), "quando-unknown")

	menu = New("system")
	assert.Eq(t, menu.CSSClass("quando-library-"), "quando-library-system")
}
