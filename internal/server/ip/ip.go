package ip

import (
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"quando/internal/config"
)

type ipJSON struct {
	Success bool   `json:"success"`
	IP      string `json:"ip"`
	Local   bool   `json:"local"`
	Remote  bool   `json:"remote"`
}

func PrivateIP() string {
	privateIP := "127.0.0.1"
	conn, err := net.Dial("udp", "8.8.8.8:80")
	if err != nil {
		fmt.Printf("Error getting Private IP address: %s\n", err)
	} else {
		privateIP, _, _ = net.SplitHostPort(conn.LocalAddr().String())
	}
	return privateIP
}

func HandlePrivateIP(w http.ResponseWriter, req *http.Request) {
	success := true
	privateIP := PrivateIP()
	remote := config.Remote()
	reply, _ := json.Marshal(ipJSON{Success: success, Local: true, IP: privateIP,
		Remote: remote})
	w.Write(reply)
}
