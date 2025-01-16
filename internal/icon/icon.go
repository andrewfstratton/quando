package icon

import (
	"fmt"
	"os"
	"path/filepath"
)

const favicon_location = "editor/favicon.ico"

func Data() []byte {
	bytes, err := os.ReadFile(filepath.FromSlash(favicon_location))
	if err != nil {
		fmt.Println("Failed to find '", favicon_location, "'")
		bytes = nil
	}
	return bytes
}
