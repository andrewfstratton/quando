// const DB = require('./db')
const { spawn, spawnSync } = require('child_process')

let pouch_db_process = null

pouch_db_process = spawn('npm', ['run', 'pouchd'], {stdio: 'inherit', shell: true}) // , detached:true})
pouch_db_process.on('error', (err)=>{
  console.error('  PouchDB--' + err)
})

console.log('Starting Quando server...')
console.log('To open Hub Control Panel - http://127.0.0.1) - or Ctrl-C to exit...')
app_process = spawnSync('npm', ['run', 'quando'], {stdio: 'inherit', shell: true})
console.log('Quando server exited...')