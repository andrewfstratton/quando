package server

import (
	"fmt"
	"net/http"
	"quando/internal/config"
	"quando/internal/server/blocks"
	"quando/internal/server/devices/keyboard"
	"quando/internal/server/devices/mouse"
	"quando/internal/server/devices/usb/maker_pi_rp2040"
	"quando/internal/server/devices/usb/ubit"
	"quando/internal/server/ip"
	"quando/internal/server/media"
	"quando/internal/server/scripts"
	"quando/internal/server/socket"

	"golang.org/x/net/websocket"
)

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
	mux.HandleFunc("/control/key", keyboard.HandleKey)
	mux.HandleFunc("/control/type", keyboard.HandleType)
	mux.HandleFunc("/control/mouse", mouse.HandleMouse)
	mux.HandleFunc("/control/ubit/display", ubit.HandleDisplay)
	mux.HandleFunc("/control/ubit/icon", ubit.HandleIcon)
	mux.HandleFunc("/control/ubit/turn", ubit.HandleServo)
	mux.HandleFunc("/control/maker_pi_rp2040/turn", maker_pi_rp2040.HandleServo)

	mux.HandleFunc("/favicon.ico", favicon)
	mux.HandleFunc("/ip", ip.HandlePrivateIP)
	mux.Handle("/client/", http.StripPrefix("/client/", http.FileServer(http.Dir("./client"))))
	mux.Handle("/common/", http.StripPrefix("/common/", http.FileServer(http.Dir("./common"))))
	mux.Handle("/editor/", http.StripPrefix("/editor/", http.FileServer(http.Dir("./editor"))))
	mux.Handle("/dashboard/", http.StripPrefix("/dashboard/", http.FileServer(http.Dir("./dashboard"))))

	mux.Handle("/ws/", websocket.Handler(socket.Serve))

	ubit.CheckMessages()

	host := ":8080"
	if !config.RemoteClient() && !config.RemoteEditor() {
		// If all hosting is localhost, then firewall doesn't need permission
		host = "127.0.0.1" + host
	}
	showStartup(host)
	http.ListenAndServe(host, mux)
}
