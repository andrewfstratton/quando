package ip

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/polera/publicip"
)

type ipJSON struct {
	Success bool   `json:"success"`
	IP      string `json:"ip"`
	Local   bool   `json:"local"`
}

func PublicIP(w http.ResponseWriter, req *http.Request) {
	success := true
	publicIP, err := publicip.GetIP()
	if err != nil {
		fmt.Printf("Error getting IP address: %s\n", err)
		success = false
	}
	reply, _ := json.Marshal(ipJSON{Success: success, Local: true, IP: publicIP})
	w.Write(reply)
}
