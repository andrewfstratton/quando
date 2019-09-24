const fs = require('fs')
const join = require('path').join

module.exports = (app, dirname, success, fail) => {
  app.get('/blocks', (req, res) => {
    fs.readdir(join(dirname, 'blocks'), (err, folders) => {
      if (!err) {
        let blocks = []
        for(let folder of folders) {
          let menu = {title:true}
          let parts = folder.split('_')
          parts.shift() // drop the number
          let name = ''
          let cls = ''
          for(let part of parts) {
            cls += part + '-'
            name += part.charAt(0).toUpperCase() + part.slice(1) + ' '
          }
          menu.name = name.slice(0, -1)
          menu.class = cls.slice(0, -1)
          menu.folder = folder
          blocks.push(menu)
          let files = fs.readdirSync(join(dirname, 'blocks', folder))
          if (files) {
            let failed = false
            for(let file of files) {
              if (!failed && (file.endsWith('.htm') || (file.endsWith('.html')))) {
                let suffix_length = '.htm'.length
                if (file.endsWith('.html')) suffix_length++
                let block = {title:false}
                block.type = file.substring(file.indexOf('_') + 1).slice(0, -suffix_length) // drop the number, and the '.htm'
                block.type = block.type.replace(/_/g, '-') // turn _ based filename into - based attribute
                let contents = fs.readFileSync(join(dirname, 'blocks', folder, file))
                if (contents) {
                  block.html = contents.toString('utf8')
                } else {
                  failed = true
                }
                blocks.push(block)
              }
            }
          }
        } // for
        success(res, {'blocks': blocks})
      } else {
        fail(res, 'Failed to retrieve contents of blocks folder')
      }
    })
  })
}
