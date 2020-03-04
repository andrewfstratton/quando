const db = require('./common_db')
const COLLECTION = 'nao'

exports.getAll = () => {
  return new Promise((success, fail) => {
    db.find(COLLECTION).then(
      (result) => {
        let results = []
        for(let i in result) {
          let doc = {'mac':result[i]._id, 'name':result[i].name}
          results.push(doc)
        }
        success(results)
      }, fail)
  })
}

exports.add = (mac, name="") => {
  return new Promise((success, fail) => {
    if (mac) {
      let doc = {_id: mac, name: name}
      db.save(COLLECTION, doc).then(success, fail)
    } else {
      fail('No mac given...')
    }
  })
}

exports.wipe = () => {
  return new Promise((success, fail) => {
    db.remove(COLLECTION, {}).then(success, fail)
  })
}
