const db = require('./db')
const COLLECTION = 'user'

exports.getOnIdPassword = (id, password, next /* (err, user_doc) */) => {
    const query = { $query: { _id: { $eq: id }, password: { $eq: password } } }
    const options = { limit: 1 }
    const fields = { _id: 0, password: 0 }
    db.getArray(COLLECTION, query, fields, options, next, (result) => {
        if (result.length == 1) {
            let user_doc = result[0]
            user_doc.id = id
            // decode the current_script
            user_doc.script_name = decodeURIComponent(user_doc.script_name)
            // no need to store deployed name - will be in script
            next(null, user_doc)
        } else {
            next("Failed to find unique user")
        }
    })
}

exports.save = (userid, password, script_name, next) => {
    let doc = { _id: userid, password: password, script_name: script_name }
    db.save(COLLECTION, doc, (err) => {
        if (err) {
            console.log(err)
            err = "Error inserting"
        }
        next(err)
    })
}
