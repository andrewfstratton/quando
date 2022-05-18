//go:build local || full

package tray

import (
	"fmt"
	"os/exec"
	"quando/internal/icon"
	"quando/internal/server"

	"github.com/getlantern/systray"
	"github.com/skratchdot/open-golang/open"
	"github.com/zserge/lorca"
)

func Run() {
	systray.Run(setup, close)
}

func setup() {
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
				server.Quit()
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

func openChrome(suffix string) {
	loc := lorca.LocateChrome()
	cmd := exec.Command(loc, "--new-window", "--user-data-dir=C:\\chrome_dir", "--allow-insecure-localhost", "http://127.0.0.1"+server.Port()+suffix)
	err := cmd.Run()
	if err != nil {
		fmt.Println(err)
	}
}

func close() {
	fmt.Println("Exiting...")
}
