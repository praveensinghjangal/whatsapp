const q = require('q')
const _ = require('lodash')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const UniqueId = require('../../../lib/util/uniqueIdGenerator')
const moment = require('moment')

class OptinService {
  constructor () {
    this.uniqueId = new UniqueId()
  }

  getOptinStatusByPhoneNumber (phoneNumber) {
    const dataFetched = q.defer()

    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getOptinByPhoneNumber(), [phoneNumber])
      .then(result => {
        if (result && result.length === 0) {
          dataFetched.resolve(null)
        } else {
          result[0].tempOptin = 0
          // console.log('Hours>>>>>>>>>>>>>>>>>.....', moment().diff(moment(result[0].lastMessage), 'hours'))

          if (moment().diff(moment(result[0].lastMessage), 'hours') <= 24) {
            result[0].tempOptin = 0
          }
          console.log('Result>>>>>>>>>>>>>>>>>.....', result[0])
          dataFetched.resolve(result[0])
        }
      })
      .catch(err => {
        __logger.error('error in get audience by phone number function: ', err)
        dataFetched.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })

    return dataFetched.promise
  }

  computeOptinStatus (data) {
    console.log('Input ', data)
    const optinResult = q.defer()
    delete data.lastMessage
    if (data.tempOptin === 1 || (data.tempOptin === 1 && data.optin === 1)) {
      delete data.optin
      optinResult.resolve(data)
    } else if (data.tempOptin === 0 && data.optin === 0) {
      // If both are not present
      optinResult.reject(data)
    } else if (data.tempOptin === 0 && data.optin === 1) {
    // when optin is present
      delete data.tempOptin
      optinResult.resolve(data)
    }
    // __db.mysql(__constants.HW_MYSQL_NAME, queryProvider.)
    //
    console.log('Compute Data', data)
    return optinResult.prommise
  }
}

module.exports = OptinService
