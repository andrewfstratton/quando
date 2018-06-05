(function () {
    var quando = this['quando']
    if (!quando) {
      alert('Fatal Error: speech.js must be included after quando_browser')
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
      self.utter = utter // attempt to solve Chrome bug - needing a global reference to utter to avoid it being garbage colected before onend is handled
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
              if (equalSay(self.saying, self.next)) { // if it's the same thing...
                  self.next = self.saying = null
              } else {
                  let next = self.next
                  self.next = null
                  newUtter(next)
              }
          } else {
              self.saying = null
          }
      }
      self.synth.speak(utter)
    }
  
    self.say = function(sentence, rate = 1, pitch = 1) {
      let new_say = {'sentence': sentence, 'rate': rate, 'pitch': pitch}
      if (equalSay(self.saying, new_say)) {
          // ignore when already saying the same
      } else {
          if (self.saying) {
              // i.e. currently saying or will do
              self.next = new_say // set next thing to say
              self.synth.cancel() // Cancel current thing being said
          } else { // start straight away
              self.next = null
              newUtter(new_say)
          }
      }
    }
  })()