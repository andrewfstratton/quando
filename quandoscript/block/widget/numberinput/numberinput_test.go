package numberinput

import (
	"testing"

	"quando/quandoscript/assert"
	"quando/quandoscript/block/widget"
)

func TestNumberEmpty(t *testing.T) { // n.b. should never happen
	tf := New("")
	assert.Eq(t, tf.Html(), `<input data-quando-name='' type='number'/>`)
}

func TestTextFieldSimple(t *testing.T) {
	tf := New("name")
	widget.SetFields(tf, `default:"10" empty:"empty"`)
	assert.Eq(t, tf.Html(), `<input data-quando-name='name' type='number' value='10' placeholder='empty'/>`)
}

func TestTextFieldSimple2(t *testing.T) {
	tf := New("name")
	widget.SetFields(tf, `default:"10" empty:"empty" width:"4" min:"0" max:"100"`)
	assert.Eq(t, tf.Html(), `<input data-quando-name='name' type='number' value='10' placeholder='empty' style='width:4em' min='0' max='100'/>`)
}

func TestScriptSimple(t *testing.T) {
	tf := New("name")
	assert.Eq(t, tf.Generate(), `name#${name}`)
}
