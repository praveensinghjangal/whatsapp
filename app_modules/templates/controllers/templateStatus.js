const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const ValidatonService = require('../services/validation')
const TemplateService = require('../services/dbData')

/**
 * @memberof -Template-Controller-
 * @name GetTemplateListByStatusId
 * @path {get} /templates/list/:templateStatusId
 * @description Bussiness Logic :- This API returns list of templates based on message_template_status_id.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/templates/getTemplateListByStatusId|getTemplateListByStatusId}
 * @param {string} templateStatusId =c71a8387-80e0-468b-9ee3-abb5ec328176 - Please provide valid message_template_status_id here.
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  -  In response we get array of json data consist of messageTemplateId, templateName and type in each object.
 * @code {200} if the msg is success than Returns messageTemplateId, templateName and type.
 * @author Javed Khan 22nd January, 2021
 * *** Last-Updated :- Javed Khan 22nd January, 2021 ***
 */
// Get Template List By StatusId
const getTemplateListByStatusId = (req, res) => {
  __logger.info('Inside getTemplateListByStatusId', req.params)
  const templateService = new TemplateService()
  const validate = new ValidatonService()
  validate.getTemplateList(req.params)
    .then(data => templateService.getTemplateListByStatusId(req.params.templateStatusId))
    .then(dbData => {
      __logger.info('dbData result', dbData)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: dbData })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

/**
 * @memberof -Template-Controller-
 * @name GetTemplateStatusList
 * @path {get} /templates/statusList
 * @description Bussiness Logic :- This API returns all status of message template.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/templates/getTemplateStatusList|getTemplateStatusList}
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  -  In response we get array of json data consist of messageTemplateStatusId, statusName in each object.
 * @response {array} metadata.data - Array of all the message_template_status with its message_template_status_id and status_name.
 * @code {200} if the msg is success than Returns messageTemplateStatusId and statusName.
 * @author Javed Khan 22nd January, 2021
 * *** Last-Updated :- Javed Khan 22nd January, 2021 ***
 */
// GET Template Status List
const getTemplateStatusList = (req, res) => {
  __logger.info('inside function to get template status list')
  const templateService = new TemplateService()
  templateService.getTemplateStatusList()
    .then(dbData => {
      __logger.info('db result', dbData)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: dbData })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = { getTemplateListByStatusId, getTemplateStatusList }
