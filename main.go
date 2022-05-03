package main

import (
	"fmt"
	"quando/internal/config"
	"quando/internal/icon"
	"quando/internal/server"
	"quando/internal/server/ip"

	"github.com/getlantern/systray"
	"github.com/skratchdot/open-golang/open"
)

var handlers = []server.Handler{}

func main() {
	fmt.Println("Quando Go Server started")
	if config.RemoteClient() {
		fmt.Println("  Client available on local network at ", ip.PrivateIP()) // TODO show IP address
	}
	if config.RemoteEditor() {
		fmt.Println("**SECURITY WARNING** Editor available on local network at ", ip.PrivateIP()) // TODO show IP address
	}
	go server.ServeHTTPandIO(handlers)
	systray.Run(onReady, nil)
}

func onReady() {
	systray.SetIcon(icon.Data())
	systray.SetTitle("Quando")
	systray.SetTooltip("Quando - noCode Toolset")
	sysEditor := systray.AddMenuItem("Editor", "Open Editor")
	sysClient := systray.AddMenuItem("Client", "Open Client")
	systray.AddSeparator()
	sysDashboard := systray.AddMenuItem("Dashboard", "Open Dashboard")
	systray.AddSeparator()
	sysGithub := systray.AddMenuItem("Quando:Github", "Open Quando -> Github")
	systray.AddSeparator()
	sysQuit := systray.AddMenuItem("Quit", "Stop the server")
	go func() {
		for {
			select {
			case <-sysQuit.ClickedCh:
				fmt.Println("Exiting...")
				systray.Quit()
			case <-sysEditor.ClickedCh:
				open.StartWith("http://127.0.0.1/editor", "chrome")
			case <-sysClient.ClickedCh:
				open.StartWith("http://127.0.0.1/client", "chrome")
			case <-sysDashboard.ClickedCh:
				open.StartWith("http://127.0.0.1", "chrome")
			case <-sysGithub.ClickedCh:
				open.Start("https://github.com/andrewfstratton/quando")
			}
		}
	}()
}
