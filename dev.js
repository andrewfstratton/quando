// const DB = require('./db')
const { spawn, spawnSync } = require('child_process')

  console.log("Starting PouchDB")
  let pouch_db_process = null
  pouch_db_process = spawn('npm', ['run', 'pouchd'], {stdio: 'inherit', shell: true}) // , detached:true})
  pouch_db_process.on('error', (err)=>{
    console.error('  PouchDB--' + err)
    console.log("Assuming pouchdb already running")
  })
  console.log('To open Hub Control Panel - https://127.0.0.1 - or Ctrl-C to exit...')

console.log('Starting Quando server...')
app_process = spawnSync('npm', ['run', 'nodemon'], {stdio: 'inherit', shell: true})
console.log('Quando server exited...')