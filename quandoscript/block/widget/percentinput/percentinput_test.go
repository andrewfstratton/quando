package percentinput

import (
	"testing"

	"quando/quandoscript/assert"
	"quando/quandoscript/block/widget"
)

func TestNumberEmpty(t *testing.T) { // n.b. should never happen
	tf := New("")
	assert.Eq(t, tf.Html(), `<input data-quando-name='' type='number' min='0' max='100'/>%`)
}

func TestTextFieldSimple(t *testing.T) {
	tf := New("percent")
	assert.Eq(t, tf.Html(), `<input data-quando-name='percent' type='number' min='0' max='100'/>%`)
	widget.SetFields(tf, `default:"50" empty:"empty" width:"4"`)
	assert.Eq(t, tf.Html(), `<input data-quando-name='percent' type='number' value='50' placeholder='empty' style='width:4em' min='0' max='100'/>%`)
}

func TestScriptSimple(t *testing.T) {
	tf := New("name")
	assert.Eq(t, tf.Generate(), `name#${name}`)
}
