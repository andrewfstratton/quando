package config

import (
	"flag"
)

var remote_client bool
var remote_editor bool

func RemoteClient() bool {
	return remote_client
}

func RemoteEditor() bool {
	return remote_editor
}

func init() {
	remote_client_p := flag.Bool("remote_client", false, "Allow client access from other machines")
	remote_editor_p := flag.Bool("remote_editor", false, "Allow editor access from other machines - Warning - this has no security")
	flag.Parse()
	remote_client = *remote_client_p
	remote_editor = *remote_editor_p
}
