package socket

import (
	"fmt"

	"golang.org/x/net/websocket"
)

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
	scriptname := fileloc[1:] // remove .
	Broadcast("{\"message\":\"deploy\", \"script\":\"" + scriptname + "\"}")
}

// Note that this appears to runs in a goroutine

func Serve(ws *websocket.Conn) {
	fmt.Println("socket.Serve()")
	go handleSend(ws)
	for {
		var reply string

		if err := websocket.Message.Receive(ws, &reply); err != nil {
			fmt.Println("Client web socket disconnected")
			break
		}

		fmt.Println("Received back from client: " + reply)

		msg := "Received:  " + reply
		fmt.Println("Sending to client: " + msg)

		if err := websocket.Message.Send(ws, msg); err != nil {
			fmt.Println("Can't send")
			break
		}
	}
	return
}
