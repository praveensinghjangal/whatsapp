const { Base64 } = require('./encodeDecode')
const moment = require('moment')

module.exports = ((formatedError, request) => {
    const base64 = new Base64()
    const str = request.messageId.split('-').slice(-1)[0]
    request.date = base64.decode(str || '')
    if (!(moment(request.date, 'YYMMDD', true).isValid())) {
      formatedError.push('messageId is invalid')
    }
    return formatedError
})
  