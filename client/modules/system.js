import * as destructor from "./destructor.js";

let quando = window['quando']
if (!quando) {
  alert('Fatal Error: system must be included after client.js')
}

let self = quando.system = {}
let last_title = ""
let handlers = []

self.handle_message = (data) => {
  let title = data.title
  if (title != last_title) { // i.e. title has changed
    for (let handler of handlers) {
      if (handler != undefined) { // may have been deconstructed
        if (handler.match.test(title) != handler.match.test(last_title)) {
          // i.e. title match has changed true<>false
          if (handler.match.test(title)) {
            handler.callback()
          } else {
            handler.change()
          }
        }
      }
    }
    last_title = title
  }
}

self.whenFocus = (block_id, comparison, title, callback, fn_change) => {
  console.log("whenTitle")
  // use comparison to create a regexp
  let match = title
  switch (comparison) {
    case 'equals':
      match = "^" + match + "$"
    case 'starts':
      match = "^" + match
    case 'ends':
      match = match + "$"
    // 'contains': // no need - same as match
  }
  handlers[block_id] = {'match': new RegExp(match), 'callback': callback, 'change': fn_change}
  destructor.add( () => {
    // TODO check whether need to callback change
    delete handlers[block_id]
  })
}

self.fullScreen = (val) => {
  if (val) {
    document.querySelector("body").requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}