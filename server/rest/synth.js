
module.exports = (app, fs) => {

  app.post('/synthesize/grabfile', (req, res) => {
    console.log('grabfile requested...');
    let tag = req.body.tag;
    console.log('\trequested with tag ', tag);
    let filename = grabByTag(tag);
    console.log('\ysent by grabByTag ', filename);
    res.json({ filename: filename });
  });

  function grabByTag(tag) {
    let list = fs.readdirSync("./client/media/watson/");
    for (let filename of list) {
      if (filename.includes(tag)) {
        console.log('(grabByTag())\tfound filename with tag ', tag);
        console.log('(grabByTag())\tfilename = ', filename);
        return filename;
      }
      else {
        console.error('no audio file with the specified tag');
      }
    }
  }
}


