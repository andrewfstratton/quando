const user = require('../user')
user.save("andy", "andy", null).then(
    () => { console.log("Success") },
    (err) => { console.log("Fail : ", err) } )