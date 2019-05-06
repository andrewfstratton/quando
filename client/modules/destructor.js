(function () {
  var quando = this['quando']
  if (!quando) {
    alert('Fatal Error: destructor.js must be included after client.js')
  }
  var self = quando.destructor = {}
  var destructor_list = null
  
  self.add = function (fn) {
    if (destructor_list != null) {
      destructor_list.push(fn)
    }
  }

  self.destroy = function () {
    if (destructor_list != null) {
        while (destructor_list.length) {
            destructor_list.shift()()
        }
    }
    destructor_list = []
  }
})()