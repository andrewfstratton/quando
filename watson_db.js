'use strict'
const db = require('./db')
const COLLECTION = 'watson'

exports.save = (text) => {
  return new Promise((success, fail) => {
    let now = new Date().toJSON()
    let doc = { text: text, time: now }
    db.save(COLLECTION, doc).then(success, fail)
  })
}