//go:build full

package server

import (
	"quando/internal/server/devices/keyboard"
	"quando/internal/server/system"
)

func init() {
	go system.CheckChanged()
	go keyboard.CheckChanged()
}
