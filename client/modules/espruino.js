(()=>{
  let quando = this['quando']
  if (!quando) {
    alert('Fatal Error: espruino must be included after quando_browser')
  }
  var self = quando.espruino = {}

})()