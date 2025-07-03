package run

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/andrewfstratton/quandoscript/action"
	"github.com/andrewfstratton/quandoscript/library"
)

type runJSON struct {
	Quandoscript string
}

type replyJSON struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
}

func Handle(w http.ResponseWriter, req *http.Request) {
	if req.Method != "PUT" {
		http.NotFound(w, req)
		return
	}
	var body runJSON
	err := json.NewDecoder(req.Body).Decode(&body)
	if err != nil {
		fmt.Println("Error parsing request", err)
		return
	}
	fmt.Println(body.Quandoscript)
	library.Parse(body.Quandoscript)
	warn := action.Start()
	if warn != "" {
		fmt.Println(warn)
	}
	str, _ := json.Marshal(replyJSON{Success: true})
	w.Write(str)
}
