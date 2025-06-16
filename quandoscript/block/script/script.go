package script

type Generator interface {
	Generate() string // returns the generated template Quando Script for a widget in a block
}
