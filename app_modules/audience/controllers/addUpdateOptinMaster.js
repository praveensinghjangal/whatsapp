const ValidatonService = require('../services/validation')
const OptinService = require('../services/dbData')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')

const addUpdateOptinData = (req, res) => {
  __logger.info('add update segment API called')
  const validate = new ValidatonService()
  const optinService = new OptinService()
  validate.checkAddOptinData(req.body)
    .then(data => optinService.getOptinDataById(req.body.optinSourceId))
    .then(optinData => {
      if (optinData.optinSourceId) {
        return optinService.updateOptinData(req.body, optinData)
      } else {
        return optinService.addOptinData(req.body, optinData)
      }
    })
    .then(data => {
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: data })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = { addUpdateOptinData }
