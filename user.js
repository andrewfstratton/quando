'use strict'
const db = require('./db')
const COLLECTION = 'user'

exports.getOnIdPassword = (id, password) => {
  return new Promise((success, fail) => {
    const query = { _id: id, password: password }
    db.find(COLLECTION, query).then(
      (result) => {
        if (result.length == 1) {
          let user_doc = result[0]
          user_doc.id = id
              // decode the current_script
          user_doc.script_name = decodeURIComponent(user_doc.script_name)
              // no need to store deployed name - will be in script
          success(user_doc)
        } else {
          fail(Error('Failed to find unique user'))
        }
      }, fail)
  })
}

exports.save = (userid, password, script_name) => {
  return new Promise((success, fail) => {
    let doc = { _id: userid, password: password, script_name: script_name }
    db.save(COLLECTION, doc).then(success, fail)
  })
}
