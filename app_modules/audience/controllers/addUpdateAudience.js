const ValidatonService = require('../services/validation')
const AudienceService = require('../services/dbData')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const q = require('q')

const addUpdateAudienceData = (req, res) => {
  __logger.info('add update audience API called', req.body)

  // /*
  const validate = new ValidatonService()
  const audienceService = new AudienceService()
  validate.addAudience(req.body)
    .then(data => audienceService.getAudienceTableDataByPhoneNumber(req.body.phoneNumber))
    .then(audienceData => {
      if (audienceData.audienceId) {
        req.body.userId = req.user && req.user.user_id ? req.user.user_id : '0'
        return updateAudienceData(req.body, audienceData)
        // return audienceService.updateAudienceDataService(req.body, audienceData)
      } else {
        return audienceService.addAudienceDataService(req.body, audienceData)
      }
    })
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: data }))
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })

  // */
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

module.exports = { addUpdateAudienceData }
