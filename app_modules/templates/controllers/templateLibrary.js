const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const __util = require('../../../lib/util')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')

/**
 * @memberof -Template-Controller-
 * @name GetSampleTemplateList
 * @path {GET} /templates/sample
 * @description Bussiness Logic :- API to fetch sample template list based on filters currently accepts template name search and category id search
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
  <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/templates/getsampletemplates|GetSampleTemplateList}
 * @param {string}  templateName - Enter templateName
 * @param {string}  messageTemplateCategoryId   - Enter messageTemplateCategoryId
 * @response {string} ContentType=application/json - Response content type.
 * @response {array} metadata.data - It return the array of json with messageTemplateLibrary details
 * @code {200} if the msg is success than it Returns List of all languages
 * @author Arjun Bhole 9th June, 2020
 * *** Last-Updated :- Arjun Bhole 9th June, 2020 ***
 */

const getSampleTemplateList = (req, res) => {
  __logger.info('Get Sample Templates List API Called', req.query)

  const messageTemplateCategoryId = req.query.messageTemplateCategoryId
  const templateName = req.query.templateName

  __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getSampleTemplateList(messageTemplateCategoryId, templateName), [])
    .then(result => {
      __logger.info('Result', result)
      if (result && result.length > 0) {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: result })
      } else {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
      }
    })
    .catch(err => {
      __logger.error('error in create user function: ', err)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
    })
}

/**
 * @memberof -Template-Controller-
 * @name GetSampleTemplateInfo
 * @path {GET} /templates/sample/{templateId}
 * @description Bussiness Logic :- Get info of a sample template by template id
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
  <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/templates/getsampletemplatesinfo|GetSampleTemplateInfo}
 * @param {string}  templateId - Id of Template
 * @response {string} ContentType=application/json - Response content type.
 * @response {array} metadata.data - It return the json with messageTemplate details
 * @code {200} if the msg is success than it Returns info of a sample template
 * @author Arjun Bhole 9th June, 2020
 * *** Last-Updated :- Arjun Bhole 9th June, 2020 ***
 */

const getSampleTemplateInfo = (req, res) => {
  __logger.info('Get Sample Templates Info API Called', req.params)

  __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getSampleTemplateInfo(), [req.params.id])
    .then(result => {
      if (result && result.length > 0) {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: result })
      } else {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
      }
    })
    .catch(err => {
      __logger.error('error in create user function: ', err)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
    })
}

module.exports = { getSampleTemplateList, getSampleTemplateInfo }
