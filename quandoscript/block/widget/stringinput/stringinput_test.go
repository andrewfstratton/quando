package stringinput

import (
	"testing"

	"quando/quandoscript/assert"
	"quando/quandoscript/block/widget"
)

func TestTextFieldEmpty(t *testing.T) { // n.b. should never happen
	tf := New("")
	assert.Eq(t, tf.Html(), `&quot;<input data-quando-name='' type='text'/>&quot;`)
}

func TestTextFieldSimple(t *testing.T) {
	tf := New("name")
	widget.SetFields(tf, `default:"default"`)
	widget.SetFields(tf, `empty:"empty"`)
	assert.Eq(t, tf.Html(), `&quot;<input data-quando-name='name' type='text' value='default' placeholder='empty'/>&quot;`)
}

func TestScriptSimple(t *testing.T) {
	tf := New("name")
	assert.Eq(t, tf.Generate(), `name"${name}"`)
}
