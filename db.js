'use strict'
const PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-find'))
const fs = require('fs') // Used for dumping collection
const DB_LOCATION = 'http://127.0.0.1:5984/'

function db(name) {
  return new PouchDB(DB_LOCATION + name)
}

exports.save = (db_name, doc) => {
  return new Promise((success, fail) => {
    db(db_name).post(doc).then(success, fail)
  })
}

exports.find = (db_name, options={}) => {
  return new Promise((success, fail) => {
    let _db = db(db_name)
    _db.find(options).then((doc) => {
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
    let _db = db(db_name)
    const options = {selector: query}
    _db.find(options).then((result) => {
      if (result.docs.length == 0) {
        fail('No Scripts to Remove')
      } else {
        let count = 0
        for (let i=0; i< result.docs.length; i++) {
          let doc = result.docs[i]
          doc._deleted = true
          _db.put(doc).then((result) => {
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

exports.checkDB = () => {
  PouchDB(DB_LOCATION + "_users").info((err, info)=>{
    let result = 'Database running...'
    if (err) {
      result = "Database Not running! ---  Use 'npm run pouchd' --- " + err.toString()
    }
    return result
  })
}