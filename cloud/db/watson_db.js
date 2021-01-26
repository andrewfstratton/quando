/**
 * 
 * This DB supports the implementation of IBM Watson
 * services. It is currently primarily used as a UUID
 * generator for files saved to the server during service
 * usage. 
 * 
 * It is intended to be later used to clean up server
 * storage, e.g. tracking file age and deleting all older
 * than a day.
 * 
 */

'use strict'
const db = require('./common_db')
const COLLECTION = 'watson'

exports.save = (text) => {
  return new Promise((success, fail) => {
    let now = new Date().toJSON()
    let doc = { text: text, time: now }
    db.save(COLLECTION, doc).then(success, fail)
  })
}