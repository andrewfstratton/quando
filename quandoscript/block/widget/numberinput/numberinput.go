package numberinput

import (
	"fmt"

	"quando/quandoscript/action/param"
)

type Pfloat *float64
type Pint *int64

type NumberInput struct {
	Name    string
	Default Pfloat
	Empty   string
	Width   Pint
	Min     Pint
	Max     Pint
}

func New(name string) *NumberInput {
	return &NumberInput{Name: name}
}

func (ni *NumberInput) Html() (txt string) {
	txt = fmt.Sprintf("<input data-quando-name='%v' type='number'", ni.Name)
	if ni.Default != nil {
		txt += fmt.Sprintf(" value='%v'", *ni.Default)
	}
	if ni.Empty != "" {
		txt += " placeholder='" + ni.Empty + "'"
	}
	if ni.Width != nil {
		txt += fmt.Sprintf(" style='width:%dem'", *ni.Width)
	}
	// needs '' around number to avoid issues?!
	if ni.Min != nil {
		txt += fmt.Sprintf(" min='%d'", *ni.Min)
	}
	if ni.Max != nil {
		txt += fmt.Sprintf(" max='%d'", *ni.Max)
	}
	txt += `/>`
	return
}

func (ni *NumberInput) Generate() string {
	return fmt.Sprintf(`%v#${%v}`, ni.Name, ni.Name)
}

func (ni *NumberInput) Param(outer param.Params) *param.NumberParam {
	return param.NewNumber(ni.Name, 0, outer)
}
