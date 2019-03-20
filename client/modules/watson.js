(function () {
    var quando = this['quando']
    if (!quando) {
      alert('Fatal Error: Watson must be included after quando_browser')
    }
    var self = quando.watson = {}
    self.width = screen.width
    self.height = screen.height
  })