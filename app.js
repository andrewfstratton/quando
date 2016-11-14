const express = require('express')
const app = express()
const fs = require("fs")
const morgan = require("morgan")
const session = require("express-session")
const body_parser = require("body-parser")
const script = require("./script")
const client_deploy = "./client/deployed_js/"
const user = require("./user")
const mongo_store = require('connect-mongo')(session)

const router = express.Router()

const media_map = {
    'video': __dirname + '\\client\\video',
    'audio': __dirname + '\\client\\audio',
    'images': __dirname + '\\client\\images'
}

app.use(morgan('dev'))
// Static for Editor
app.use('/editor', express.static(__dirname + '/editor'))
app.use('/css', express.static(__dirname + '/css'))
app.use('/js', express.static(__dirname + '/js'))
app.use('/blockly', express.static(__dirname + '/blockly'))
app.use('/fonts', express.static(__dirname + '/fonts'))
app.use('/closure-library', express.static(__dirname + '/closure-library'))

app.use(session({
        secret: 'quando_secret',
    resave: false, // i.e. only save when changed
    saveUninitialized: true,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        // name: may need this later - if sessions exist for clients...
        httpOnly: false,
    },
    store: new mongo_store({ url: 'mongodb://localhost/quando' })
}))
app.use('/', (req, res, next) => {
    console.log(">>" + JSON.stringify(req.session.user))
    next()
})
app.get('/login', (req, res) => {
    if ((req.session) && (req.session.user)) {
        res.json({ 'success': true, 'userid': req.session.user.id })
    } else {
        res.json({ 'success': false, 'message': 'Not Logged In' })
    }
})
app.use(body_parser.urlencoded({ extended: true }))
app.use(body_parser.json())
app.post('/login', (req, res) => {
    let body = req.body
    if (body.userid && body.password) {
        user.getOnIdPassword(body.userid, body.password, (err, result) => {
            if (err) {
                res.json({ 'success': false, 'message': 'Login Failed, please try again' })
            } else {
                req.session.user = result
                res.json({ 'success': true })
            }
        })
    } else {
        res.json({ 'success': false, 'message': 'Need UserId and password' })
    }
})

app.delete('/login', (req, res) => {
    delete req.session.user
    res.json({ 'success': true, 'message': 'Logged Out' })
})

app.post('/script', (req, res) => {
    script.save(req.body.name, req.body.id, req.body.userid, req.body.script, (err) => {
        if (err) {
            res.json({ 'success': false, 'message': err })
        } else {
            res.json({ 'success': true })
        }
    })
})

app.get('/script/names/:userid', (req, res) => {
    script.getNamesOnOwnerID(req.params.userid, (err, list) => {
        if (err) {
            res.json({ 'success': false, 'message': err })
        } else {
            res.json({ 'success': true, list: list })
        }
    })
})

app.get('/script/id/:id', (req, res) => {
    let id = req.params.id
    script.getOnId(id, (err, result) => {
        if (err) {
            res.json({ 'success': false, 'message': err })
        } else {
            res.json({ 'success': true, doc: result })
        }
    })
})

app.delete('/script/id/:id', (req, res) => {
    let id = req.params.id
    script.deleteOnId(id, (err, result) => {
        if (err) {
            res.json({ 'success': false, 'message': err })
        } else {
            res.json({ 'success': true })
        }
    })
})

app.put('/script/deploy/:filename', (req, res) => {
    let filename = req.params.filename
    let script = req.body.javascript
    fs.writeFile(client_deploy + filename + ".js", script, (err) => {
        if (!err) {
            res.json({ 'success': true })
        } else {
            res.json({ 'success': false, 'message': 'Failed to deploy script' })
        }
    })
})

app.get('/file/type/:media', (req, res) => {
    var folder = media_map[req.params.media]
    // console.log("Get File list folder=" + folder)
    if (folder) {
        fs.readdir(folder, (err, files) => {
            if (!err) {
                // console.log("Get File list files=" + files)
                res.json({ 'success': true, 'files': files })
            } else {
                res.json({ 'success': false, 'message': 'Failed to retrieve contents of folder' })
            }
        })
    } else {
        res.json({ 'success': false, 'message': 'Failed to find folder - Error in configuration or Deployment' })
    }
})

var server = app.listen(80, () => {
    var host = server.address().address
    var port = server.address().port
    console.log("Quando Server listening at http://%s:%s", host, port)
})

// Static for client
let client_dir = __dirname + "\\client"
app.use('/client/audio', express.static(client_dir + '\\audio'))
app.use('/client/images', express.static(client_dir + '\\images'))
app.use('/client/video', express.static(client_dir + '\\video'))
app.use('/client/text', express.static(client_dir + '\\text'))
app.use('/client/leap', express.static(client_dir + '\\leap'))
app.use('/client/setup', express.static(client_dir + '\\setup.html'))
app.use('/client/client.css', express.static(client_dir + '\\client.css'))
app.use('/client/quando_browser.js', express.static(client_dir + '\\quando_browser.js'))
app.use('/client/transparent.png', express.static(client_dir + '\\transparent.png'))
app.use('/client/deployed_js', express.static(client_dir + '\\deployed_js'))

app.get('/client/js/:filename', (req, res) => {
    let filename = req.params.filename
    fs.readFile('./client/leap_client.htm', 'utf8', (err, data) => {
        if (err) {
            res.redirect('/client/setup')
        } else {
            res.write(data.replace(/\[\[TITLE\]\]/,
                filename.replace(/\.js/, '')).replace(/\[\[DEPLOYED_JS\]\]/, filename))
            res.end()
        }
    })

})

app.get('/client/js', (req, res) => {
    fs.readdir(__dirname + '\\client\\deployed_js', (err, files) => {
        if (!err) {
            require('dns').lookup(require('os').hostname(), function (err, add, fam) {
                res.json({ 'success': true, ip: add, 'files': files })
            })
        } else {
            res.json({
                'success': false,
                'message': 'Failed to retrieve contents of deployed_js folder'
            })
        }
    })
})

app.use('/client', express.static(client_dir + '\\index.html'))

user.getOnIdPassword("test", "password", (err, doc) => {
    console.log(err, doc)
})