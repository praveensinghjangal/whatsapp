const __util = require('../../../lib/util')
const __logger = require('../../../lib/logger')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const __constants = require('../../../config/constants')
const __config = require('../../../config')
const RuleEngine = require('../services/ruleEngine')
const integrationService = require('../../integration/')
const TemplateService = require('../services/dbData')
const StatusService = require('../../templates/services/status')
const ValidatonService = require('../services/validation')
const request = require('request')
const q = require('q')
// const userService = require('../../user/controllers/accoutProfile')

const updateTemplateStatus = (reqBody, authToken) => {
  __logger.info('updateTemplateStatus called ::>>>>>>>>>>>>>>>>>.')
  const apiCalled = q.defer()
  const url = __config.base_url + __constants.INTERNAL_END_POINTS.updateTemplateStatus + `${reqBody.messageTemplateId}` + '/status'
  __logger.info('updateTemplateStatus :: >>>>>>>>>>>>>>>>>>>>>>>>', reqBody)
  const options = {
    url,
    body: reqBody,
    headers: { Authorization: authToken, 'User-Agent': __constants.INTERNAL_CALL_USER_AGENT },
    json: true
  }
  // Calling another api for sending messages
  request.patch(options, (err, httpResponse, body) => {
    if (err) {
      __logger.info('updateTemplateStatus :: error>>>>>>>>>>>>>>>>>>>>>>>>', err)
      return apiCalled.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
    }
    return apiCalled.resolve(body)
  })
  return apiCalled.promise
}

const sendForApproval = (msgsTemplateId, authToken, userId) => {
  __logger.info('sendForApproval called ::>>>>>>>>>>>>>>>>>.', userId, msgsTemplateId)
  const apiCalled = q.defer()
  const url = __config.base_url + __constants.INTERNAL_END_POINTS.sendTemplateApproval + `${msgsTemplateId}` + '/submit/approved'
  __logger.info('sendForApproval :: >>>>>>>>>>>>>>>>>>>>>>>>', url)
  const options = {
    url,
    body: { userId },
    headers: { Authorization: authToken, 'User-Agent': __constants.INTERNAL_CALL_USER_AGENT },
    json: true
  }
  // Calling another api for sending messages
  request.patch(options, (err, httpResponse, body) => {
    if (err) {
      __logger.info('sendForApproval :: error>>>>>>>>>>>>>>>>>>>>>>>>', err)
      return apiCalled.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
    }
    return apiCalled.resolve(body)
  })
  return apiCalled.promise
}

/*
    param  -> tid
    get data from db (tid) --> dbdata dbdata langcode and 2ndlang code
    check status =  complete
    call rule engine with dbdata
    call status engine (oldStatusID,newStatusId<requested>)
    res.send
    */

