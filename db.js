'use strict'
let db = require("./modules/pouchdb")

if (require('cfenv').getAppEnv().isLocal == false) {
console.log("NYI - running on IBM Cloud")
  db = require("./modules/cloudant")
}

exports.save = (db_name, doc) => {
  return new Promise((success, fail) => {
    db.save(db_name, doc).then(success, fail)
  })
}

exports.find = (db_name, query) => {
  return new Promise((success, fail) => {
    const options = {selector: query}
    db.find(db_name, options).then((doc) => {
      let results = []
      let rows = doc.docs.length
      for(let i=0; i<rows; i++) {
        results.push(doc.docs[i])
      }
      success(results)
      }, fail)
  })
}

exports.remove = (db_name, query) => {
  return new Promise((success, fail) => {
    const options = {selector: query}
    db.find(db_name, options).then((result) => {
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

exports.checkRunning = (success, error) => {
  PouchDB(DB_LOCATION + "_users").info((err)=>{
    if (err) {
      error("Database Not running!\n---  Use 'npm run pouchd'\n--- " + err.toString())
    } else {
      success('Database running...')
    }
  })
}