package idinput

import (
	"fmt"

	"quando/quandoscript/action/param"
)

type IdInput struct {
	Name string
}

func New(name string) *IdInput {
	return &IdInput{Name: name}
}

func (ii *IdInput) Html() (txt string) {
	txt = fmt.Sprintf("<input data-quando-name='%v' type='id'/>", ii.Name)
	return
}

func (ii *IdInput) Generate() string {
	// return fmt.Sprintf(`%v#${%v}`, ni.Name, ni.Name)
	return "" // NYI
}

func (ii *IdInput) Param(outer param.Params) *param.IdParam {
	return param.NewId(ii.Name, 0, outer)
}
