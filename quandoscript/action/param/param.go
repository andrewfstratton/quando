package param

import (
	"fmt"
	"time"

	"quando/quandoscript/definition"
)

type Param any // horrible but easiest - must be currently
type Params map[string]Param
type StringParam struct {
	Lookup string
	Val    definition.STRING
}

type NumberParam struct {
	Lookup string
	Val    definition.NUMBER
}

type IdParam struct {
	Lookup string
	Val    definition.LINEID
}

func NewString(lookup string, val string, params Params) (param *StringParam) {
	param = &StringParam{Lookup: lookup, Val: val}
	param.Update(params)
	return
}

func (param *StringParam) Update(params Params) {
	p, found := params[param.Lookup]
	if !found {
		return // nothing to update
	}
	switch s := p.(type) {
	case definition.STRING:
		param.Val = s
	case definition.VARIABLE:
		// lookup variable here...
	default:
		fmt.Println("Error : ", param.Lookup, " incorrect type")
	}
}

func NewNumber(lookup string, val float64, params Params) (param *NumberParam) {
	param = &NumberParam{Lookup: lookup, Val: val}
	param.Update(params)
	return
}

func (param *NumberParam) Update(params Params) {
	p, found := params[param.Lookup]
	if !found {
		return
	}
	switch n := p.(type) {
	case definition.NUMBER:
		param.Val = n
	case definition.VARIABLE:
		// lookup variable here...
	default:
		fmt.Println("Error : ", param.Lookup, " incorrect type")
	}
}

func (param *NumberParam) Int() int {
	return int(param.Val)
}

func (param *NumberParam) Duration() time.Duration {
	// N.B. below is to allow for sub second times...
	return time.Duration(param.Val * float64(time.Second))
}

func NewId(lookup string, val int, params Params) (param *IdParam) {
	param = &IdParam{Lookup: lookup, Val: val}
	param.Update(params)
	return
}

func (param *IdParam) Update(params Params) {
	p, found := params[param.Lookup]
	if !found {
		return
	}
	switch l := p.(type) {
	case definition.LINEID:
		param.Val = l
	case definition.VARIABLE:
		// lookup variable here...
	default:
		fmt.Println("Error : ", param.Lookup, " incorrect type")
	}
}