const sendTemplateForApproval = (req, res) => {
  __logger.info('sendTemplateForApproval API called', req.params)
  const userId = req.user ? req.user.user_id : ''
  const templateId = req.params ? req.params.templateId : null
  let oldTemplateData
  let reqBody
  const ruleEngine = new RuleEngine()
  const templateService = new TemplateService()
  templateService.getTemplateInfo(userId, templateId)
    .then(result => {
      oldTemplateData = result
      __logger.info('Template data then 1', { oldTemplateData })
      if (oldTemplateData && oldTemplateData.messageTemplateStatusId === __constants.TEMPLATE_STATUS.complete.statusCode) {
        return ruleEngine.getTemplateCompletionStatus(oldTemplateData)
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: ['Please ensure that the template is in complete status '], data: {} })
      }
    })
    .then((ruleEngineResponse) => {
      __logger.info('Rule Engine Result', ruleEngineResponse)
      if (ruleEngineResponse && ruleEngineResponse.complete) {
        reqBody = {
          firstLocalizationNewStatusId: __constants.TEMPLATE_STATUS.requested.statusCode,
          firstLocalizationOldStatusId: oldTemplateData ? oldTemplateData.firstLocalizationStatusId : __constants.TEMPLATE_STATUS.complete.statusCode,
          firstLocalizationRejectionReason: oldTemplateData.firstLocalizationRejectionReason ? oldTemplateData.firstLocalizationRejectionReason : null,
          secondLocalizationNewStatusId: oldTemplateData.secondLanguageRequired ? __constants.TEMPLATE_STATUS.requested.statusCode : null,
          secondLocalizationOldStatusId: oldTemplateData.secondLanguageRequired && oldTemplateData.secondLocalizationStatusId ? oldTemplateData.secondLocalizationStatusId : null,
          secondLocalizationRejectionReason: oldTemplateData.secondLanguageRequired && oldTemplateData.secondLocalizationRejectionReason ? oldTemplateData.secondLocalizationRejectionReason : null,
          userId: req.user ? req.user.user_id : null,
          messageTemplateId: req.params ? req.params.templateId : null
        }
        return updateTemplateStatus(reqBody, req.headers.authorization)
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: ruleEngineResponse.err, data: ruleEngineResponse })
      }
    })
    .then(data => {
      __logger.info('sendForApproval result then 4', { data })
      return sendForApproval(reqBody.messageTemplateId, req.headers.authorization, userId)
    })
    .then(data => {
      // __logger.info('updateTemplateStatus result then 5', { data })
      // userService.getUserRoleArrayDataForEmail()
      //   .then(userRoleData => {
      //     const statusService = new StatusService()
      //     statusService.notifySupport(userId, oldTemplateData.templateName, userRoleData)
      //   })
      res.send(data)
    })
    .catch(err => {
      __logger.error('error sendTemplateForApproval: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

/*
    <<</:templateId/evaluate/:evaluationResponse>>>
    param  -> tid, evaluationResponse [approved,rejected],body -> if reject then rejectReason
    get data from db (tid) --> dbdata langcode and 2ndlang code
    check status =  requested
    if flag rejected then create input for status engine as (olfStatusId,newStatusID<rejected>,rejectReason)
    else if flag approved create input for status engine as (olfStatusId,newStatusID<submitted>)
    call update status(req)
    .then(updateStatusRes => {
      if status != submitted return true
      return rule engine (dbdata)
    })
    then(ruleEngineRes => {
      if status != submitted return true
      return integration.add (dbdata)
    })
    .then(intRes => res.send (success:data:{}))
*/

const sendTemplateForEvaluaion = (req, res) => {
  __logger.info('sendTemplateForEvaluaion API called', req.user)
  const callerUserId = req.user && req.user.user_id ? req.user.user_id : null
  const userId = (req.endUserConfig && req.endUserConfig.accountId) ? req.endUserConfig.accountId : null
  const templateId = req.params ? req.params.templateId : null
  let templateService
  const ruleEngine = new RuleEngine()
  const templateDbService = new TemplateService()
  let oldTemplateData
  const reqBody = {
    firstLocalizationNewStatusId: '',
    firstLocalizationOldStatusId: '',
    firstLocalizationRejectionReason: '',
    secondLocalizationNewStatusId: null,
    secondLocalizationOldStatusId: null,
    secondLocalizationRejectionReason: null,
    userId: userId,
    messageTemplateId: req.params ? req.params.templateId : null,
    callerUserId: callerUserId
  }
  const evaluationResponse = req.params ? req.params.evaluationResponse.toLowerCase() : ''
  const validate = new ValidatonService()
  validate.templateApproval(req.body)
    .then(result => {
      if (!__constants.TEMPLATE_EVALUATION_RESPONSE.includes(evaluationResponse)) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: {}, data: {} })
      } else {
        templateService = new integrationService.Template(req.endUserConfig.serviceProviderId, req.endUserConfig.maxTpsToProvider, userId)
        if (req.endUserConfig && req.endUserConfig.serviceProviderId) {
          return templateDbService.getTemplateInfo(userId, templateId)
        } else {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.SERVICE_PROVIDER_NOT_PRESENT, err: {}, data: {} })
        }
      }
    })
    .then(result => {
      oldTemplateData = result
      if (oldTemplateData) {
        // Approved
        if (__constants.TEMPLATE_EVALUATION_RESPONSE[0] === evaluationResponse.toLowerCase()) {
          reqBody.firstLocalizationNewStatusId = __constants.TEMPLATE_STATUS.submitted.statusCode
          reqBody.firstLocalizationOldStatusId = oldTemplateData.firstLocalizationStatusId ? oldTemplateData.firstLocalizationStatusId : null
        }
        // Second Translation Required and template is approved
        if (__constants.TEMPLATE_EVALUATION_RESPONSE[0] === evaluationResponse.toLowerCase() && oldTemplateData.secondLanguageRequired) {
          reqBody.secondLocalizationNewStatusId = __constants.TEMPLATE_STATUS.submitted.statusCode
          reqBody.secondLocalizationOldStatusId = oldTemplateData.secondLocalizationStatusId ? oldTemplateData.secondLocalizationStatusId : null
        }
        // Rejected
        if (__constants.TEMPLATE_EVALUATION_RESPONSE[1] === evaluationResponse.toLowerCase()) {
          reqBody.firstLocalizationNewStatusId = __constants.TEMPLATE_STATUS.rejected.statusCode
          reqBody.firstLocalizationOldStatusId = oldTemplateData.firstLocalizationStatusId ? oldTemplateData.firstLocalizationStatusId : null
          reqBody.firstLocalizationRejectionReason = req.body ? req.body.firstLocalizationRejectionReason : null
        }
        // Second Translation Required and template is rejected
        if (__constants.TEMPLATE_EVALUATION_RESPONSE[1] === evaluationResponse.toLowerCase() && oldTemplateData.secondLanguageRequired) {
          reqBody.secondLocalizationNewStatusId = __constants.TEMPLATE_STATUS.rejected.statusCode
          reqBody.secondLocalizationOldStatusId = oldTemplateData.secondLocalizationStatusId ? oldTemplateData.secondLocalizationStatusId : null
          reqBody.secondLocalizationRejectionReason = req.body ? req.body.secondLocalizationRejectionReason : null
        }
        Object.keys(reqBody).forEach((key) => (reqBody[key] == null) && delete reqBody[key])
        return updateTemplateStatus(reqBody, req.endUserConfig.authToken)
      }
    })
    .then(updateStatusRes => {
      __logger.info('updateStatusRes', updateStatusRes)
      if (updateStatusRes.code !== 2000) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: updateStatusRes.error, data: {} })
      }
      // need to changes here
      if (reqBody.firstLocalizationNewStatusId === __constants.TEMPLATE_STATUS.submitted.statusCode) {
        return ruleEngine.addTemplate(oldTemplateData)
      }
      return true
    })
    .then(ruleEngineRes => {
      __logger.info('ruleEngineRes', ruleEngineRes)
      // need to change here
      if (reqBody.firstLocalizationNewStatusId === __constants.TEMPLATE_STATUS.submitted.statusCode) {
        return templateService.addTemplate(oldTemplateData, req.endUserConfig.wabaPhoneNumber)
      }
      return true
    })
    .then(data => {
      __logger.info('oldTemplateData>>>>>>>>>', oldTemplateData)

      const statusService = new StatusService()
      if (oldTemplateData && oldTemplateData.templateName) {
        const notifyStatusData = {
          secondLanguageRequired: oldTemplateData.secondLanguageRequired ? oldTemplateData.secondLanguageRequired : null,
          firstLocalizationStatus: reqBody.firstLocalizationNewStatusId ? statusService.getTemplateStatusName(reqBody.firstLocalizationNewStatusId) : null,
          secondLocalizationStatus: reqBody.secondLocalizationNewStatusId ? statusService.getTemplateStatusName(reqBody.secondLocalizationNewStatusId) : null,
          firstLocalizationRejectionReason: reqBody.firstLocalizationRejectionReason ? reqBody.firstLocalizationRejectionReason : null,
          secondLocalizationRejectionReason: reqBody.secondLocalizationRejectionReason ? reqBody.secondLocalizationRejectionReason : null
        }

        __logger.info('notifyStatusData>>>>>>>>>>>>>.', notifyStatusData)
        statusService.notify(userId, notifyStatusData, oldTemplateData.templateName)
      }
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { messageTemplateStatusId: __constants.TEMPLATE_STATUS.submitted.statusCode, statusName: __constants.TEMPLATE_STATUS.submitted.displayName } })
    })
    .catch(err => {
      __logger.error('error sendTemplateForEvaluaion: ', err)
      // if tyntec call is failed roll back status to requested
      if (err && err.type && err.type.code && (err.type.code === 5005 || err.type.code === 4031)) {
        const statusService = new StatusService()
        statusService.rollBackStatusService(userId, templateId, '', callerUserId)
          .then(isRollBacked => {
            return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
          })
          .catch(err => {
            return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
          })
      } else {
        return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      }
    })
}

module.exports = { sendTemplateForApproval, sendTemplateForEvaluaion }
