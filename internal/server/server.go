package server

import (
	"fmt"
	"net/http"
)

func test(resp http.ResponseWriter, req *http.Request) {
	for name, headers := range req.Header {
		for _, h := range headers {
			fmt.Fprintf(resp, "%v: %v\n", name, h)
		}
	}
	fmt.Println("======")
}

func ServeHTTP() {
	fmt.Println("..serving HTTP")
	http.HandleFunc("/", test)
	http.ListenAndServe(":8080", nil)
}
