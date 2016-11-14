const mongodb = require("mongodb")

const host = "127.0.0.1"
const port = 27017
const db_name = "quando"
const mongo_url = 'mongodb://' + host + ':' + port + '/' + db_name

let _db = null

db = (next) => {
    if (_db) {
        next(null, _db)
    } else {
        mongodb.MongoClient.connect(mongo_url, (err, db) => {
            if (err != null) {
                next("Failed connection with error = " + err)
            } else {
                _db = db
                next(null, _db)
            }
        })
    }
}

exports.collection = (name, next) => {
    db((err, db) => {
        if (err) {
            next(err)
        } else {
            next(null, _db.collection(name))
        }
    })
}

exports.insert = (collection_name, doc, next) => {
    exports.collection(collection_name, (err, collection) => {
        if (err) {
            next(err)
        } else {
            collection.insert(doc, (err, doc) => {
                next(err)
            })
        }
    })
}

exports.save = (collection_name, doc, next) => {
    exports.collection(collection_name, (err, collection) => {
        if (err) {
            next(err)
        } else {
            collection.save(doc, (err, doc) => {
                next(err)
            })
        }
    })
}

exports.getArray = (collection_name, query, fields, options, fail, next) => {
    exports.collection(collection_name, (err, collection) => {
        if (err) {
            fail(err)
        } else {
            collection.find(query, fields, options).toArray((err, array) => {
                if (err) {
                    fail(err)
                } else {
                    next(array)
                }
            })
        }
    })
}

exports.remove = (collection_name, query, options, fail, next) => {
    exports.collection(collection_name, (err, collection) => {
        if (err) {
            next(err)
        } else {
            collection.remove(query, options, (err, removed_count) => {
                if (err) {
                    fail(err)
                }
                if (removed_count == 0) {
                    next(null, "No Scripts to Remove")
                } else {
                    next()
                }
            })
        }
    })
}
