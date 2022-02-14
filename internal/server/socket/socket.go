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

type sendChannel chan string

var sends []sendChannel

func addSend() (int, sendChannel) {
	new_send := make(chan string)
	for i, send := range sends {
		if send == nil {
			sends[i] = new_send
			return i, new_send
		}
	}
	sends = append(sends, new_send)
	return len(sends) - 1, new_send
}

func handleSend(ws *websocket.Conn, i int, send sendChannel) {
	// fmt.Println("  ", len(sends), " max clients available, added as ", i)
	for {
		msg := <-send
		// fmt.Println("send ", msg)
		if err := websocket.Message.Send(ws, msg); err != nil {
			// fmt.Println("Removed client ", i)
			sends[i] = nil
			break
		}
	}
}

func Broadcast(msg string) {
	for _, send := range sends {
		if send != nil {
			send <- msg
		}
	}
}

func Deploy(fileloc string) {
	bytes, _ := json.Marshal(messageJSON{Type: "deploy", Scriptname: fileloc[1:]}) // remove . at beginning
	Broadcast(string(bytes))
}

func Serve(ws *websocket.Conn) {
	// fmt.Println("socket.Serve()")
	i, send := addSend()
	go handleSend(ws, i, send)
	for {
		var message messageJSON
		err := websocket.JSON.Receive(ws, &message)

		if err != nil {
			// fmt.Println("Client websocket disconnected...")
			sends[i] = nil
			break
		}

		switch message.Type {
		case "message":
			bytes, _ := json.Marshal(message) // i.e. forward the message
			Broadcast(string(bytes))
		default:
			fmt.Println("Unhandled message type from client: " + message.Type)
		}
	}
}
