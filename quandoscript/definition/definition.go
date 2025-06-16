package definition

import (
	"fmt"
	"reflect"
	"strings"
)

type Definition interface {
	TypeName() string
	Class() string
}

type (
	BOOLEAN  = bool
	STRING   = string
	NUMBER   = float64
	LINEID   = int
	UNKNOWN  = struct{}
	VARIABLE string // n.b. is not an alias which may cause extra code
	MENU     = string
	COLOUR   = string
	INTEGER  = int
	PERCENT  = float64
)

func SetupWidget(defn any, uName string) {
	if uName == "_" || uName == "" {
		return
	}
	// using reflection to set fields
	v := reflect.ValueOf(defn).Elem() // i.e. pointer to struct
	vField := v.FieldByName(uName)    // get (input) widget
	if vField.CanSet() {
		vName := vField.FieldByName("Name")
		if vName.CanSet() {
			lName := strings.ToLower(uName[:1]) + uName[1:]
			vName.SetString(lName)
			return
		}
		fmt.Printf("Cannot set Name on %T\n", defn)
		return
	}
	fmt.Printf("Cannot set field '%s' on %T\n", uName, defn)
}
