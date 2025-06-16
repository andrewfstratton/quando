package library

import (
	"fmt"
	"os"
	"runtime/debug"
	"testing"

	"quando/quandoscript/action"
	"quando/quandoscript/action/param"
	"quando/quandoscript/block"
	"quando/quandoscript/menu"
	"quando/quandoscript/parse"
)

const (
	SERVER  = "server"
	UNKNOWN = ""
)

var blocks map[string]*block.Block // lookup for all block types
var menus map[string]*menu.Menu    // groups of blocks by 'class' for menu
var classes []string

func addBlock(b *block.Block) { // call through block New
	_, inuse := blocks[b.TypeName]
	if inuse {
		fmt.Println(`BLOCK "` + b.TypeName + `" ALREADY EXISTS`)
		if testing.Testing() {
			return
		}
		debug.PrintStack()
		os.Exit(99)
	}
	blocks[b.TypeName] = b
	bl, found := menus[b.Class]
	if !found {
		bl = menu.New(b.Class)
		menus[b.Class] = bl
		classes = append(classes, b.Class)
	}
	bl.Add(b)
}

func FindBlock(block_type string) (block *block.Block, found bool) {
	block, found = blocks[block_type]
	return
}

func NewAction(word string, early param.Params, late_params param.Params) *action.Action {
	bt, found := FindBlock(word)
	if !found {
		fmt.Println("Error : New word failing")
		return nil
	}
	late := bt.Early(early)              // run the early binding
	return action.New(late, late_params) // return the late binding with the closure
}

func Classes() []string {
	return classes
}

func Menus(class string) *menu.Menu {
	return menus[class]
}

func init() {
	blocks = make(map[string]*block.Block)
	menus = make(map[string]*menu.Menu)
	block.AddToLibrary = addBlock      // inject function
	parse.LibraryNewAction = NewAction // inject function
}
