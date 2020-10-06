// # ┌────────────── second (optional)
// # │ ┌──────────── minute
// # │ │ ┌────────── hour
// # │ │ │ ┌──────── day of month
// # │ │ │ │ ┌────── month
// # │ │ │ │ │ ┌──── day of week
// # │ │ │ │ │ │
// # │ │ │ │ │ │
// # * * * * * *

const cron = require('node-cron')
const request = require('request')
const __config = require('../../../config')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const q = require('q')

const task = cron.schedule(' * 8 */1 * *', () => {
  apiCall()
  console.log('task started')
}, {
  scheduled: false
})

const apiCall = () => {
  const apiCalled = q.defer()
  const url = __config.base_url + __constants.INTERNAL_END_POINTS.getWabaNumberByUserId + '?userId=158988680814912'
  __logger.info('apiCall :: apiCall >>>>>>>>>>>>>>>>>>>>>>>>')
  const options = {
    url,
    body: {},
    headers: { Authorization: __config.authTokens[0] },
    json: true
  }
  // Calling another api for sending messages
  request.get(options, (err, httpResponse, body) => {
    if (err) {
      return apiCalled.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
    } else {
    //   console.log('BOdy', body)
    }
    return apiCalled.resolve(body)
  })
  return apiCalled.promise
}

task.start()
