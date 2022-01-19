package media

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"
)

type replyJSON struct {
	Success bool     `json:"success"`
	Files   []string `json:"files"`
	Folders []string `json:"folders"`
}

var MediaMap = map[string][]string{
	"video":   {"ogg", "ogv", "mp4", "webm"},
	"audio":   {"mp3", "wav"},
	"images":  {"bmp", "jpg", "jpeg", "png", "gif"},
	"objects": {"gltf", "glb"}}

func getFilesFolders(directory string, suffixes []string) (files []string, folders []string, err error) {
	entries, err := ioutil.ReadDir("./media/" + directory)
	if err != nil {
		fmt.Println("Missing directory: ", directory, " - ", err)
		return
	}
	for _, entry := range entries {
		filename := entry.Name()
		if entry.IsDir() {
			folders = append(folders, filename)
			continue
		}
		for _, suffix := range suffixes {
			if strings.HasSuffix(filename, suffix) {
				files = append(files, filename)
				break
			}
		}
	}
	return
}

func HandleDirectory(resp http.ResponseWriter, req *http.Request) {
	if req.Method != "GET" {
		http.NotFound(resp, req)
		return
	}
	// remove first character, i.e. '/'
	parts := strings.SplitN(req.URL.Path[1:], "/", 2)
	mediaType := parts[0]
	location := ""
	if len(parts) == 2 {
		location = parts[1]
	}
	suffixes := MediaMap[mediaType]
	files, folders, err := getFilesFolders(location, suffixes)
	if err != nil {
		fmt.Println("Deployment or coding directory error - ", err)
		http.NotFound(resp, req)
		return
	}
	reply := replyJSON{Files: files, Folders: folders, Success: true}
	str, err := json.Marshal(reply)
	if err != nil {
		fmt.Println("Error Marshalling JSON - ", err)
		http.NotFound(resp, req)
		return
	}
	resp.Write(str)
	return
}

func Handle(resp http.ResponseWriter, req *http.Request) {
	switch req.Method {
	case "GET":
		location := "." + req.URL.Path
		http.ServeFile(resp, req, location)
		return
	case "POST":
		fmt.Println("NYI POST:", req.URL.Path)
		return
	default:
		http.NotFound(resp, req)
		return
	}
}
