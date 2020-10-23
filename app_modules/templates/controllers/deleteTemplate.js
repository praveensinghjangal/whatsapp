const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const __util = require('../../../lib/util')
const __db = require('../../../lib/db')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const integrationService = require('../../../app_modules/integration/')
const queryProvider = require('../queryProvider')

const deleteTemplate = (req, res) => {
  __logger.info('Delete Template API Called', req.params)
  const wabaPhoneNumber = req.user ? req.user.wabaPhoneNumber : ''
  const templateService = new integrationService.Template(req.user.providerId)

  if (req.params && req.params.templateId) {
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.deleteTemplate(), [__constants.TEMPLATE_STATUS.deleted.statusCode, req.params.templateId])
      .then(result => {
        __logger.info('Iresult then 1', { result })
        if (result && result.affectedRows === 0) {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.TEMPLATE_DELETED, err: {}, data: {} })
        } else {
          return templateService.deleteTemplate(wabaPhoneNumber, req.params.templateId)
        }
      })
      .then(data => {
        __logger.info('Inside deleteTemplate then 2', { data })
        __db.redis.key_delete(req.params.templateId + '___' + wabaPhoneNumber)
        __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: {} })
      })
      .catch(err => {
        __logger.error('error in delete template: ', err)
        return __util.send(res, { type: err.type, err: err.err })
      })
  } else {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: ['templateId is required'] })
  }
}

module.exports = {
  deleteTemplate
}
