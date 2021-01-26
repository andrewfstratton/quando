'use strict'
const db = require('./common_db')
const COLLECTION = 'user'

exports.getOnIdPassword = (id, password) => {
  return new Promise((success, fail) => {
    db.find(COLLECTION, {_id: id, 'password': password}).then(
      (result) => {
        if (result.length == 1) {
          let user_doc = result[0]
          user_doc.id = id
          if (user_doc.script_name) { // decode the current_script
            user_doc.script_name = decodeURIComponent(user_doc.script_name)
            // no need to store deployed name - will be in script
          } else {
            delete user_doc.script_name
          }
          success(user_doc)
        } else {
          fail(Error('Failed to find unique user'))
        }
      }, fail)
  })
}

exports.save = (userid, password, script_name) => {
  return new Promise((success, fail) => {
    let doc = { _id: userid, password: password}
    if (script_name) { // don't save when null
      doc.script_name = script_name
    }
    db.save(COLLECTION, doc).then(success, fail)
  })
}
