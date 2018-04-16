// N.B. have to drop the _id from script - and remove duplicate and remove the date?!
// Warning - undump does in reverse order to restore the date order (ish)
// - the id is not stored as ObjectID...
// Also - must be in the utils folder when run...
const db = require('../db')

db.undump_script('script', 'script_db.json').then((success)=>{
    console.log(success)
},(err)=>{console.log(err)})
