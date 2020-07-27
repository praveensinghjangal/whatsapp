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
      console.log('Data', data)
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
  console.log('Singlge Record', data)
  const dataSaved = q.defer()
  const validate = new ValidatonService()
  const audienceService = new AudienceService()
  validate.addAudience(data)
    .then(data => audienceService.getAudienceTableDataByPhoneNumber(userId, data.phoneNumber))
    .then(audienceData => {
      console.log('Get Result', audienceData)
      data.userId = userId
      if (audienceData.audienceId) {
        return updateAudienceData(data, audienceData)
      } else {
        return audienceService.addAudienceDataService(data, audienceData)
      }
    })
    .then(data => dataSaved.resolve(data))
    .catch(err => {
      console.log('Err', err)
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

module.exports = { addUpdateAudienceData }
