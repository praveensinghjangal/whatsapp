const ValidatonService = require('../services/validation')
const AudienceService = require('../services/dbData')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const q = require('q')
const rejectionHandler = require('../../../lib/util/rejectionHandler')

const addUpdateAudienceData = (req, res) => {
  __logger.info('add update audience API called', req.body)
  __logger.info('add update audience API called', req.user)

  const userId = req.user && req.user.user_id ? req.user.user_id : '0'

  processRecordInBulk(req.body, userId)
    .then(data => {
    //   console.log('Data', data)
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: data })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err || err })
    })
}

function updateAudienceData (inputData, oldAudienceData) {
  const audienceData = q.defer()

  const validate = new ValidatonService()
  const audienceService = new AudienceService()
  validate.updateAudience(inputData)
    .then(() => audienceService.updateAudienceDataService(inputData, oldAudienceData))
    .then(data => audienceData.resolve(data))
    .catch(err => {
      __logger.error('error: ', err)
      audienceData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
    })

  return audienceData.promise
}

const singleRecordProcess = (data, userId) => {
//   console.log('Singlge Record', data)
  const dataSaved = q.defer()
  const validate = new ValidatonService()
  const audienceService = new AudienceService()
  validate.addAudience(data)
    .then(data => audienceService.getAudienceTableDataByPhoneNumber(data.phoneNumber, userId, data.wabaPhoneNumber))
    .then(audienceData => {
      // console.log('Get Result', audienceData)
      data.userId = userId
      if (audienceData.audienceId) {
        return updateAudienceData(data, audienceData)
      } else {
        return audienceService.addAudienceDataService(data, audienceData)
      }
    })
    .then(data => dataSaved.resolve(data))
    .catch(err => {
      __logger.info('Err', err)
      dataSaved.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
    })
  return dataSaved.promise
}

const processRecordInBulk = (data, userId) => {
  let p = q()
  const thePromises = []

  if (!data.length) {
    return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: __constants.RESPONSE_MESSAGES.EXPECT_ARRAY })
  }
  data.forEach(singleObject => {
    p = p.then(() => singleRecordProcess(singleObject, userId))
      .catch(err => err)
    thePromises.push(p)
  })
  return q.all(thePromises)
}

const markOptinByPhoneNumberAndAddOptinSource = (req, res) => {
  __logger.info('inside markOptinByPhoneNumber', req.body)
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'

  const input = req.body
  input.optin = true
  input.channel = __constants.DELIVERY_CHANNEL.whatsapp

  const validate = new ValidatonService()
  validate.checkOptinInput(input)
    .then(data => singleRecordProcess(input, userId))
    .then(data => {
      for (var key in data) {
        // console.log('key', key)
        if (key !== 'optin' && key !== 'optinSourceId') {
          delete data[key]
        }
      }
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: data })
    })
    .catch(err => __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
}

const markOptOutByPhoneNumber = (req, res) => {
  // __logger.info('inside markOptOutByPhoneNumber', req.body)
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  const input = req.body
  input.channel = __constants.DELIVERY_CHANNEL.whatsapp
  input.optin = false

  const validate = new ValidatonService()
  validate.checkPhoneNumberExistService(input)
    .then(data => singleRecordProcess(input, userId))
    .then(data => {
      // console.log('Data', data)
      for (var key in data) {
        // console.log('key', key)
        if (key !== 'optin') {
          delete data[key]
        }
      }
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: data })
    })
    .catch(err => __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
}

module.exports = {
  addUpdateAudienceData,
  markOptinByPhoneNumberAndAddOptinSource,
  markOptOutByPhoneNumber
}
