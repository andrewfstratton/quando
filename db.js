'use strict'
// Type 3: Persistent datastore with automatic loading
const NeDB = require('nedb')
const fs = require('fs') // Used for dumping collection
const DB_LOCATION = process.cwd() + '\\nedb\\'

function collection(name) {
  return new Promise((success, fail) => {
    let collection = new NeDB({ filename: DB_LOCATION + name})
    collection.loadDatabase((err) => {
      if (err) {
        fail('Failed to open collection : ' + name)
        console.log('error = ' + err)
      } else {
        success(collection)
      }
    })
  })
}

exports.save = (collection_name, doc) => {
  return new Promise((success, fail) => {
    collection(collection_name).then((_collection) => {
      _collection.insert(doc, (err, newDocs) => {
        if (err) {
          let id = doc._id
          delete doc._id
          _collection.update({_id:id}, doc, {}, (err, doc) => {
            if (err) {
              fail(JSON.stringify(err))
            } else {
              success()
            }
          })
        } else {
          success()
        }
      }, fail)
    })
  })
}

exports.find = (collection_name, query, sort={}) => {
  return new Promise((success, fail) => {
    collection(collection_name).then((_collection) => {
      _collection.find(query).sort(sort).exec((err, array) => {
        if (err) {
          fail(err)
        } else {
          success(array)
        }
      })
    }, fail)
  })
}

exports.remove = (collection_name, query, options = {}) => {
  return new Promise((success, fail) => {
    collection(collection_name).then((_collection) => {
      _collection.remove(query, options, (err, removed_count) => {
        if (removed_count == 0) {
          fail('No Scripts to Remove') // needs fixing...
        } else {
          if (err) {
            fail(JSON.stringify(err))
          } else {
            success()
          }
        }
      })
    }, fail)
  })
}

exports.dump = (collection_name, filename) => {
  return new Promise((success, fail) => {
    collection(collection_name).then((_collection) => {
      _collection.find({}, (err, array) => {
        if (err) {
          fail(JSON.stringify(err))
        } else {
          fs.writeFile(filename, JSON.stringify(array, null, 2), (err) => {
            if (!err) {
              success(`Collection: ${collection_name} saved to ${filename}`)
            } else {
              fail(`**Error: Failed to dump collection: ${collection_name} to ${filename}, error:${err}`)
            }
          })
        }
      })
    }, fail)
  })
}

exports.undump_script = (collection_name, filename) => {
  return new Promise((success, fail) => {
    collection(collection_name).then((_collection) => {
      fs.readFile(filename, 'utf8', (err, data) => {
        if (!err) {
          // console.log(data)
          let array = JSON.parse(data)
          console.log('inserting ' + array.length + ' documents...')
          // N.B. inserts in reverse order (!) and adds adte as now (!)
          for(let i=array.length - 1; i>=0; i--) {
            array[i].date = new Date()
            _collection.save(array[i], (err) => {
              if (err) {
                fail(JSON.stringify(err))
              } else {
                process.stdout.write('.')
              }
            })
          }
          success(`Collection: ${collection_name} inserted from ${filename}`)
        } else {
          fail(`**Error: Failed to undump collection: ${collection_name} to ${filename}, error:${err}`)
        }
      })
    }, fail)
  })
}
