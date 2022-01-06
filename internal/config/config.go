package config

import (
	"flag"
)

var _remote_client bool
var _remote_editor bool

func Remote_client() bool {
	return _remote_client
}

func Remote_editor() bool {
	return _remote_editor
}

func init() {
	remote_client_p := flag.Bool("remote_client", false, "Allow client access from other machines")
	remote_editor_p := flag.Bool("remote_editor", false, "Allow editor access from other machines - Warning - this has no security")
	flag.Parse()
	_remote_client = *remote_client_p
	_remote_editor = *remote_editor_p
}
