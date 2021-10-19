const q = require('q')
const __logger = require('../../../lib/logger')
class Audience {
  constructor (maxConcurrent, userId) {
    this.userId = userId
  }

  saveOptin (wabaNumber, listOfPhoneNumbers) {
    __logger.info('Tyntec saveOptin ::>>>>>>>>>>>>>>>>>>>>> ', listOfPhoneNumbers)
    const deferred = q.defer()
    // {
    //     input: '+917666545750',
    //     status: 'valid',
    //     wa_id: '917666545750'
    //  }
    const resolvedData = []
    listOfPhoneNumbers.forEach(phoneNumber => {
      resolvedData.push({
        input: phoneNumber,
        status: 'valid'
      })
    })
    deferred.resolve(resolvedData)
    return deferred.promise
  }
}

module.exports = Audience
