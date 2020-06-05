const q = require('q')
const ValidatonService = require('../services/validation')
const TemplateService = require('../services/dbData')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')

const addUpdateTemplates = (req, res) => {
  __logger.info('add update template API called')
  const validate = new ValidatonService()
  const templateService = new TemplateService()
  validate.addUpdateTemplate(req.body)
  templateService.getTemplateTableDataAndWabaId(req.body.messageTemplateId, req.user.user_id)
    .then(wabaAndTemplateData => {
      if (wabaAndTemplateData.messageTemplateId) {
        return templateService.updateTemplateData(req.body, wabaAndTemplateData, req.user.user_id)
      } else {
        return templateService.addTemplateData(req.body, wabaAndTemplateData, req.user.user_id)
      }
    })
    .then(data => validate.isTemplateComplete(data))
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { mediaTemplateComplete: data } }))
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = { addUpdateTemplates }
