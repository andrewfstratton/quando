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
const path = require("path")

const router = express.Router()

const http = require('http').Server(app)
const io = require('socket.io')(http)

var server = http.listen(80, () => {
    var host = server.address().address
    var port = server.address().port
    console.log("Quando Server listening at http://%s:%s", host, port)
})

const media_map = {
    'video': path.join(__dirname, 'client', 'video'),
    'audio': path.join(__dirname, 'client', 'audio'),
    'images': path.join(__dirname, 'client', 'images')
}

app.use(morgan('dev'))
// Static for Editor
app.use('/editor', express.static(path.join(__dirname, 'editor')))
app.use('/blockly', express.static(path.join(__dirname, 'blockly')))
app.use('/closure-library', express.static(path.join(__dirname, 'closure-library')))

app.use(session({
    secret: 'quando_secret',
    resave: false, // i.e. only save when changed
    saveUninitialized: true,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        // name: may need this later - if sessions exist for clients...
        httpOnly: false,
    },
    store: new mongo_store({ url: 'mongodb://127.0.0.1/quando' })
}))
app.use('/', (req, res, next) => {
    // console.log(">>" + JSON.stringify(req.session.user))
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
        user.getOnIdPassword(body.userid, body.password).then((result) => {
            req.session.user = result
            res.json({ 'success': true })
        }, (err) => {
            res.json({ 'success': false, 'message': 'Login Failed, please try again' + err })
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
    script.save(req.body.name, req.body.id, req.body.userid, req.body.script).then(
        (doc) => { res.json({ 'success': true }) },
        (err) => { res.json({ 'success': false, 'message': err }) })
})

app.get('/script/names/:userid', (req, res) => {
    script.getNamesOnOwnerID(req.params.userid).then(
        (list) => { res.json({ 'success': true, 'list': list }) },
        (err) => { res.json({ 'success': false, 'message': err }) })
})

app.get('/script/id/:id', (req, res) => {
    let id = req.params.id
    script.getOnId(id).then(
        (result) => { res.json({ 'success': true, 'doc': result }) },
        (err) => { res.json({ 'success': false, 'message': err }) })
})

app.delete('/script/id/:id', (req, res) => {
    let id = req.params.id
    script.deleteOnId(id).then(
        (doc) => { res.json({ 'success': true }) },
        (err) => { res.json({ 'success': false, 'message': err }) })
})

app.put('/script/deploy/:filename', (req, res) => {
    let filename = req.params.filename + ".js"
    let script = req.body.javascript
    fs.writeFile(client_deploy + filename, script, (err) => {
        if (!err) {
            res.json({ 'success': true })
            io.emit('deploy', {script:filename})
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
                // let files = files.split(',')
                // console.log("Get File list files=" + files)
                res.json({ 'success': true, 'files': files })
            } else {
                res.json({ 'success': false, 'message': 'Failed to retrieve contents of folder' })
            }
        })
    } else {
        res.json({ 'success': false, 'message': "Failed to find folder for '" + req.params.media + "' - Error in configuration or Deployment" })
    }
})

// Static for client
let client_dir = path.join(__dirname, "client")
app.use('/client/audio', express.static(path.join(client_dir, 'audio')))
app.use('/client/images', express.static(path.join(client_dir, 'images')))
app.use('/client/video', express.static(path.join(client_dir, 'video')))
app.use('/client/text', express.static(path.join(client_dir, 'text')))
app.use('/client/leap', express.static(path.join(client_dir, 'leap')))
app.use('/client/setup', express.static(path.join(client_dir, 'setup.html')))
app.use('/client/client.css', express.static(path.join(client_dir, 'client.css')))
app.use('/client/quando_browser.js', express.static(path.join(client_dir, 'quando_browser.js')))
app.use('/client/transparent.png', express.static(path.join(client_dir, 'transparent.png')))
app.use('/client/favicon.ico', express.static(path.join(client_dir, 'favicon.ico')))
app.use('/client/deployed_js', express.static(path.join(client_dir, 'deployed_js')))

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
    fs.readdir(path.join(__dirname, 'client', 'deployed_js'), (err, files) => {
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

app.use('/client', express.static(path.join(client_dir, 'index.html')))

// user.save("test5", "test4", null).then(
//     () => { console.log("Success") },
//     (err) => { console.log("Fail : ", err) } )
