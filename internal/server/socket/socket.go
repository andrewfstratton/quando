package socket

import (
	"encoding/json"
	"fmt"

	"golang.org/x/net/websocket"
)

type messageJSON struct {
	Type       string  `json:"type,omitempty"`
	Message    string  `json:"message,omitempty"`
	Val        float64 `json:"val,omitempty"`
	Host       string  `json:"host,omitempty"`
	Local      bool    `json:"local,omitempty"`
	Scriptname string  `json:"scriptname,omitempty"`
}

var sends []chan string

func handleSend(ws *websocket.Conn) {
	send := make(chan string)
	sends = append(sends, send)
	fmt.Println("Started send channel")
	for {
		msg := <-send
		fmt.Println("send ", msg)
		if err := websocket.Message.Send(ws, msg); err != nil {
			fmt.Println("Can't send")
			break
		}
	}
}

func Broadcast(msg string) {
	for _, send := range sends {
		send <- msg
	}
}

func Deploy(fileloc string) {
	fmt.Println("deploy")
	bytes, _ := json.Marshal(messageJSON{Type: "deploy", Scriptname: fileloc[1:]}) // remove . at beginning
	Broadcast(string(bytes))
}

func Serve(ws *websocket.Conn) {
	fmt.Println("socket.Serve()")
	go handleSend(ws)
	for {
		var message messageJSON
		err := websocket.JSON.Receive(ws, &message)

		if err != nil {
			fmt.Println("Client websocket disconnected...")
			break
		}

		fmt.Println("Received back from client: " + message.Type)

	}
	return
}
