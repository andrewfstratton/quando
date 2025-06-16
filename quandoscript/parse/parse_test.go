package parse

import (
	"testing"

	"quando/quandoscript/assert"
)

func TestParseId(t *testing.T) {
	match := Input{Line: ""}
	id := match.getId()
	assert.Eq(t, id, 0) // id must be 1+
	assert.Neq(t, match.Err, nil)
	assert.Eq(t, match.Line, "")

	match = Input{Line: ",key=false)"}
	id = match.getId()
	assert.Eq(t, id, 0) // id must be 1+
	assert.Neq(t, match.Err, nil)
	assert.Eq(t, match.Line, ",key=false)")

	match = Input{Line: "90 ignore"}
	id = match.getId()
	assert.Eq(t, id, 90)
	assert.Eq(t, match.Err, nil)
	assert.Eq(t, match.Line, " ignore")
}

func TestParseSpacer(t *testing.T) {
	match := Input{Line: ""}
	match.StripSpacer()
	assert.Neq(t, match.Err, nil)
	assert.Eq(t, match.Line, "")

	match = Input{Line: "word.word"}
	match.StripSpacer()
	assert.Neq(t, match.Err, nil)
	assert.Eq(t, match.Line, "word.word")

	match = Input{Line: " \t  w"}
	match.StripSpacer()
	assert.Eq(t, match.Err, nil)
	assert.Eq(t, match.Line, "w")

}

func TestParseWord(t *testing.T) {
	match := Input{Line: ""}
	word := match.GetWord()
	assert.Neq(t, match.Err, nil)
	assert.Eq(t, match.Line, "")
	assert.Eq(t, word, "")

	match = Input{Line: "w"}
	word = match.GetWord()
	assert.Eq(t, match.Err, nil)
	assert.Eq(t, match.Line, "")
	assert.Eq(t, word, "w")

	match = Input{Line: "word.word()"}
	word = match.GetWord()
	assert.Eq(t, match.Err, nil)
	assert.Eq(t, match.Line, "()")
	assert.Eq(t, word, "word.word")
}

func TestParseParams(t *testing.T) {
	match := Input{Line: ""}
	params := match.getParams()
	assert.Neq(t, match.Err, nil)
	assert.Eq(t, match.Line, "")
	assert.True(t, params == nil)

	match = Input{Line: "()"}
	params = match.getParams()
	assert.Eq(t, match.Err, nil)
	assert.Eq(t, match.Line, "")
	assert.Eq(t, len(params), 0) //i.e. no parameters

	match = Input{Line: "(x!true)"}
	params = match.getParams()
	assert.Eq(t, match.Err, nil)
	assert.Eq(t, match.Line, "")
	assert.Eq(t, len(params), 1)
	assert.Eq(t, params["x"], true)

	match = Input{Line: `(a"hello!",b:12345,x=val,y!true,z#-12.34e56)`}
	params = match.getParams()
	assert.Eq(t, match.Err, nil)
	assert.Eq(t, match.Line, "")
	assert.Eq(t, len(params), 5)
	assert.Eq(t, params["a"], "hello!")
	assert.Eq(t, params["b"], 12345)
	assert.Eq(t, params["x"], "val")
	assert.Eq(t, params["y"], true)
	assert.Eq(t, params["z"], -12.34e56)
}

func TestParseParamBool(t *testing.T) {
	match := Input{Line: ""}
	key, _ := getParam(&match)
	assert.Eq(t, key, "")
	assert.Eq(t, match.Line, "")
	assert.Neq(t, match.Err, nil)

	match = Input{Line: `)`} // closing ) ends parameters, no error
	key, p := getParam(&match)
	assert.Eq(t, key, "")
	assert.Eq(t, match.Line, ")")
	assert.True(t, p == nil)
	assert.Eq(t, match.Err, nil)

	match = Input{Line: "!a"}
	key, _ = getParam(&match)
	assert.Eq(t, key, "")
	assert.Eq(t, match.Line, "!a")
	assert.Neq(t, match.Err, nil)

	match = Input{Line: "a!"}
	key, p = getParam(&match)
	assert.Neq(t, match.Err, nil)
	assert.Eq(t, match.Line, "a!")
	assert.Eq(t, key, "")
	assert.True(t, p == nil)

	match = Input{Line: "x!true"}
	key, p = getParam(&match)
	assert.Eq(t, match.Err, nil)
	assert.Eq(t, match.Line, "")
	assert.Eq(t, key, "x")
	assert.Eq(t, p, true)

	match = Input{Line: "y!false,z!true"}
	key, p = getParam(&match)
	assert.Eq(t, match.Err, nil)
	assert.Eq(t, match.Line, ",z!true")
	assert.Eq(t, key, "y")
	assert.Eq(t, p, false)
}

