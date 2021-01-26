// const DB = require('./db')
const { spawn, spawnSync } = require('child_process')

let appEnv = require('cfenv').getAppEnv() // For IBM Cloud
if (appEnv.isLocal) { // i.e. not running on IBM Cloud
  console.log("Starting PouchDB")
  let pouch_db_process = null
  pouch_db_process = spawn('npm', ['run', 'pouchd'], {stdio: 'inherit', shell: true}) // , detached:true})
  pouch_db_process.on('error', (err)=>{
    console.error('  PouchDB--' + err)
  })
  console.log('To open Dashboard - https://127.0.0.1 - or Ctrl-C to exit...')
}

console.log('Starting Quando:Cloud...')
app_process = spawnSync('npm', ['run', 'quando'], {stdio: 'inherit', shell: true})
console.log('Quando:Cloud exited...')