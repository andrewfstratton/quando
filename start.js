const DB = require('./db')
const readline = require('readline')
const { spawn } = require('child_process')
const request = require('request')

let pouch_db_process = null, app_process = null

console.log('Checking PouchDB...')
DB.checkRunning((success)=>{
    console.log("PouchDB already running")
  }, (error)=> {
  console.log("Starting PouchDB Server...")
  pouch_db_process = spawn('start_pouchdb.bat', {detached:true})
  pouch_db_process.on('error', (err)=>{
    console.error(err)
  })
})

setTimeout(()=> {
  console.log('Checking Quando server...')
  request('http://127.0.0.1/favicon.ico', (error, response) => {
    if (error) {
      console.log('Starting Quando server...')
      app_process = spawn('start_app.bat', {detached: true})
      app_process.on('error', (err)=>{
        console.error(err)
      })
    } else if (response.statusCode == 200) {
      console.log('Quando already running...')
    } else {
      console.log("** Error returned from http://127.0.0.1/favicon.ico - maybe another http server is running?\n** Fatal - Exiting...")
      process.exit(0)
    }
    console.log('Press return to open Hub Control Panel - http://127.0.0.1) - or Ctrl-C to exit...')
  })
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  rl.question('', () => {
    spawn('chrome', ['http://127.0.0.1'], {detached:true})
    process.exit(0)
  })
}, 1000)