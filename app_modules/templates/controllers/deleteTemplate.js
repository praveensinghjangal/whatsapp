const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const __util = require('../../../lib/util')
const __db = require('../../../lib/db')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const RedisService = require('../../../lib/redis_service/redisService')
const integrationService = require('../../../app_modules/integration')
const queryProvider = require('../queryProvider')

const deleteTemplate = (req, res) => {
  __logger.info('Delete Template API Called', req.params)
  const wabaPhoneNumber = req.user ? req.user.wabaPhoneNumber : ''
  const redisService = new RedisService()
  const templateService = new integrationService.Template(req.user.serviceProviderId)

  if (req.params && req.params.templateId) {
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.deleteTemplate(), [__constants.TEMPLATE_STATUS.deleted.statusCode, req.params.templateId])
      .then(result => {
        if (result && result.affectedRows === 0) {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.TEMPLATE_DELETED, err: {}, data: {} })
        } else {
          // templateService.
          redisService.key_delete(req.params.templateId + '___' + wabaPhoneNumber)
          __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: {} })
        }
      })
      .catch(err => {
        __logger.error('error in create user function: ', err)
        return __util.send(res, { type: err.type, err: err.err })
      })
  } else {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: ['templateId is required'] })
  }
}

module.exports = {
  deleteTemplate
}
