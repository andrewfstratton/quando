'use strict'
const db = require('./db')
const COLLECTION = 'script'

exports.save = (name, userid, script) => {
  return new Promise((success, fail) => {
    let now = new Date().toJSON()
    let doc = { ownerid: userid, name: name, date: now, script: script}
    db.save(COLLECTION, doc).then(success, fail)
  })
}

exports.getNamesOnOwnerID = (userid) => {
  return new Promise((success, fail) => {
    db.find(COLLECTION, {'ownerid':userid}).then((result) => {
      let list = []
      result.forEach((item) => { // get ready to sort
        list.push({ name: decodeURIComponent(item.name), date: new Date(item.date), id: item._id + '' })
      })
      list.sort((a,b) => {
        return b.date - a.date
      })
      list.forEach((item) => {
        let idate = item.date
        let datetime = ('0' + idate.getHours()).slice(-2) +
            ':' + ('0' + idate.getMinutes()).slice(-2) + ' ' + idate.toDateString()
        item.date = datetime
      })
      success(list)
    }, fail)
  })
}

exports.getOnId = (id) => {
  return new Promise((success, fail) => {
    db.find(COLLECTION, {_id: id}).then((result) => {
      if (result.length == 0) {
        fail('Failed to find script')
      } else {
        let doc = result[0]
                // decode the name and the deployment name
        doc.name = decodeURIComponent(doc.name)
        if (doc.deploy) {
          doc.deploy = decodeURIComponent(doc.deploy)
        }
        success(doc)
      }
    }, fail)
  })
}

exports.deleteOnId = (id) => {
  return new Promise((success, fail) => {
    db.remove(COLLECTION, {_id: id}).then(success, fail)
  })
}

exports.tidyOnIdName = (userid, id, name) => {
  return new Promise((success, fail) => {
    const inc = {'name': name, 'ownerid': userid}
    const ex = { _id: id}
    db.remove(COLLECTION, inc, ex).then(success, fail)
  })
}

exports.deleteAllOnName = (userid, name) => {
  return new Promise((success, fail) => {
    db.remove(COLLECTION, {'name': name, 'ownerid': userid}).then(success, fail)
  })
}