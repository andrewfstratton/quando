package deployed

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path"
	"strings"
)

type FilesJSON struct {
	Success bool     `json:"success"`
	Files   []string `json:"files"`
}

func HandleFile(resp http.ResponseWriter, req *http.Request) {
	filename := path.Base(req.URL.Path)
	if !strings.HasSuffix(filename, ".html") {
		http.NotFound(resp, req)
		return
	}
	title := strings.TrimSuffix(filename, ".html")
	contents, err := os.ReadFile("./client/client.html")
	if err != nil {
		fmt.Println("error finding client/client.html - ", err)
		http.NotFound(resp, req)
		return
	}
	str := string(contents)
	str = strings.Replace(str, "{{ title }}", title, 2)
	fmt.Fprint(resp, str)
}

func HandleDirectory(resp http.ResponseWriter, req *http.Request) {
	entries, err := ioutil.ReadDir("./client/deployed_js")
	if err != nil {
		log.Panicf("Missing '/client/deployed_js' directory: %s", err)
	}
	var files []string
	for _, file := range entries {
		filename := file.Name()
		if strings.HasSuffix(filename, ".js") {
			title := strings.TrimSuffix(filename, ".js")
			files = append(files, title)
		}
	}
	filesJSON := FilesJSON{Files: files, Success: true}
	str, _ := json.Marshal(filesJSON)
	resp.Write(str)
}
