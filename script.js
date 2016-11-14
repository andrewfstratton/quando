const db = require('./db')
let ObjectID = require("mongodb").ObjectID
const COLLECTION = 'script'

exports.save = (name, id, userid, script, next) => {
    let doc = { name: name, ownerid: userid, xml: script, date: new Date() }
    db.insert(COLLECTION, doc, (err) => {
        if (err) {
            err = "Error inserting"
            console.log(err)
        }
        next(err)
    })
}

exports.getNamesOnOwnerID = (userid, next /* err, list */) => {
    const query = { $query: { ownerid: { $eq: userid } } }
    const options = { sort: [['date', 'desc']] }
    const fields = { name: 1, date: 1 }
    db.getArray(COLLECTION, query, fields, options, next, (result) => {
        let list = []
        result.forEach((item) => {
            let date = new Date(item.date)
            let datetime = ("0"+ date.getHours()).slice(-2)
                + ":" + ("0" + date.getMinutes()).slice(-2) + " - " + date.toDateString()
            list.push({ name: decodeURIComponent(item.name), date: datetime, id: item._id + '' })
        })
        next(null, list)
    })
}

exports.getOnId = (id, next /* (err, script object) */) => {
    const oid = new ObjectID(id)
    const query = { $query: { _id: { $eq: oid } } }
    const options = { limit: 1 }
    const fields = { _id: 0 }
    db.getArray(COLLECTION, query, fields, options, next, (result) => {
        if (result.length == 0) {
            next ("Failed to find script")
        } else {
            let doc = result[0]
            // decode the name and the dployment name
            doc.name = decodeURIComponent(doc.name)
            doc.deploy = decodeURIComponent(doc.deploy)
            next(null, doc)
        }
    })
}

exports.deleteOnId = (id, next /* (err) */) => {
    const oid = new ObjectID(id)
    const query = { _id: { $eq: oid } }
    const options = { single: 1 }
    db.remove(COLLECTION, query, options, next, next)
}