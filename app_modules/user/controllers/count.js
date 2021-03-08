const UserService = require('../services/dbData')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')

// Get User Account Created Today Count
const getAccountCreatedTodayCount = (req, res) => {
  __logger.info('Inside Get Account Created Today Count Called')
  const userService = new UserService()
  userService.getAccountCreatedTodayCount()
    .then(data => {
      __logger.info('then 1 get Account Created Today Count data', data)
      return __util.send(res, {
        type: __constants.RESPONSE_MESSAGES.SUCCESS,
        data: data
      })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = {
  getAccountCreatedTodayCount
}
