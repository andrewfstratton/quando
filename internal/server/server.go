package server

import (
	"fmt"
	"net/http"
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
	fmt.Print(req.URL.Path)
	req.URL.Path = "/editor/favicon.ico"
	fmt.Println(" >> ", req.URL.Path)
	editor(resp, req)
}

func ServeHTTP() {
	fmt.Println("..serving HTTP")
	mux := http.NewServeMux()
	mux.HandleFunc("/", indexOrFail)
	mux.Handle("/editor/", http.StripPrefix("/editor/", http.FileServer(http.Dir("./editor"))))
	mux.Handle("/client/", http.StripPrefix("/client/", http.FileServer(http.Dir("./client"))))
	mux.Handle("/common/", http.StripPrefix("/common/", http.FileServer(http.Dir("./common"))))
	mux.HandleFunc("/favicon.ico", favicon)
	http.ListenAndServe("127.0.0.1:8080", mux)
}
