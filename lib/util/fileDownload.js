const request = require('request')
const fs = require('fs')
const __constants = require('../../config/constants')

class FileDownload {
  downloadFile (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
      if (err) console.log(err)
      console.log('content-type:', res.headers['content-type'])
      console.log('content-length:', res.headers['content-length'])
      request(uri).pipe(fs.createWriteStream(__constants.PUBLIC_FOLDER_PATH + '/downloads/' + filename)).on('close', callback)
    })
  }
}
module.exports = { FileDownload }
