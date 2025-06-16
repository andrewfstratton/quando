package block

import (
	"bytes"
	"fmt"
	"os"
	"reflect"
	"runtime/debug"
	"testing"
	"text/template"

	"quando/quandoscript/action"
	"quando/quandoscript/block/script"
	"quando/quandoscript/block/widget"
	"quando/quandoscript/block/widget/idinput"
	"quando/quandoscript/block/widget/numberinput"
	"quando/quandoscript/block/widget/stringinput"
	"quando/quandoscript/block/widget/text"
	"quando/quandoscript/definition"
)

type Block struct {
	TypeName string
	Class    string
	widgets  []widget.Widget
	Early    action.Early
}

var AddToLibrary func(*Block) // injected by library

func New(defn any) (block *Block) {
	t := reflect.TypeOf(defn).Elem() // i.e. pointer to struct
	// 	N.B. TypeName and Class exist in Defn - not in widgets
	block = &Block{}
	for i := range t.NumField() {
		f := t.Field(i)
		tag := f.Tag
		underscoreTag := tag.Get("_")
		if f.Name == "TypeName" {
			block.TypeName = underscoreTag
			continue
		}
		if f.Name == "Class" {
			block.Class = underscoreTag
			continue
		}
		// Otherwise check the type
		var w widget.Widget
		switch f.Type.Name() {
		case "Text":
			w = &text.Text{}
		case "StringInput":
			w = &stringinput.StringInput{Name: f.Name}
		case "NumberInput":
			w = &numberinput.NumberInput{Name: f.Name}
		case "IdInput":
			w = &idinput.IdInput{Name: f.Name}
		default:
			fmt.Println("not yet handling:", f.Type.Name())
			if underscoreTag != "" {
				fmt.Println("_ = ", underscoreTag)
			}
			continue
		}
		// N.B. run when a valid widget has been created - note the use of continue above
		widget.SetFields(w, string(tag))
		block.widgets = append(block.widgets, w)
		definition.SetupWidget(defn, f.Name)
	}
	if AddToLibrary == nil { // handle tests when AddToLibrary has not been injected by library.init()
		if testing.Testing() {
			return
		}
		fmt.Println("Fatal Error: AddToLibrary is nil, cannot add block to library")
	}
	AddToLibrary(block)
	return
}

func AddNew(typeName string, class string, widgets ...widget.Widget) (block *Block) {
	if typeName == "" {
		fmt.Println(`ATTEMPT TO CREATE BLOCK WITH "" BLOCK TYPE`)
		if testing.Testing() {
			return nil
		}
		debug.PrintStack()
		os.Exit(99)
	}
	if class != "" {
		class = "quando-" + class
	}
	block = &Block{
		TypeName: typeName,
		Class:    class,
	}
	block.widgets = append(block.widgets, widgets...)
	if testing.Testing() && AddToLibrary == nil { // handle tests when AddToLibrary has not been injected by library.init()
		return
	}
	AddToLibrary(block)
	return
}

func (block *Block) Op(early action.Early) {
	if early == nil {
		fmt.Printf("Warning: block type '%s' has nil operation\n", block.TypeName)
	}
	block.Early = early
}

func (block *Block) Replace(original string) string {
	var buf bytes.Buffer
	t, err := template.New("tmp").Parse(original)
	if err != nil {
		fmt.Println(`TEMPLATE PARSING ERROR`)
		if testing.Testing() {
			return ""
		}
		debug.PrintStack()
		os.Exit(99)
	}
	t.Execute(&buf, block)
	return buf.String()
}

func (block *Block) Widgets() (asHtml string) {
	for _, w := range block.widgets {
		asHtml += w.Html()
	}
	return
}

func (block *Block) Params() (asHtml string) {
	for _, w := range block.widgets {
		s, ok := w.(script.Generator) // ignore widgets that are purely visual, i.e. do not provide parameters
		if ok {
			if asHtml != "" { // separate parameters with comma
				asHtml += ","
			}
			asHtml += s.Generate()
		}
	}
	return asHtml
}
