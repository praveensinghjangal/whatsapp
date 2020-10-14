const __util = require('../../../lib/util')
const __logger = require('../../../lib/logger')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const __db = require('../../../lib/db')
const __constants = require('../../../config/constants')
const __config = require('../../../config')
const queryProvider = require('../queryProvider')
const RuleEngine = require('../services/ruleEngine')
const integrationService = require('../../integration/')
const request = require('request')
const q = require('q')

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
  let oldTemplateData
  const ruleEngine = new RuleEngine()
  __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getTemplateInfo(), [req.user.user_id, req.params.templateId])
    .then(result => {
      oldTemplateData = result
      // console.log('Template Data', typeof oldTemplateData[0])
      if (!oldTemplateData.length) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.TEMPLATE_NOT_FOUND, err: {}, data: {} })
      } else if (oldTemplateData && oldTemplateData[0].messageTemplateStatusId === __constants.TEMPLATE_STATUS.complete.statusCode) {
        return ruleEngine.getTemplateCompletionStatus(oldTemplateData[0])
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: ['Please ensure that the template is in complete status '], data: {} })
      }
    })
    .then((data) => {
      // console.log('Rule Engine Result', data)
      oldTemplateData = oldTemplateData[0]
      // console.log('OldTemplate Data', oldTemplateData)
      if (data.complete) {
        const reqBody = {
          firstLocalizationNewStatusId: __constants.TEMPLATE_STATUS.requested.statusCode,
          firstLocalizationOldStatusId: oldTemplateData ? oldTemplateData.firstLocalizationStatusId : __constants.TEMPLATE_STATUS.complete.statusCode,
          firstLocalizationRejectionReason: oldTemplateData.firstLocalizationRejectionReason ? oldTemplateData.firstLocalizationRejectionReason : '',
          secondLocalizationNewStatusId: __constants.TEMPLATE_STATUS.requested.statusCode,
          secondLocalizationOldStatusId: oldTemplateData.secondLocalizationStatusId ? oldTemplateData.secondLocalizationStatusId : __constants.TEMPLATE_STATUS.complete.statusCode,
          secondLocalizationRejectionReason: oldTemplateData.secondLocalizationRejectionReason ? oldTemplateData.secondLocalizationRejectionReason : '',
          userId: req.user ? req.user.user_id : null,
          messageTemplateId: req.params ? req.params.templateId : null
        }
        // console.log('Reqbody', reqBody)
        return updateTemplateStatus(reqBody, req.headers.authorization)
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: data.err, data: {} })
      }
    })
    .then(data => {
      // console.log('After Updation Result', data)
      __util.send(res, data)
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
    call status engine (oldStatusID,newStatusId<requested>)
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
  const ruleEngine = new RuleEngine()
  let oldTemplateData
  const reqBody = {
    firstLocalizationNewStatusId: '',
    firstLocalizationOldStatusId: '',
    firstLocalizationRejectionReason: '',
    secondLocalizationNewStatusId: '',
    secondLocalizationOldStatusId: '',
    secondLocalizationRejectionReason: '',
    userId: req.user.user_id,
    messageTemplateId: req.params ? req.params.templateId : null
  }
  const templateService = new integrationService.Template(req.user.providerId)
  const evaluationResponse = req.params.evaluationResponse
  console.log('Evaluation Response', evaluationResponse)
  if (evaluationResponse.toLowerCase() === __constants.TEMPLATE_STATUS.approved.displayName.toLowerCase()) {
    reqBody.firstLocalizationNewStatusId = __constants.TEMPLATE_STATUS.approved.statusCode
    reqBody.secondLocalizationNewStatusId = __constants.TEMPLATE_STATUS.approved.statusCode
    reqBody.firstLocalizationOldStatusId = __constants.TEMPLATE_STATUS.submitted.statusCode
    reqBody.secondLocalizationOldStatusId = __constants.TEMPLATE_STATUS.submitted.statusCode
  }
  if (evaluationResponse.toLowerCase() === __constants.TEMPLATE_STATUS.rejected.displayName.toLowerCase()) {
    reqBody.firstLocalizationNewStatusId = __constants.TEMPLATE_STATUS.rejected.statusCode
    reqBody.secondLocalizationNewStatusId = __constants.TEMPLATE_STATUS.rejected.statusCode
    reqBody.firstLocalizationOldStatusId = __constants.TEMPLATE_STATUS.requested.statusCode
    reqBody.secondLocalizationOldStatusId = __constants.TEMPLATE_STATUS.requested.statusCode
    reqBody.firstLocalizationRejectionReason = req.body ? req.body.firstLocalizationRejectionReason : ''
    reqBody.secondLocalizationRejectionReason = req.body ? req.body.secondLocalizationRejectionReason : ''
  }
  __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getTemplateInfo(), [req.user.user_id, req.params.templateId])
    .then(result => {
      oldTemplateData = result
      if (!oldTemplateData.length) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.TEMPLATE_NOT_FOUND, err: {}, data: {} })
      } else if (oldTemplateData) {
        return updateTemplateStatus(reqBody, req.headers.authorization)
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: ['Please ensure that the template is in complete status '], data: {} })
      }
    })
    .then(updateStatusRes => {
      console.log('updateStatusRes', updateStatusRes)
      if (updateStatusRes.code !== 2000) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: updateStatusRes.error, data: {} })
      } else {
        return ruleEngine.addTemplate(oldTemplateData[0])
      }
    })
    .then(ruleEngineRes => {
      console.log('ruleEngineRes', ruleEngineRes)
      if (ruleEngineRes.code !== 2000) return true
      return templateService.addTemplate(oldTemplateData[0])
    })
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: {} }))
    .catch(err => {
      __logger.error('error sendTemplateForApproval: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

const updateTemplateStatus = (reqBody, authToken) => {
  console.log('Auth', authToken)
  const apiCalled = q.defer()
  const url = __config.base_url + __constants.INTERNAL_END_POINTS.updateTemplateStatus + `${reqBody.messageTemplateId}` + '/status'
  __logger.info('updateTemplateStatus :: >>>>>>>>>>>>>>>>>>>>>>>>', reqBody)
  const options = {
    url,
    body: reqBody,
    headers: { Authorization: authToken },
    json: true
  }
  // Calling another api for sending messages
  request.patch(options, (err, httpResponse, body) => {
    if (err) {
      return apiCalled.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
    }
    return apiCalled.resolve(body)
  })
  return apiCalled.promise
}

module.exports = { sendTemplateForApproval, sendTemplateForEvaluaion }
