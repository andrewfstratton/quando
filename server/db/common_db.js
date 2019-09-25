'use strict'
let db = require("./pouchdb")
let pouchdb_installed = false

function try_cloudant() {
  let _db = false
  console.log("Trying cloudant (assuming IBM Cloud)")
  if (require('cfenv').getAppEnv().isLocal == false) {
    console.log("Using Cloudant - i.e. running on IBM Cloud")
    _db = require("./cloudant")
  } else {
    if (pouchdb_installed) {
      console.error("ERROR: PouchDB not running - try 'npm run pouchd' or 'npm start'")
    } else {
      console.error("ERROR: PouchDB not installed - for running local+offline, run 'npm run install_local'")
    }
    console.error("Exiting...")
    process.exit()
  }
  return _db
}

if (db.exists) {
  pouchdb_installed = true
  db.running(()=>{
    console.log("Found PouchDB installed and running - i.e. on local, offline, server - typically for development")
  },()=>{
    console.log("Pouchdb installed but not running")
    db = try_cloudant()
  })
} else {
  db = try_cloudant()
}

exports.save = (db_name, doc) => {
  return new Promise((success, fail) => {
    db.save(db_name, doc).then(success, fail)
  })
}

exports.find = (db_name, include, exclude = {}) => {
  return new Promise((success, fail) => {
    db.find(db_name, include, exclude).then((doc) => {
      let results = []
      let rows = doc.docs.length
      for(let i=0; i<rows; i++) {
        results.push(doc.docs[i])
      }
      success(results)
      }, fail)
  })
}

exports.remove = (db_name, include, exclude = {}) => {
  return new Promise((success, fail) => {
    db.find(db_name, include, exclude).then((result) => {
      if (result.docs.length == 0) {
        fail('No Scripts to Remove')
      } else {
        let count = 0
        for (let i=0; i< result.docs.length; i++) {
          let doc = result.docs[i]
          db.delete(db_name, doc).then((result) => {
            count++
          }, (err) => {
            fail(err)
          })
        }
        success(count)
      }
    }, (err) => {
      fail('Script query failed with error: ' + err)
    })
  })
}