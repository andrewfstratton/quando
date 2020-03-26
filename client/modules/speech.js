(function () {
    var quando = this['quando']
    if (!quando) {
      alert('Fatal Error: speech.js must be included after client.js')
    }
    var self = quando.speech = {}
    self.synth = window.speechSynthesis
    self.saying = self.next = null
  
    function equalSay(say1, say2) { // simple compare - assumes that objects have same keys and might be null 
      let result = false
      if ((say1 != null) && (say2 != null)) {
          result = true
          for (key in say1) {
              if (say1[key] != say2[key]) {
                  result = false
              }
          }
      }
      return result
    }
  
    function newUtter(say) {
      let utter = new SpeechSynthesisUtterance(say.sentence)
      utter.rate = say.rate
      utter.pitch = say.pitch
      utter.volume = say.volume
      self.utter = utter // attempt to solve Chrome bug - need a global reference to utter to avoid garbage collection before onend is handled
      utter.onstart = () => {
          if (self.next) {
              if (equalSay(self.next, say)) {
                  self.next = null
              } else {
                  self.synth.cancel()
              }
          }
          self.saying = say
      }
      utter.onend = () => {
          if (self.next) { // i.e. something else is waiting to be said
            self.saying = self.next
            self.next = null
            newUtter(self.saying)
          } else {
            self.saying = null
          }
      }
      self.synth.speak(utter)
    }
  
    self.say = (sentence, rate, pitch, volume, interrupt=true) => {
      let new_say = {'sentence': sentence, 'rate': rate/100, 'pitch': pitch/100, 'volume': volume/100}
      if (equalSay(self.saying, new_say) && interrupt) {
          // ignore when already saying the same - and asked to interrupt
      } else {
          if (self.synth.speaking) {
              // i.e. currently saying or will do
              self.next = new_say // set next thing to say
              if (interrupt) {
                self.synth.cancel() // Cancel current thing being said - unless buffering
              }
          } else { // start straight away
              self.next = null
              newUtter(new_say)
          }
      }
    }
    self.clear = () => {
        self.next = null
        self.synth.cancel() // Cancel current thing being said
    }
  })()