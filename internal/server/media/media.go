package media

import (
	"encoding/json"
	"fmt"
	"io"
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

func getFileFolderNames(directory string, suffixes []string) (fileNames []string, folderNames []string, err error) {
	entries, err := os.ReadDir("./media/" + directory)
	if err != nil {
		fmt.Println("Missing directory: ", directory, " - ", err)
		return
	}
	for _, entry := range entries {
		name := entry.Name()
		if entry.IsDir() {
			folderNames = append(folderNames, name)
			continue
		}
		if suffixes == nil {
			fileNames = append(fileNames, name)
		} else {
			for _, suffix := range suffixes {
				if strings.HasSuffix(name, suffix) {
					fileNames = append(fileNames, name)
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
	fileNames, folderNames, err := getFileFolderNames(location, suffixes)
	if err != nil {
		fmt.Println("Deployment or coding directory error - ", err)
		http.NotFound(w, req)
		return
	}
	reply := replyJSON{Files: fileNames, Folders: folderNames, Success: true}
	str, err := json.Marshal(reply)
	if err != nil {
		fmt.Println("Error Marshalling JSON - ", err)
		http.NotFound(w, req)
		return
	}
	w.Write(str)
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
