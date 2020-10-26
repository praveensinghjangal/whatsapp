const ValidatonService = require('../services/validation')
const OptinService = require('../services/dbData')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')

const addUpdateOptinSourceData = (req, res) => {
  __logger.info('add update segment API called')
  const validate = new ValidatonService()
  const optinService = new OptinService()
  validate.checkAddOptinSourceData(req.body)
    .then(data => optinService.getOptinSourceDataById(req.body.optinSourceId))
    .then(optinData => {
      __logger.info('optinData::then 2', { optinData })
      if (optinData.optinSourceId) {
        return optinService.updateOptinSourceData(req.body, optinData)
      } else {
        return optinService.addOptinSourceData(req.body, optinData)
      }
    })
    .then(data => {
      __logger.info('optinData::then 3')
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: data })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = { addUpdateOptinSourceData }
