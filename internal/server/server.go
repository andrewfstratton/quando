package server

import (
	"fmt"
	"net/http"
	"quando/internal/config"
	"quando/internal/server/blocks"
	"quando/internal/server/devices/usb/maker_pi_rp2040"
	"quando/internal/server/devices/usb/ubit"
	"quando/internal/server/ip"
	"quando/internal/server/media"
	"quando/internal/server/scripts"
	"quando/internal/server/socket"
	"strings"

	"golang.org/x/net/websocket"
)

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

func ServeHTTPandIO(handlers []Handler) {
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
	mux.HandleFunc("/control/ubit/display", ubit.HandleDisplay)
	mux.HandleFunc("/control/ubit/icon", ubit.HandleIcon)
	mux.HandleFunc("/control/ubit/turn", ubit.HandleServo)
	mux.HandleFunc("/control/maker_pi_rp2040/turn", maker_pi_rp2040.HandleServo)

	mux.HandleFunc("/favicon.ico", favicon)
	mux.HandleFunc("/ip", ip.HandlePrivateIP)
	// custom serving to avoid windows overriding javascript MIME type
	mux.HandleFunc("/editor/", fileServe)
	mux.HandleFunc("/client/", fileServe)
	mux.HandleFunc("/common/", fileServe)
	mux.HandleFunc("/dashboard/", fileServe)

	mux.Handle("/ws/", websocket.Handler(socket.Serve))

	ubit.CheckMessages()

	host := ":80"
	if !config.RemoteClient() && !config.RemoteEditor() {
		// If all hosting is localhost, then firewall doesn't need permission
		host = "127.0.0.1" + host
	}
	showStartup(host)
	http.ListenAndServe(host, mux)
}
