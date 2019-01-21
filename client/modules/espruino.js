(()=>{
  let quando = this['quando']
  if (!quando) {
    alert('Fatal Error: espruino must be included after quando_browser')
  }
  var self = quando.espruino = {}

  self.display = (str, val) => {
    fetch('/socket/' + encodeURI(str), { method: 'POST', 
      body: JSON.stringify({'val':val}), 
      headers: {"Content-Type": "application/json"}
    })
  }
})()