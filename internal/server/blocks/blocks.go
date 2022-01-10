package blocks

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"regexp"
	"strings"
)

type MenuJSON struct {
	// For Menu titles based on file name
	Class string `json:"class,omitempty"`
	Name  string `json:"name,omitempty"`
	//  For both Blocks and titles
	Title bool `json:"title"`
	// For blocks
	Html string `json:"html,omitempty"`
}

type BlocksJSON struct {
	Success bool       `json:"success"`
	Blocks  []MenuJSON `json:"blocks"`
}

func parseFilename(filename string) (*MenuJSON, error) {
	if filename == "README.md" {
		return nil, nil // Ignore without error
	}
	if !strings.HasSuffix(filename, ".htm") {
		return nil, errors.New("File/folder in client/blocks '" + filename + "' ignored") // ignore files that don't end in .htm
	}
	front := strings.Index(filename, "_")
	if front == -1 {
		return nil, errors.New("Blocks file '" + filename + "' should be of the form 9999_lower_case_name.htm")
		// ignore files that are missing "_"
	}
	inner := filename[front+1 : len(filename)-4]
	class := strings.ReplaceAll(inner, "_", "-")
	words := strings.Split(inner, "_")
	name := ""
	for _, word := range words {
		name += " " + strings.ToUpper(word[0:1]) + word[1:]
	}
	name = name[1:] // remove first space
	menuJSON := MenuJSON{Name: name, Class: class, Title: true}
	return &menuJSON, nil
}

func parseBlock(content string) (string, *MenuJSON) {
	split := regexp.MustCompile(`\n[\r?\n]+`).Split(content, 2)
	html := split[0]
	remaining := ""
	var menuJSON MenuJSON
	if html != "" {
		menuJSON = MenuJSON{Title: false, Html: html}
	}
	if len(split) > 1 {
		remaining = split[1]
	}
	return remaining, &menuJSON
}

func Handle(resp http.ResponseWriter, req *http.Request) {
	entries, err := ioutil.ReadDir("./blocks")
	if err != nil {
		log.Panicf("Missing '/blocks' directory: %s", err)
	}
	var blocks []MenuJSON
	for _, file := range entries {
		filename := file.Name()
		menuJSON, err := parseFilename(filename)
		if err != nil {
			fmt.Println(err)
		} else if menuJSON != nil {
			blocks = append(blocks, *menuJSON)
			bytes, err := os.ReadFile("./blocks/" + filename)
			if err != nil {
				fmt.Println("error reading file '"+filename+"' - ", err)
			} else {
				content := string(bytes)
				for content != "" {
					new_content, blockJSON := parseBlock(content)
					content = new_content
					blocks = append(blocks, *blockJSON)
				}
			}
		}
	}
	blocksJSON := BlocksJSON{Blocks: blocks, Success: true}
	str, _ := json.Marshal(blocksJSON)
	resp.Write(str)
}