func TestParseParamId(t *testing.T) {
	match := Input{Line: "a:"}
	key, p := getParam(&match)
	assert.Eq(t, key, "")
	assert.Eq(t, match.Line, "a:")
	assert.True(t, p == nil)
	assert.Neq(t, match.Err, nil)

	match = Input{Line: ":a"}
	key, p = getParam(&match)
	assert.Eq(t, key, "")
	assert.Eq(t, match.Line, ":a")
	assert.True(t, p == nil)
	assert.Neq(t, match.Err, nil)

	match = Input{Line: "x:1"}
	key, p = getParam(&match)
	assert.Eq(t, key, "x")
	assert.Eq(t, match.Line, "")
	assert.Eq(t, match.Err, nil)
	assert.Eq(t, p, 1)

	match = Input{Line: "y:99,x:12"}
	key, p = getParam(&match)
	assert.Eq(t, key, "y")
	assert.Eq(t, match.Line, ",x:12")
	assert.Eq(t, match.Err, nil)
	assert.Eq(t, p, 99)
}

func TestParseParamVariable(t *testing.T) {
	match := Input{Line: "a="}
	key, p := getParam(&match)
	assert.Eq(t, key, "")
	assert.Eq(t, match.Line, "a=")
	assert.True(t, p == nil)
	assert.Neq(t, match.Err, nil)

	match = Input{Line: "=a"}
	key, p = getParam(&match)
	assert.Eq(t, key, "")
	assert.Eq(t, match.Line, "=a")
	assert.True(t, p == nil)
	assert.Neq(t, match.Err, nil)

	match = Input{Line: "x=y"}
	key, p = getParam(&match)
	assert.Eq(t, key, "x")
	assert.Eq(t, match.Line, "")
	assert.Eq(t, match.Err, nil)
	assert.Eq(t, p, "y")

	match = Input{Line: "y=V_a9,x=txt"}
	key, p = getParam(&match)
	assert.Eq(t, key, "y")
	assert.Eq(t, match.Line, ",x=txt")
	assert.Eq(t, match.Err, nil)
	assert.Eq(t, p, "V_a9")
}

func TestParseParamString(t *testing.T) {
	match := Input{Line: `a"`}
	key, p := getParam(&match)
	assert.Eq(t, key, "")
	assert.Eq(t, match.Line, `a"`)
	assert.True(t, p == nil)
	assert.Neq(t, match.Err, nil)

	match = Input{Line: `"a`}
	key, p = getParam(&match)
	assert.Eq(t, key, "")
	assert.Eq(t, match.Line, `"a`)
	assert.True(t, p == nil)
	assert.Neq(t, match.Err, nil)

	match = Input{Line: `x"y"`}
	key, p = getParam(&match)
	assert.Eq(t, key, "x")
	assert.Eq(t, match.Line, "")
	assert.Eq(t, match.Err, nil)
	assert.Eq(t, p, "y")

	match = Input{Line: `y"\\S\tt\nr\"",x"txt"`}
	key, p = getParam(&match)
	assert.Eq(t, key, "y")
	assert.Eq(t, match.Line, `,x"txt"`)
	assert.Eq(t, match.Err, nil)
	assert.Eq(t, p, "\\S\tt\nr"+`"`)
}

func TestParseParamNumber(t *testing.T) {
	match := Input{Line: "a#"}
	key, p := getParam(&match)
	assert.Eq(t, key, "")
	assert.Eq(t, match.Line, "a#")
	assert.True(t, p == nil)
	assert.Neq(t, match.Err, nil)

	match = Input{Line: "#a"}
	key, p = getParam(&match)
	assert.Eq(t, key, "")
	assert.Eq(t, match.Line, "#a")
	assert.True(t, p == nil)
	assert.Neq(t, match.Err, nil)

	match = Input{Line: "x#1"}
	key, p = getParam(&match)
	assert.Eq(t, key, "x")
	assert.Eq(t, match.Line, "")
	assert.Eq(t, match.Err, nil)
	assert.Eq(t, p, 1.0)

	match = Input{Line: "y#-0.99,x#12"}
	key, p = getParam(&match)
	assert.Eq(t, key, "y")
	assert.Eq(t, match.Line, ",x#12")
	assert.Eq(t, match.Err, nil)
	assert.Eq(t, p, -0.99)
}

func TestParseLine(t *testing.T) {
	t.Fail()
}

func TestParseLines(t *testing.T) {
	t.Fail()
}
