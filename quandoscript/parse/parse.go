package parse

import (
	"bufio"
	"errors"
	"fmt"
	"os"
	"regexp"
	"strconv"
	"strings"

	"quando/quandoscript/action"
	"quando/quandoscript/action/param"
	"quando/quandoscript/definition"
)

var LibraryNewAction func(word string, early param.Params, late_params param.Params) *action.Action // injected by library

type Input struct {
	Line string
	Err  error
}

func (input *Input) matchStart(rxp string, lookfor string) (found string) {
	arr := regexp.MustCompile("^" + rxp).FindStringIndex(input.Line)
	if len(arr) != 2 {
		input.Err = errors.New("Failed to match " + lookfor + " with '" + rxp + "' at start of '" + input.Line + "'")
		return
	}
	count := arr[1] // start must be 0 due to regexp starting ^
	found = input.Line[:count]
	input.Line = input.Line[count:]
	return
}

func line(line string) (lineid int, word string, params param.Params, err error) {
	if line == "" { // word and err are nil for a blank line
		return
	}
	input := Input{Line: line}
	lineid = input.getId()
	if input.Err != nil {
		err = input.Err
		return
	}
	input.StripSpacer()
	if input.Err != nil {
		err = input.Err
		return
	}
	word = input.GetWord()
	if input.Err != nil {
		err = input.Err
		return
	}
	params = input.getParams()
	if input.Err != nil {
		err = input.Err
		return
	}
	return
}

func Lines(in string) { // setup the whole script as actions for calling - only does early setup
	scanner := bufio.NewScanner(strings.NewReader(in))
	new_group := true
	for scanner.Scan() {
		in := scanner.Text()
		if in == "" {
			// fmt.Println("End of main block")
			new_group = true
			continue
		}
		lineid, word, params, err := line(scanner.Text())
		if err != nil {
			fmt.Println(lineid, word, params, err)
		}
		o := LibraryNewAction(word, params, nil)
		if new_group {
			action.NewGroup()
			new_group = false
		}
		action.Add(lineid, o)
	}
}

// removes and returns a [0..9] integer from start of input.Line, or input.Err.
func (input *Input) getId() (id int) {
	found := input.matchStart("([0-9])+", "Id")
	if found == "" {
		return
	}
	var err error
	id, err = strconv.Atoi(found) // error must be nil
	if err != nil {
		fmt.Println("CODING ERROR IN parse:getId()")
		os.Exit(99)
	}
	return
}

// strips space/tab from start of input.Line, or input.Err if missing
func (input *Input) StripSpacer() {
	_ = input.matchStart("[( )\t]+", "space/tab")
}

// removes and returns a word at start of input.Line, or err if missing.
// word starts with a letter, then may also include digits . or _
func (input *Input) GetWord() string {
	return input.matchStart("[a-zA-Z][a-zA-Z0-9_.]*", "word starting a-z or A-Z")
}

// removes and returns a string" at start of input.Line, or err if missing.
// the string may contain \\, \", \t and \n, which will be substituted
// N.B. string does NOT start with '"' - this will already have parsed
func (input *Input) GetString() (str string) {
	for {
		if len(input.Line) == 0 {
			input.Err = errors.New(`string does not terminate with '"' before end of line`)
			break
		}
		ch := input.Line[:1]
		input.Line = input.Line[1:] // consume first character
		var skip bool
		if ch == `"` {
			break
		}
		if ch == `\` && len(input.Line) > 0 {
			ch2 := input.Line[:1]
			switch ch2 {
			case `\`:
				ch = `\`
				skip = true
			case "t":
				ch = "\t"
				skip = true
			case "n":
				ch = "\n"
				skip = true
			case `"`:
				ch = `"`
				skip = true
			}
		}
		str += ch
		if skip {
			input.Line = input.Line[1:]
		}
	}
	return str
}

// removes and returns a decimal floating point number at start of input.Line, or err if missing.
func (input *Input) getFloat() (f float64) {
	found := input.matchStart("[+-]?[0-9]+[.]?[0-9]*([eE][+-]?[0-9]+)?", "floating point number")
	if found == "" {
		return
	}
	var err error
	f, err = strconv.ParseFloat(found, 64) // error must be nil
	if err != nil {
		fmt.Println("CODING ERROR IN parse:getFloat()")
		os.Exit(99)
	}
	return
}

// returns parameters as nil if just (), or Param parameters, err if not starting with ( or not terminated correctly with ).
// remaining is the rest of the string
func (input *Input) getParams() (params param.Params) {
	found := input.matchStart(`\(`, "(")
	if found == "" {
		return
	}
	params = make(param.Params)
	for {
		key, param := getParam(input)
		if key == "" { // no key
			break
		}
		if input.Err != nil {
			return
		}
		params[key] = param
		found = input.matchStart(`,`, "")
		if found != "," {
			input.Err = nil // clear out err and drop out of loop
			break
		}
	}
	_ = input.matchStart(`\)`, ")") // we can return whether we found or not
	return
}

// key returns "" when none found
func getParam(input *Input) (key string, p param.Param) {
	restore := input.Line
	// Check for ) and return without error or change to input if found
	found := input.matchStart(`\)`, "")
	input.Err = nil   // supress error
	if found == `)` { // found ) so reset
		input.Line = restore
		input.Err = nil
		return
	}
	key = input.GetWord()
	if key == "" {
		return
	}
	// check for valid prefix
	prefix := input.matchStart(`[!:="#]`, "type prefix/assignment missing ")
	switch prefix {
	case "":
		p = definition.UNKNOWN{} // holds nothing?!
	case "!": // check for boolean
		found = input.matchStart("(true|false)", "")
		if found != "" { // i.e. if found
			p = (found == "true")
			return
		}
	case ":": // check for lineid
		lineid := input.getId()
		if input.Err == nil {
			p = lineid
			return
		}
	case "=": // check for variable
		name := input.GetWord()
		if input.Err == nil {
			p = name
			return
		}
	case `"`: // check for string
		str := input.GetString()
		if input.Err == nil {
			p = str
			return
		}
	case "#": // check for float
		num := input.getFloat()
		if input.Err == nil {
			p = num
			return
		}
	}
	// error (or not handled, e.g. due to mismatch with generator)
	key = "" // have to reset since already stored
	input.Line = restore
	return
}

func (input *Input) GetColonDoublequote() (err error) {
	found := input.matchStart(`:"`, `:"`)
	if found == "" {
		err = errors.New(`missing ':"' in ` + input.Line)
	}
	return
}
