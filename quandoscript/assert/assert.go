package assert

import (
	"testing"
)

// from https://dev.to/yawaramin/why-i-dont-use-a-third-party-assertion-library-in-go-unit-tests-1gak
func Eq[V comparable](t *testing.T, got, expected V) {
	t.Helper()

	if expected != got {
		t.Errorf("assert should equal '%v', was '%v'", expected, got)
	}
}

func Neq[V comparable](t *testing.T, got, expected V) {
	t.Helper()

	if expected == got {
		t.Errorf("assert should NOT equal '%v'", expected)
	}
}

func True(t *testing.T, b bool) {
	t.Helper()
	if !b {
		t.Errorf("assert should be TRUE")
	}
}
