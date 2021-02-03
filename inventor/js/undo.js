// Undo Redo (Do) API for drag/drop
// Also intended for some interaction (e.g. not character, but whole text field change)

let undo_stack = []
let redo_stack = []

export function done(undo_fn, redo_fn, _log = null) {
  // clear redo_stack
  if (redo_stack.length > 0) {
    redo_stack = []
  }
  undo_stack.push({undo:undo_fn, redo:redo_fn, log:_log})
if (_log) { console.log(_log)}
}

export function undo() {
  if (undo_stack.length > 0) {
    let command = undo_stack.pop()
    command.undo()
    redo_stack.push(command)
if (command.log) { console.log("undo: "+command.log)}
  }
}

export function redo()  {
  if (redo_stack.length > 0) {
    let command = redo_stack.pop()
    command.redo()
    undo_stack.push(command)
if (command.log) { console.log("redo: "+command.log)}
  }
}

export function reset() {
  redo_stack = []
  undo_stack = []
}
