package block

import (
	"testing"

	"quando/quandoscript/assert"
	"quando/quandoscript/block/widget/character"
	"quando/quandoscript/block/widget/numberinput"
	"quando/quandoscript/block/widget/percentinput"
	"quando/quandoscript/block/widget/stringinput"
	"quando/quandoscript/block/widget/text"
)

func TestEmpty(t *testing.T) {
	block := AddNew("", "")  // test with empty class here
	assert.Eq(t, block, nil) // n.b. will panic when not testing
}

func TestNewSimple(t *testing.T) {
	block := AddNew("log", "")
	assert.Eq(t, block.Class, "")
	assert.Eq(t, block.TypeName, "log")

	block = AddNew("system.log", "sys")
	assert.Eq(t, block.Class, "quando-sys")
	assert.Eq(t, block.TypeName, "system.log")
}

func TestNew(t *testing.T) {
	block := AddNew("system.log", "system",
		text.New("Log"),
		character.New(character.FIXED_SPACE))
	assert.Eq(t, block.Replace("{{ .Class }}"), "quando-system")
	assert.Eq(t, block.Replace("{{ .TypeName }}"), "system.log")
	assert.Eq(t, block.Replace("{{ .Widgets }}"), "Log&nbsp;")
	assert.Eq(t, block.Replace("{{ .Params }}"), "")
}

func TestNewStringInput(t *testing.T) {
	block := AddNew("system.log", "system",
		text.New("Log "),
		stringinput.New("name"))
	assert.Eq(t, block.Replace("{{ .Params }}"), `name"${name}"`)
}

func TestNewNumberInput(t *testing.T) {
	block := AddNew("system.log", "system",
		text.New("Log "),
		numberinput.New("num"))
	assert.Eq(t, block.Replace("{{ .Params }}"), `num#${num}`)
	assert.Eq(t, block.Replace("{{ .Widgets }}"),
		`Log <input data-quando-name='num' type='number'/>`)
}

func TestNewPercentInput(t *testing.T) {
	block := AddNew("display.width", "display",
		text.New("Width "),
		percentinput.New("width"))
	assert.Eq(t, block.Replace("{{ .Class }}"), "quando-display")
	assert.Eq(t, block.Replace("{{ .TypeName }}"), "display.width")
	assert.Eq(t, block.Replace("{{ .Widgets }}"), `Width <input data-quando-name='width' type='number' min='0' max='100'/>%`)
	assert.Eq(t, block.Replace("{{ .Params }}"), "width#${width}")
}
