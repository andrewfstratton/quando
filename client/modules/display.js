import * as destructor from "./destructor.js";

const quando = window['quando']
if (!quando) {
  alert('Fatal Error: display.js must be included after quando_browser')
}

let self = quando.display = {}


  function _addToButtonRow(button=null, new_row = false) {
    let buttons = document.getElementById('quando_buttons')
    let row = buttons.lastElementChild
    if (new_row || (row == null)) {
      row = document.createElement('div')
      row.className = "quando_buttons_row"
      buttons.appendChild(row)
    }
    if (button != null) {
      row.appendChild(button)
    }
  }

  self.addButton = function({text = "", up_down = "down", text_colour, button_colour},fn) {
    let button = document.createElement('div')
    button.className = 'quando_button'
    button.innerHTML = text
    button.style.color = text_colour
    button.style.background = button_colour   
    // set button.flexGrow to float weight
    button.setAttribute('id', 'button'+text)
    function handleTouch(ev) {
      ev.preventDefault() // Avoids double event
      switch (ev.type) {
        case "touchstart" :
        case "mousedown" :
          if (up_down == "down") {
            fn()
          } else if (up_down == "either") {
            fn(1)
          }
          break;
        case "touchend" :
        case "mouseup" :
          if (up_down == "up") {
            fn()
          } else if (up_down == "either") {
            fn(0)
          }
          break;
        // case "touchmove" :
        // case "mousemove" :
        //   break;
      }
    }
    button.onmousedown = handleTouch
    button.ontouchstart = handleTouch
    button.onmouseup = handleTouch
    button.ontouchend = handleTouch
    // button.onmousemove = handleTouch
    // button.ontouchmove = handleTouch
    _addToButtonRow(button)
  }

  self.addSpacer = function() {
    let spacer = document.createElement('div')
    spacer.className = 'quando_button'
    spacer.style.opacity = 0
    _addToButtonRow(spacer)
  }

  self.buttonRow = function(fn) {
    _addToButtonRow(null, true)
    fn()
  }
