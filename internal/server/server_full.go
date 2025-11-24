//go:build full

package server

import (
	"quando/internal/server/system"
)

func init() {
	go system.CheckChanged()
}
