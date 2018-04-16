const db = require('../db')

db.dump('user', 'user_db.json').then((success)=>{
    console.log(success)
},(err)=>{console.log(err)})
db.dump('script', 'script_db.json').then((success)=>{
    console.log(success)
},(err)=>{console.log(err)})
