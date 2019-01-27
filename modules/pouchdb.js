// PouchDB interface for save/find/remove

const PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-find'))
const DB_LOCATION = 'http://127.0.0.1:5984/'

function _build_query(include, exclude) {
  let query = {}
  Object.entries(include).forEach(([k,v])=> {
    query[k] = {$eq:v}
  })
  Object.entries(exclude).forEach(([k,v])=> {
    query[k] = {$ne:v}
  })
  return query
}

function _db(name) {
  return new PouchDB(DB_LOCATION + name)
}

exports.save = (db_name, doc) => {
  return new Promise((success, fail) => {
    _db(db_name).post(doc).then(success, fail)
  })
}

exports.find = (db_name, include, exclude) => {
  let options = {selector: _build_query(include, exclude)}
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

