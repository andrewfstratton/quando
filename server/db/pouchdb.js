// PouchDB interface for save/find/remove

const PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-find'))
const DB_LOCATION = 'http://127.0.0.1:5984/'

function _build_query(include, exclude) {
  let query = {}
  for (let key in include) {
    query[key] = {$eq:include[key]}
  }
  for (let key in exclude) {
    query[key] = {$ne:exclude[key]}
  }
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

exports.running = (success, error) => {
  PouchDB(DB_LOCATION + "_users").info((err)=>{
    if (err) {
      error("Database Not running!\n---  Use 'npm run pouchd'\n--- " + err.toString())
    } else {
      success('Database running...')
    }
  })
}