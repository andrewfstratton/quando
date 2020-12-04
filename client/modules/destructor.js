let destructor_list = null

export function add (fn) {
  if (destructor_list != null) {
    destructor_list.push(fn)
  }
}

export function destroy () {
  if (destructor_list != null) {
      while (destructor_list.length) {
          destructor_list.shift()()
      }
  }
  destructor_list = []
}