(function () {
  var quando = this['quando']
  if (!quando) {
    alert('Fatal Error: speech.js must be included after quando_browser')
  }
  var self = quando.speech = {}
  self.synth = window.speechSynthesis
  self.saying = self.next = null

  function newUtter(sentence) {
    let utter = new SpeechSynthesisUtterance(sentence)
  utter.onstart = () => {
    console.log('started..')
    if (self.next) {
console.log("Something new to say")
        if (self.next == self.saying) {
console.log("  But the same thing already being said...")
            self.next = null
        } else {
            self.synth.cancel()
    console.log("Starting - Cancel "+self.saying)
        }
    }
  }
  utter.onerror = () => {
    console.log('..error')
  }
  utter.onend = () => {
    console.log('..stopped')
    if (self.next) {
console.log("Something to say")
        if (self.next != self.saying) {
    console.log('Next say ' + self.next)
            self.saying = self.next
            self.next = null
            newUtter(self.saying)
        } else {
    console.log('Nothing left to say')
            self.next = null
            self.saying = null
        }
    } else {
    console.log('Nothing to say')
        self.saying = null
    }
  }
    self.synth.speak(utter)
  }

  self.say = function(sentence) {
    if (self.saying == sentence) {
        // don't interupt when already saying the same thing
console.log("Don't interrupt")
    } else {
        if (self.saying) {
            // i.e. not started saying, but will do
            self.next = sentence
            self.synth.cancel()
console.log("Replace with = "+sentence)
        } else { // start straight away
            self.saying = sentence
    console.log('Say new ' + sentence)
            newUtter(sentence)
            self.next = null
        }
    }
  }
})()