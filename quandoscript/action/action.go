package action

import (
	"quando/quandoscript/action/param"
)

type Action struct {
	late   func(param.Params)
	params param.Params
	nextId int
	// context
}

var actions map[int]*Action // map id to action
var last *Action
var startId int = -1

type Early func(param.Params) func(param.Params) // outer/setup function that returns late inner function
type Late func(param.Params)                     // inner function that is run every invocation

func New(late Late, params param.Params) *Action {
	action := Action{late: late, params: params, nextId: -1} // N.B. -1 is to show no following action
	return &action
}

func NewGroup() {
	last = nil // so we don't append to the same group
}

func Add(id int, action *Action) {
	if startId == -1 {
		startId = id
	}
	actions[id] = action
	if last != nil {
		last.nextId = id
	}
	last = action
}

func Run(id int) {
	for id != -1 {
		act := actions[id]
		act.late(act.params)
		id = act.nextId
	}
}

func Start() (warn string) {
	if startId == -1 {
		return "No actions found"
	}
	Run(startId)
	return
}

func init() {
	actions = map[int]*Action{} // i.e. the lookup table to find any action
}
