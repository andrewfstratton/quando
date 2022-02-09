package server

import (
	"fmt"
	"net/http"
	"quando/internal/config"
	"quando/internal/server/blocks"
	"quando/internal/server/ip"
	"quando/internal/server/media"
	"quando/internal/server/scripts"
	"quando/internal/server/socket"

	"golang.org/x/net/websocket"
)

func indexOrFail(w http.ResponseWriter, req *http.Request) {
	if req.URL.Path != "/" {
		http.NotFound(w, req)
	} else {
		// TODO redirect to /editor or wherever
		for name, headers := range req.Header {
			for _, h := range headers {
				fmt.Fprintf(w, "%v: %v\n", name, h)
			}
		}
	}
}

func favicon(w http.ResponseWriter, req *http.Request) {
	http.ServeFile(w, req, "./editor/favicon.ico")
}

func showStartup(host string) {
	fmt.Println("..serving HTTP on : ", host)
}

func ServeHTTPandIO() {
	mux := http.NewServeMux()
	mux.HandleFunc("/", indexOrFail)
	mux.HandleFunc("/scripts", scripts.HandleDirectory)
	mux.HandleFunc("/scripts/", scripts.HandleFile)
	mux.HandleFunc("/blocks", blocks.Handle)

	mux.HandleFunc("/media/", media.HandleMedia)
	// N.B. the slash after the media type is added to simplify url matching
	mux.HandleFunc("/images/", media.HandleGetMediaDirectory)
	mux.HandleFunc("/audio/", media.HandleGetMediaDirectory)
	mux.HandleFunc("/video/", media.HandleGetMediaDirectory)
	mux.HandleFunc("/objects/", media.HandleGetMediaDirectory)

	mux.HandleFunc("/favicon.ico", favicon)
	mux.HandleFunc("/ip", ip.PublicIP)
	mux.Handle("/client/", http.StripPrefix("/client/", http.FileServer(http.Dir("./client"))))
	mux.Handle("/common/", http.StripPrefix("/common/", http.FileServer(http.Dir("./common"))))
	mux.Handle("/editor/", http.StripPrefix("/editor/", http.FileServer(http.Dir("./editor"))))

	mux.Handle("/ws/", websocket.Handler(socket.Serve))

	host := ":8080"
	if !config.RemoteClient() && !config.RemoteEditor() {
		// If all hosting is localhost, then firewall doesn't need permission
		host = "127.0.0.1" + host
	}
	showStartup(host)
	http.ListenAndServe(host, mux)
}
