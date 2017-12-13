(function () {
    var quando = this['quando']
    if (!quando) {
      alert('Fatal Error: ubit must be included after quando_browser')
    }

    var self = quando.robot = {}
    self.say = function(text) {
        alert(text);
    }
})