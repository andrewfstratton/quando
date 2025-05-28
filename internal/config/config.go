package config

import (
	"flag"
)

var remote bool

func Remote() bool {
	return remote
}

func init() {
	remote_p := flag.Bool("remote", false, "Allow access from other machines - Warning - this is insecure")
	flag.Parse()
	remote = *remote_p
}
