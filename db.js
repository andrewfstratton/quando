'use strict'
const TingoDb = require('tingodb')().Db
const fs = require('fs') // Used for dumping collection
const DB_LOCATION = process.cwd() + '/tingo_db'

let cached_db = null

function getDB() {
  return new Promise((success, fail) => { // promise is hangover from mongodb
    if (!cached_db) {
      cached_db = new TingoDb(DB_LOCATION, {})
      if (!cached_db) {
        console.log('Attempt to open TingoDB database at: "'+DB_LOCATION+'"')
        console.trace()
        fail('Unknown Error: Opening TingoDB database - check folder exists')
      }
    }
    success(cached_db)
  })
}

function collection(name) {
  return new Promise((success, fail) => {
    getDB().then((db) => {
      success(db.collection(name))
    }, fail)
  })
}

exports.save = (collection_name, doc) => {
  return new Promise((success, fail) => {
    collection(collection_name).then((_collection) => {
      _collection.save(doc, (err, doc) => {
        if (err) {
          fail(JSON.stringify(err))
        } else {
          success() // could return doc.result.upserted[0]._id ?!
        }
      })
    }, fail)
  })
}

exports.getArray = (collection_name, query, fields, options) => {
  return new Promise((success, fail) => {
    collection(collection_name).then((_collection) => {
      options.projection = fields
      _collection.find(query, options).toArray((err, array) => {
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
      _collection.find().toArray((err, array) => {
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
