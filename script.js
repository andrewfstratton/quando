"use strict"
const db = require('./db')
let ObjectID = require("mongodb").ObjectID
const COLLECTION = 'script'

exports.save = (name, id, userid, script) => {
    return new Promise((success, fail) => {
        let doc = { name: name, ownerid: userid, xml: script, date: new Date() }
        db.save(COLLECTION, doc).then(success, fail)
    })
}

exports.getNamesOnOwnerID = (userid) => {
    return new Promise((success, fail) => {
        const query = { ownerid: { $eq: userid } }
        const options = { sort: [['date', 'desc']] }
        const fields = { name: 1, date: 1 }
        db.getArray(COLLECTION, query, fields, options).then((result) => {
            let list = []
            result.forEach((item) => {
                let date = new Date(item.date)
                let datetime = ("0" + date.getHours()).slice(-2)
                    + ":" + ("0" + date.getMinutes()).slice(-2) + " - " + date.toDateString()
                list.push({ name: decodeURIComponent(item.name), date: datetime, id: item._id + '' })
            })
            success(list)
        }, fail)
    })
}

exports.getOnId = (id) => {
    return new Promise((success, fail) => {
        const oid = new ObjectID(id)
        const query = { _id: { $eq: oid } }
        const options = { limit: 1 }
        const fields = { _id: 0 }
        db.getArray(COLLECTION, query, fields, options).then((result) => {
            if (result.length == 0) {
                fail("Failed to find script")
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

exports.deleteOnId = (id) => {
    return new Promise((success, fail) => {
        const oid = new ObjectID(id)
        const query = { _id: { $eq: oid } }
        const options = { single: 1 }
        db.remove(COLLECTION, query, options).then(success, fail)
    })
}