(function () {
  var quando = this['quando']
  if (!quando) {
    alert('Fatal Error: destructor must be included after quando_browser')
  }
  var self = quando.destructor = {}
  var destructor_list = null
  
  self.add = function (fn) {
    if (destructor_list != null) {
      destructor_list.push(fn)
console.log(">fn")
    }
  }

  self.destroy = function () {
    if (destructor_list != null) {
        while (destructor_list.length) {
            destructor_list.shift()()
console.log("<fn()")
        }
    }
    destructor_list = []
  }
})()