const DbService = require('../../app_modules/message/services/dbData')
const __constants = require('../../config/constants')
const q = require('q')

const getTemplateNameAgainstId = (templateId) => {
    console.log('9999999999999999999999999999999999999999999999999999999999999999999', templateId)
    const getTemplateNameAgainstId = q.defer()
    __logger.info('getTemplateNameAgainstId:')
    const dbService = new DbService()
    dbService.getTemplateNameAgainstId(templateId)
      .then(data => {
        console.log('5555555555555555555555555555555555555555555555555555555')
        if (data.templateName) {
          return getTemplateNameAgainstId.resolve({templateName:data.templateName})
        } else {
          return getTemplateNameAgainstId.resolve({templateName:null})
        }
      })
      .catch(err => {
        __logger.error('Error in getTemplateNameAgainstId :: ', err)
        return getTemplateNameAgainstId.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
      })
    return getTemplateNameAgainstId.promise
  }



module.exports = templateId => {
    const templateName = getTemplateNameAgainstId(templateId)
    console.log('temaplateId>>>>>>>>>>>>>>>>>>>>>>>>>>', templateName)
    return { templateName }
}