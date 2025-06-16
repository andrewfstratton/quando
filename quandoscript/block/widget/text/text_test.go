package text

import (
	"testing"

	"quando/quandoscript/assert"
	"quando/quandoscript/block/widget"
)

func TestTextSimple(t *testing.T) {
	txt := New("")
	assert.Eq(t, txt.Html(), "")

	txt = New("Hello")
	assert.Eq(t, txt.Html(), "Hello")
	widget.SetFields(txt, `italic:"true"`)
	assert.Eq(t, txt.Italic, true)
	assert.Eq(t, txt.Html(), "<i>Hello</i>")
	widget.SetFields(txt, `bold:"true"`)
	widget.SetFields(txt, `iconify:"true"`)
	assert.Eq(t, txt.Html(), `<span class="iconify"><b><i>Hello</i></b></span>`)
	txt = &Text{}
	widget.SetFields(txt, `txt:"Hi Bob" italic:"false" iconify:"true" bold:"true"`)
	assert.Eq(t, txt.Html(), `<span class="iconify"><b>Hi Bob</b></span>`) // n.b, order is not preserved?!
}
