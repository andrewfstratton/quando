package server

import (
	"fmt"
	"net/http"
	"quando/internal/config"
	"quando/internal/server/blocks"
)

func editor(resp http.ResponseWriter, req *http.Request) {
	// fmt.Println("\n", req.URL.Path)
	for name, headers := range req.Header {
		for _, h := range headers {
			fmt.Fprintf(resp, "%v: %v\n", name, h)
		}
	}
	fmt.Println("======")
}

func indexOrFail(resp http.ResponseWriter, req *http.Request) {
	if req.URL.Path != "/" {
		http.NotFound(resp, req)
	} else {
		editor(resp, req)
	}
}

func favicon(resp http.ResponseWriter, req *http.Request) {
	http.ServeFile(resp, req, "./editor/favicon.ico")
}

func ServeHTTP() {
	fmt.Println("..serving HTTP")
	mux := http.NewServeMux()
	mux.HandleFunc("/", indexOrFail)
	mux.HandleFunc("/favicon.ico", favicon)
	mux.Handle("/editor/", http.StripPrefix("/editor/", http.FileServer(http.Dir("./editor"))))
	mux.Handle("/client/", http.StripPrefix("/client/", http.FileServer(http.Dir("./client"))))
	mux.Handle("/common/", http.StripPrefix("/common/", http.FileServer(http.Dir("./common"))))
	mux.HandleFunc("/blocks", blocks.Handle)
	host := ":8080"
	if !config.RemoteClient() && !config.RemoteEditor() {
		// If all hosting is localhost, then firewall doesn't need permission
		host = "127.0.0.1" + host
	}
	http.ListenAndServe(host, mux)
}
