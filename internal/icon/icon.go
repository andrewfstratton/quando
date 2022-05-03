package icon

import (
	"fmt"
	"io/ioutil"
	"path/filepath"
)

const favicon_location = "editor/favicon.ico"

func Data() []byte {
	bytes, err := ioutil.ReadFile(filepath.FromSlash(favicon_location))
	if err != nil {
		fmt.Println("Failed to find '", favicon_location, "'")
		bytes = nil
	}
	return bytes
}
