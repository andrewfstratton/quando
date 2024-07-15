//go:build local || full

package tray

import (
	"fmt"
	"os"
	"os/exec"
	"os/signal"
	"quando/internal/icon"
	"quando/internal/server"
	"time"

	"github.com/getlantern/systray"
	"github.com/skratchdot/open-golang/open"
	"github.com/zserge/lorca"
)

func Run() {
	systray.Run(setup, close)
}

func setup() {
	// handle OS interrupt
	interrupt_channel := make(chan os.Signal)
	signal.Notify(interrupt_channel, os.Interrupt)
	go handleInterrupt(interrupt_channel)

	// setup menu
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
	// Handle Clicks
	go func() {
		for {
			select {
			case <-sysQuit.ClickedCh:
				systray.Quit()
			case <-sysEditor.ClickedCh:
				openChrome("/editor")
			case <-sysClient.ClickedCh:
				openChrome("/client")
			case <-sysDashboard.ClickedCh:
				openChrome("")
			case <-sysGithub.ClickedCh:
				open.Start("https://github.com/andrewfstratton/quando")
			}
		}
	}()
}

func handleInterrupt(interrupt chan os.Signal) {
	<-interrupt
	fmt.Println("<<Interrupt>>")
	systray.Quit()
}

func openChrome(suffix string) {
	loc := lorca.LocateChrome()
	cmd := exec.Command(loc, "--new-window", "--user-data-dir=C:\\chrome_dir", "--allow-insecure-localhost", "http://127.0.0.1"+server.Port()+suffix)
	err := cmd.Start()
	if err != nil {
		fmt.Println(err)
	}
}

func close() {
	// fmt.Println("Close systray...")
	time.Sleep(1 * time.Second)
	server.Quit()
}
