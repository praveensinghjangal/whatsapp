const DbService = require('../../app_modules/message/services/dbData')
const __constants = require('../../config/constants')
const q = require('q')

const getTemplateNameAgainstId = (templateId) => {
    const getTemplateNameAgainstId = q.defer()
    const dbService = new DbService()
    dbService.getTemplateNameAgainstId(templateId)
      .then((data) => {
        if (data && data.length && data.templateName) {
          return getTemplateNameAgainstId.resolve(data.templateName)
        } else {
          return getTemplateNameAgainstId.resolve(null)
        }
      })
      .catch((err) => {
        return getTemplateNameAgainstId.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
      })
    return getTemplateNameAgainstId.promise
  }



module.exports = { getTemplateNameAgainstId }