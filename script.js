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
    const query = {'ownerid': {$eq: userid}} // Note: option to sort on descending date removed due to runtime error
    db.find(COLLECTION, query).then((result) => {
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
    const query = {_id: {$eq: id}}
    db.find(COLLECTION, query).then((result) => {
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
    const query = {_id: {$eq: id}}
    db.remove(COLLECTION, query).then(success, fail)
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
    const query = { name: {$eq: name}, ownerid: userid}
    db.remove(COLLECTION, query).then(success, fail)
  })
}