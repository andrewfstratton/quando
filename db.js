'use strict'
let db = require("./modules/pouchdb")

if (require('cfenv').getAppEnv().isLocal == false) {
  console.log("Using Cloudant - i.e. running on IBM Cloud")
  db = require("./modules/cloudant")
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