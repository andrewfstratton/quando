package scripts

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

type fileListJSON struct {
	Success bool     `json:"success"`
	Files   []string `json:"files"`
}

type fileJSON struct {
	// For Scripts stored as files
	Javascript string
	Script     string
}

type replyJSON struct {
	Success    bool   `json:"success"`
	Script     string `json:"script,omitempty"`
	Javascript string `json:"javascript,omitempty"`
	Message    string `json:"message,omitempty"`
}

func handlePutFile(resp http.ResponseWriter, req *http.Request) {
}

func getFile(filepath string) (result fileJSON, err error) {
	contents, err := os.ReadFile(filepath)
	if err == nil {
		err = json.Unmarshal(contents, &result)
	}
	return
}

func HandleFile(resp http.ResponseWriter, req *http.Request) {
	switch req.Method {
	case "GET":
		if strings.HasSuffix(req.URL.Path, ".html") {
			contents, err := os.ReadFile("./client/client.html")
			if err != nil {
				fmt.Println("error finding client/client.html - ", err)
				http.NotFound(resp, req)
				return
			}
			str := string(contents)
			filename := path.Base(req.URL.Path)
			title := strings.TrimSuffix(filename, ".html")
			str = strings.Replace(str, "{{ title }}", title, 2)
			fmt.Fprint(resp, str)
			return
		} else {
			fileloc := "." + strings.TrimSuffix(req.URL.Path, ".js")
			body, err := getFile(fileloc)
			if err != nil {
				fmt.Println("Error parsing script ", err)
				return
			}
			if strings.HasSuffix(req.URL.Path, ".js") {
				str := "let exec = () => {\n" + body.Javascript + "\n}"
				fmt.Fprint(resp, str)
				return
			}
			reply := replyJSON{Javascript: body.Script, Success: true}
			str, err := json.Marshal(reply)
			if err != nil {
				fmt.Println("Error Marshalling JSON - ", err)
				return
			}
			resp.Write(str)
			return
		}
	case "PUT":
		fileloc := "." + strings.TrimSuffix(req.URL.Path, ".js")
		var body fileJSON
		err := json.NewDecoder(req.Body).Decode(&body)
		if err != nil {
			fmt.Println("Error parsing request", err)
			return
		}
		contents, err := json.MarshalIndent(&body, "", "  ")
		if err != nil {
			fmt.Println("Error with JSON storing to file '"+fileloc+"' -", err)
			http.NotFound(resp, req)
			return
		}
		err = os.WriteFile(fileloc, contents, 0644)
		if err != nil {
			fmt.Println("Error writing to file ", err)
			http.NotFound(resp, req)
			return
		}
		str, err := json.Marshal(replyJSON{Success: true})
		if err != nil {
			fmt.Println("Coding Error creating reply ", err)
			http.NotFound(resp, req)
			return
		}
		resp.Write(str)
	case "DELETE":
		fileloc := "." + req.URL.Path
		err := os.Remove(fileloc)
		if err != nil {
			fmt.Println("Unable to delete file: "+fileloc, err)
			http.NotFound(resp, req)
			return
		}
		str, _ := json.Marshal(replyJSON{Success: true})
		resp.Write(str)
	default:
		http.NotFound(resp, req)
		return
	}
}

func HandleDirectory(resp http.ResponseWriter, req *http.Request) {
	if req.Method == "GET" {
		entries, err := ioutil.ReadDir("." + req.URL.Path)
		if err != nil {
			log.Panicf("Missing 'req.URL.Path' directory: %s", err)
		}
		var files []string
		for _, file := range entries {
			files = append(files, file.Name())
		}
		fileList := fileListJSON{Files: files, Success: true}
		str, _ := json.Marshal(fileList)
		resp.Write(str)
		return
	}
	http.NotFound(resp, req)
	return
}
