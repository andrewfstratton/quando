package media

import (
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
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
		if suffixes == nil {
			files = append(files, filename)
		} else {
			for _, suffix := range suffixes {
				if strings.HasSuffix(filename, suffix) {
					files = append(files, filename)
					break
				}
			}
		}
	}
	return
}

func getMediaDirectory(w http.ResponseWriter, req *http.Request) {
	if req.Method != "GET" {
		http.NotFound(w, req)
		return
	}
	// remove first character if '/'
	parts := strings.SplitN(strings.TrimPrefix(req.URL.Path, "/"), "/", 2)
	mediaType := parts[0]
	location := ""
	if len(parts) == 2 {
		location = parts[1]
	}
	suffixes, exists := MediaMap[mediaType]
	if !exists { // No suffix means this is finding folder for upload
		suffixes = nil // don't filter by suffix
	}
	files, folders, err := getFilesFolders(location, suffixes)
	if err != nil {
		fmt.Println("Deployment or coding directory error - ", err)
		http.NotFound(w, req)
		return
	}
	reply := replyJSON{Files: files, Folders: folders, Success: true}
	str, err := json.Marshal(reply)
	if err != nil {
		fmt.Println("Error Marshalling JSON - ", err)
		http.NotFound(w, req)
		return
	}
	w.Write(str)
	return
}

func HandleGetMediaDirectory(w http.ResponseWriter, req *http.Request) {
	getMediaDirectory(w, req)
}

func copyFile(req *http.Request) (success bool) {
	location := strings.TrimPrefix(req.URL.Path, "/")
	req.ParseMultipartForm(req.ContentLength)
	uploadedFile, handler, err := req.FormFile("file")
	if err != nil {
		fmt.Println("Error Retrieving the File - ", err)
		return
	}
	defer uploadedFile.Close()
	destination, err := os.Create("./" + location + "/" + handler.Filename)
	if err != nil {
		fmt.Println("Error creating file - ", err)
		return
	}
	defer destination.Close()
	_, err = io.Copy(destination, uploadedFile)
	if err != nil {
		fmt.Println("Error copying file - ", err)
		return
	}
	return true
}

func HandleMedia(w http.ResponseWriter, req *http.Request) {
	switch req.Method {
	case "GET":
		if strings.HasSuffix(req.URL.Path, "/") { // directory
			getMediaDirectory(w, req)
			return
		}
		http.ServeFile(w, req, "."+req.URL.Path)
		return
	case "POST":
		success := copyFile(req)
		reply := replyJSON{Success: success}
		str, err := json.Marshal(reply)
		if err != nil {
			fmt.Println("Error Marshalling JSON - ", err)
			http.NotFound(w, req)
			return
		}
		w.Write(str)
		return
	default:
		http.NotFound(w, req)
		return
	}
}
