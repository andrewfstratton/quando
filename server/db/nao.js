const db = require('./common_db')
const COLLECTION = 'nao'

exports.getAll = () => {
  return new Promise((success, fail) => {
    db.find(COLLECTION).then(
      (result) => {
        let results = []
        for(let i in result) {
          let doc = {'ip':result[i]._id, 'name':result[i].name}
          results.push(doc)
        }
        success(results)
      }, fail)
  })
}

exports.add = (ip, name="") => {
  return new Promise((success, fail) => {
    if (ip) {
      let doc = {_id: ip, name: name}
      db.save(COLLECTION, doc).then(success, fail)
    } else {
      fail('No IP passed...')
    }
  })
}
