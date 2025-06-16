package stringinput

import (
	"fmt"

	"quando/quandoscript/action/param"
)

type StringInput struct {
	Name    string
	Default string
	Empty   string
}

func New(name string) *StringInput {
	return &StringInput{Name: name}
}

func (si *StringInput) Html() (txt string) {
	txt = `&quot;<input data-quando-name='` + si.Name + `' type='text'`
	if si.Default != "" {
		txt += " value='" + si.Default + "'"
	}
	if si.Empty != "" {
		txt += " placeholder='" + si.Empty + "'"
	}
	txt += `/>&quot;`
	return
}

func (si *StringInput) Generate() string {
	return fmt.Sprintf(`%v"${%v}"`, si.Name, si.Name)
}

func (si *StringInput) Param(outer param.Params) *param.StringParam {
	return param.NewString(si.Name, "", outer)
}
