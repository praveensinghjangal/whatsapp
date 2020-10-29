const fs = require('fs')

class FileStream {
  deleteFile (filePath, fileName) {
    fs.unlink(filePath, err => {
      if (err) console.log(err)
      else {
        console.log('\nDeleted file:', fileName)
      }
    })
  }
}
module.exports = { FileStream }
