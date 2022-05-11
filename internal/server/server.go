package server

import (
	"fmt"
	"net"
	"net/http"
	"quando/internal/config"
	"quando/internal/server/blocks"
	"quando/internal/server/ip"
	"quando/internal/server/media"
	"quando/internal/server/scripts"
	"quando/internal/server/socket"
	"strings"

	"golang.org/x/net/websocket"
)

var listen net.Listener

type Handler struct {
	Url  string
	Func func(w http.ResponseWriter, req *http.Request)
}

func indexOrFail(w http.ResponseWriter, req *http.Request) {
	if req.URL.Path != "/" {
		http.NotFound(w, req)
		return
	}
	http.ServeFile(w, req, "./dashboard")
}

func favicon(w http.ResponseWriter, req *http.Request) {
	http.ServeFile(w, req, "./editor/favicon.ico")
}

func showStartup(host string) {
	fmt.Println("..serving HTTP on : ", host)
}

// Overrides windows local machine map, which can default to text/plain for javascript files
// See https://stackoverflow.com/questions/54835510/getting-mime-type-text-plain-error-in-golang-while-serving-css
func fileServe(w http.ResponseWriter, req *http.Request) {
	if strings.HasSuffix(req.RequestURI, ".js") {
		w.Header().Set("Content-Type", "text/javascript")
	}
	req.RequestURI = "." + req.RequestURI
	http.FileServer(http.Dir("")).ServeHTTP(w, req)
}

func Quit() {
	fmt.Println("Exiting...")
	tmp := listen
	listen = nil
	tmp.Close()
}

func ServeHTTPandIO(handlers []Handler) {
	var err error
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
	for _, handler := range handlers {
		mux.HandleFunc(handler.Url, handler.Func)
	}
	mux.HandleFunc("/favicon.ico", favicon)
	mux.HandleFunc("/ip", ip.HandlePrivateIP)
	// custom serving to avoid windows overriding javascript MIME type
	mux.HandleFunc("/editor/", fileServe)
	mux.HandleFunc("/client/", fileServe)
	mux.HandleFunc("/common/", fileServe)
	mux.HandleFunc("/dashboard/", fileServe)

	mux.Handle("/ws/", websocket.Handler(socket.Serve))

	url := ":80"
	if !config.RemoteClient() && !config.RemoteEditor() {
		// If all hosting is localhost, then firewall doesn't need permission
		url = "127.0.0.1" + url
	}
	showStartup(url)
	listen, err = net.Listen("tcp", url)
	if err != nil {
		fmt.Println("Failed to start server - port 80 may already be in use - exiting...\n", err)
		return
	}
	err = http.Serve(listen, mux)
	if err != nil && listen != nil {
		fmt.Println("Exiting... ", err)
	}
}
