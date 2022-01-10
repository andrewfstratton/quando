package deployed

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
)

type FilesJSON struct {
	Success bool     `json:"success"`
	Files   []string `json:"files"`
}

func Handle(resp http.ResponseWriter, req *http.Request) {
	entries, err := ioutil.ReadDir("./client/deployed_js")
	if err != nil {
		log.Panicf("Missing '/client/deployed_js' directory: %s", err)
	}
	var files []string
	for _, file := range entries {
		filename := file.Name()
		files = append(files, filename)
	}
	filesJSON := FilesJSON{Files: files, Success: true}
	str, _ := json.Marshal(filesJSON)
	resp.Write(str)
}
