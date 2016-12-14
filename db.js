"use strict"
const mongodb = require("mongodb")

const host = "127.0.0.1"
const port = 27017
const db_name = "quando"
const mongo_url = 'mongodb://' + host + ':' + port + '/' + db_name

let cached_db = null

let db = () => {
    return new Promise((success, fail) => {
        if (cached_db) {
            success(cached_db)
        } else {
            mongodb.MongoClient.connect(mongo_url, (err, _db) => {
                if (err == null) {
                    cached_db = _db
                    success(cached_db)
                } else {
                    fail(Error("Failed connection with error = " + err))
                }
            })
        }
    })
}

let collection = (name) => {
    return new Promise((success, fail) => {
        db().then((_db) => {
            success(_db.collection(name))
        }, fail)
    })
}

exports.save = (collection_name, doc) => {
    return new Promise((success, fail) => {
        collection(collection_name).then((_collection) => {
            _collection.save(doc, (err, doc) => {
                if (err) {
                    fail(err)
                }
                else {
                    success() // could return doc.result.upserted[0]._id ?!
                }
            })
        }, fail)
    })
}

exports.getArray = (collection_name, query, fields, options) => {
    return new Promise((success, fail) => {
        collection(collection_name).then((_collection) => {
            _collection.find(query, fields, options).toArray((err, array) => {
                if (err) {
                    fail(err)
                } else {
                    success(array)
                }
            })
        }, fail)
    })
}

exports.remove = (collection_name, query, options) => {
    return new Promise((success, fail) => {
        collection(collection_name).then((_collection) => {
            _collection.remove(query, options, (err, removed_count) => {
                if (err) {
                    fail(err)
                }
                if (removed_count == 0) {
                    fail(Error("No Scripts to Remove")) // needs fixing...
                } else {
                    success()
                }
            })
        }, fail)
    })
}
