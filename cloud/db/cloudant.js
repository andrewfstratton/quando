// Cloudant interface for save/find/remove - currently assumes Cloudant is local, e.g. deployed into IBM Cloud
const Cloudant = require('@cloudant/cloudant')
let connection = null

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
  if (connection == null) {
    const appEnv = require('cfenv').getAppEnv()
    let services = appEnv.services['cloudantNoSQLDB']
    for(let service of services) {
      if (service.name == 'Cloudant-quando') {
        connection = Cloudant(service.credentials)
        // console.log("credentials::"+service.credentials)
      }
    }
  }
  if (connection == null) {
    console.log("Failed to find Cloudant service 'Cloudant-quando'")
  } else {
    return connection.db.use(name)
  }
}

exports.save = (db_name, doc) => {
  return new Promise((success, fail) => {
    _db(db_name).insert(doc, (err, data) => {
      if (!err) {
        success(data)
      } else {
        fail(err)
      }
    })
  })
}

exports.find = (db_name, include, exclude) => {
  return new Promise((success, fail) => {
    let query = {selector: _build_query(include, exclude)}
    _db(db_name).find(query, (err, data) => {
      if (!err) {
        success(data)
      } else {
        fail(err)
      }
    })
  })
}

exports.delete = (db_name, doc) => {
  return new Promise((success, fail) => {
    doc._deleted = true
    _db(db_name).destroy(doc._id, doc._rev, (err, data) => {
      if (!err) {
        success(data)
      } else {
        fail(err)
      }
    })
  })
}