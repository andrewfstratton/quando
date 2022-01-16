package server

import (
	"fmt"
	"net/http"
	"quando/internal/config"
	"quando/internal/server/blocks"
	"quando/internal/server/scripts"
)

func indexOrFail(resp http.ResponseWriter, req *http.Request) {
	if req.URL.Path != "/" {
		http.NotFound(resp, req)
	} else {
		// TODO redirect to /editor or wherever
		for name, headers := range req.Header {
			for _, h := range headers {
				fmt.Fprintf(resp, "%v: %v\n", name, h)
			}
		}
	}
}

func favicon(resp http.ResponseWriter, req *http.Request) {
	http.ServeFile(resp, req, "./editor/favicon.ico")
}

func ServeHTTP() {
	fmt.Println("..serving HTTP")
	mux := http.NewServeMux()
	mux.HandleFunc("/", indexOrFail)
	mux.HandleFunc("/scripts", scripts.HandleDirectory)
	mux.HandleFunc("/scripts/", scripts.HandleFile)
	mux.HandleFunc("/blocks", blocks.Handle)
	mux.HandleFunc("/favicon.ico", favicon)
	mux.Handle("/client/", http.StripPrefix("/client/", http.FileServer(http.Dir("./client"))))
	mux.Handle("/common/", http.StripPrefix("/common/", http.FileServer(http.Dir("./common"))))
	mux.Handle("/editor/", http.StripPrefix("/editor/", http.FileServer(http.Dir("./editor"))))
	host := ":8080"
	if !config.RemoteClient() && !config.RemoteEditor() {
		// If all hosting is localhost, then firewall doesn't need permission
		host = "127.0.0.1" + host
	}
	http.ListenAndServe(host, mux)
}
