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
    // Derived from Cloudant package on GitHub
    const appEnv = cfenv.getAppEnv()
    if (appEnv.services['cloudantNoSQLDB']) {
      console.log("--appEnv service...")
    }
    // let credentials = {
      // "url":"https://99a579ff-a253-4670-8141-c3162c969e52-bluemix:31a868f7a68cd0f9e717f2e5076b0ee083714d3c192fc95b0ebb55618e45e91e@99a579ff-a253-4670-8141-c3162c969e52-bluemix.cloudantnosqldb.appdomain.cloud"
    // }
    let credentials = process.env.CLOUDANT_URL
    console.log("::"+credentials)
    connection = Cloudant(credentials)
  }
  return connection.db.use(name)
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