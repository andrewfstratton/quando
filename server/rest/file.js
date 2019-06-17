const fs = require('fs')
const formidable = require('formidable')
const path = require('path')

module.exports = (app, media_folder, media_map, success, fail) => {
  app.get('/file/type/*', (req, res) => {
    let filename = req.params[0]
    let media = path.basename(filename)
    let folder = filename.substring(0, filename.length - media.length)
    let folderpath = path.join(media_folder, folder)
    let suffixes = media_map[media] // these are the relevant filename endings - excluding the '.'
    fs.readdir(folderpath, (err, files) => {
      if (!err) {
        let filelist = files.toString().split(',')
        let filtered = []
        let folders = []
        for (let i in filelist) {
          let stat = fs.statSync(path.join(folderpath, filelist[i]))
          if (stat.isDirectory()) {
            folders.push(filelist[i])
          } else {
            for (let s in suffixes) {
              if (filelist[i].toLowerCase().endsWith('.' + suffixes[s])) {
                filtered.push(filelist[i])
              }
            }
          }
        }
        success(res, {'files': filtered, 'folders': folders})
      } else {
        fail(res, 'Failed to retrieve contents of folder')
      }
    })
  })

  app.post('/file/upload/*', (req, res) => {
    let filename = req.params[0]
    let media = path.basename(filename)
    let folder = filename.substring(0, filename.length - media.length)
    let form = new formidable.IncomingForm()
    // form.encoding = 'utf-8'
    form.multiples = true
    form.uploadDir = path.join(media_folder, folder)
    form.keepExtensions = true
    form.parse(req, (err, fields, files) => {
      if (err) {
        fail(res, 'failed to upload')
      } else {
        success(res)
      }
    })
    form.on('fileBegin', (name, file) => {
      const [fileName, fileExt] = file.name.split('.')
      file.path = path.join(form.uploadDir, `${fileName}_${new Date().getTime()}.${fileExt}`)
    })
    form.on('file', (field, file) => {
      fs.rename(file.path, path.join(form.uploadDir, file.name), (err) => {
        if (!res.headersSent) { // Fix since first response is received
          fail(res, 'an error has occured with form upload' + err)
        }
      })
    })
    form.on('error', (err) => {
      fail(res, 'an error has occured with form upload' + err)
    })
    form.on('aborted', (err) => {
      fail(res, 'Upload cancelled by browser')
    })
  })
}
