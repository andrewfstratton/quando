// PouchDB interface for save/find/remove

const PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-find'))
const DB_LOCATION = 'http://127.0.0.1:5984/'

function _db(name) {
  return new PouchDB(DB_LOCATION + name)
}

exports.save = (db_name, doc) => {
  return new Promise((success, fail) => {
    _db(db_name).post(doc).then(success, fail)
  })
}

exports.find = (db_name, options) => {
  return new Promise((success, fail) => {
    _db(db_name).find(options).then(success, fail)
  })
}

exports.delete = (db_name, doc) => {
  return new Promise((success, fail) => {
    doc._deleted = true
    _db(db_name).put(doc).then(success, fail)
  })
}

