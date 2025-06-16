package text

import (
	"quando/quandoscript/block/widget"
)

type Text struct {
	Txt     string
	Italic  bool
	Bold    bool
	Iconify bool
}

func New(t string) *Text {
	return &Text{Txt: t}
}

func (t *Text) Html() (txt string) {
	txt = t.Txt
	if t.Italic {
		txt = widget.TagText(txt, "i")
	}
	if t.Bold {
		txt = widget.TagText(txt, "b")
	}
	if t.Iconify {
		txt = widget.OpenCloseTag(txt, `span class="iconify"`, "span")
	}
	return
}
