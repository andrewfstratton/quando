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
        if (self.next) {
            if (self.next == self.saying) {
                self.next = null
            } else {
                self.synth.cancel()
            }
        }
    }
    utter.onend = () => {
        if (self.next) {
            if (self.next != self.saying) {
                self.saying = self.next
                self.next = null
                newUtter(self.saying)
            } else {
                self.next = null
                self.saying = null
            }
        } else {
            self.saying = null
        }
    }
    self.synth.speak(utter)
  }

  self.say = function(sentence) {
    if (self.saying != sentence) { // ignore when already saying the same
        if (self.saying) {
            // i.e. not started saying, but will do
            self.next = sentence
            self.synth.cancel()
        } else { // start straight away
            self.saying = sentence
            newUtter(sentence)
            self.next = null
        }
    }
  }
})()