const nao = require('../db/nao')
const { exec } = require("child_process");


//Remove all the junk from arp output.
//Leaving an array where each mac address is preceeded by
//its corresponding IP address.
function cleanArpOut(arpOut) {
  arpOut = arpOut.split(" ")
  
  for (i = arpOut.length - 1; i >= 0; --i) {
    if (arpOut[i] == '' ||  arpOut[i].includes('0x') || arpOut[i] == 'static' || arpOut[i] == 'Address' || arpOut[i] == 'Physical' || arpOut[i] == 'Type\r\n' || arpOut[i] == '\r\n' || arpOut[i] == 'dynamic' || arpOut[i] == '0x4\r\n' || arpOut[i] == 'Internet' || arpOut[i] == '---') {
      arpOut.splice(i, 1); // Remove entry
    }
  }
  for (let i = 0; i < arpOut.length - 1; i++) {
    if (arpOut[i].includes('Interface')) {
      arpOut.splice(i, 2); // Remove entry + following entry
    }
  }

  console.log(arpOut)
  return arpOut
}

module.exports = (app, success, fail) => {

  //upon successful connection of nao
  //post the working ip address
  //then we'll determine the respective mac addy w arp

  app.post('/nao', (req, res) => {
    const ip = req.body.ip
    const name = req.body.name

    //execute arp in shell
    //arp -a shows current IP to physical address lookup table
    exec("arp -a", (error, stdout, stderr) => {
      if (error) {
          console.log(`error: ${error.message}`);
          return;
      }
      if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
      }
      const splitOut = cleanArpOut(stdout)
      
      let foundMAC = null;

      //try and match the IP to arp's mac
      for (let i = 0; i < splitOut.length; i = i+2) {
        if (ip == splitOut[i]) {
          //then if we find a match, store it's related mac addy
          console.log('match! ip ' + ip + ' and mac ' + splitOut[i+1])
          foundMAC = splitOut[i+1]
        }
      }
      if (foundMAC != null) {
        nao.add(foundMAC, name).then(
          (doc) => { success(res) },
          (err) => { fail(res, err) }
        )
      } else {
        success(res) //is this the right thing to do? not quite sure...
      }
    })
  })

  app.get('/nao', (req, res) => {
    //execute arp in shell
    //arp -a shows current IP to physical address lookup table
    exec("arp -a", (error, stdout, stderr) => {
      if (error) {
          console.log(`error: ${error.message}`);
          return;
      }
      if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
      }
      const splitOut = cleanArpOut(stdout)

      //get all stored mac addresses and try and match them against
      //the mac addresses returned by arp - i.e. the split array
      nao.getAll().then(
        (doc) => { 
          // console.log('doc ' + JSON.stringify(doc))

          let ips = []
          doc.forEach(element => {
            for (let i = 1; i < splitOut.length; i = i+2) {
              // console.log(element.name + ' ' + element.mac + ' and ' + splitOut[i])
              if (element.mac == splitOut[i]) {
                console.log('match ip ' + splitOut[i-1] + ' and mac ' + element.mac)
                ips.push({
                  "ip": splitOut[i-1],
                  "name": element.name
                })
                return
              }
            }
          });
          if (ips != null) {
            console.log('sucessful ips: ' + ips)
          } else {
            console.log('no ips found')
          }

          success(res, ips) },
        (err) => { fail(res, err) 
      })
    })
  })

  
  app.get('/nao/wipe', (req, res) => {
    //get all stored mac addresses and try and match them against
    //the mac addresses returned by arp - i.e. the split array
    nao.wipe().then((err) => { fail(res, err) })
  })
}
