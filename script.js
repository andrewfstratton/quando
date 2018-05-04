'use strict'
const db = require('./db')
const COLLECTION = 'script'

exports.save = (name, id, userid, script) => {
  return new Promise((success, fail) => {
    let now = new Date()
    let doc = { name: name, ownerid: userid, date: now, xml: script}
    db.save(COLLECTION, doc).then(success, fail)
  })
}

exports.getNamesOnOwnerID = (userid) => {
  return new Promise((success, fail) => {
    const query = { ownerid: userid }
    const sort = {date:-1}
    db.find(COLLECTION, query, sort).then((result) => {
      let list = []
      result.forEach((item) => {
        let date = new Date(item.date)
        let datetime = ('0' + date.getHours()).slice(-2) +
                    ':' + ('0' + date.getMinutes()).slice(-2) + ' - ' + date.toDateString()
        list.push({ name: decodeURIComponent(item.name), date: datetime, id: item._id + '' })
      })
      success(list)
    }, fail)
  })
}

exports.getOnId = (id) => {
  return new Promise((success, fail) => {
    const query = { _id: id }
    db.find(COLLECTION, query).then((result) => {
      if (result.length == 0) {
        fail('Failed to find script')
      } else {
        let doc = result[0]
                // decode the name and the dployment name
        doc.name = decodeURIComponent(doc.name)
        doc.deploy = decodeURIComponent(doc.deploy)
        success(doc)
      }
    }, fail)
  })
}

exports.deleteOnId = (userid, id) => {
  return new Promise((success, fail) => {
    const query = { _id: id, ownerid: userid}
    const options = { justOne: true }
    db.remove(COLLECTION, query, options).then(success, fail)
  })
}

exports.tidyOnIdName = (userid, id, name) => {
  return new Promise((success, fail) => {
    const query = { name: name, _id: {$ne: id}, ownerid: userid}
    db.remove(COLLECTION, query).then(success, fail)
  })
}

exports.deleteAllOnName = (userid, name) => {
  return new Promise((success, fail) => {
    const query = { name: name, ownerid: userid}
    let options = { multi: true }
    db.remove(COLLECTION, query, options).then(success, fail)
  })
}
