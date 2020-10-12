const __util = require('../../../lib/util')
const __logger = require('../../../lib/logger')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const __db = require('../../../lib/db')
const __constants = require('../../../config/constants')
const queryProvider = require('../queryProvider')
const RuleEngine = require('../services/ruleEngine')
const integrationService = require('../../integration/')

/*
    param  -> tid
    get data from db (tid) --> dbdata dbdata langcode and 2ndlang code
    check status =  complete
    call rule engine with dbdata
    call status engine (oldStatusID,newStatusId<requested>)
    res.send
    */

const sendTemplateForApproval = (req, res) => {
  __logger.info('sendTemplateForApproval API called')
  const ruleEngine = new RuleEngine()
  __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getTemplateInfo(), [req.user.user_id, req.params.templateId])
    .then(result => {
      if (result.messageTemplateStatusId === __constants.TEMPLATE_STATUS.complete) {
        return ruleEngine.getTemplateCompletionStatus(result)
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: ['Please ensure that the template is in complete status '], data: {} })
      }
    })
    .then((data) => {
      console.log('Rule Engine Result', data)
      if (data.complete) {
        /* Function call to update the template status */
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: ['Please ensure that the template is in complete status '], data: {} })
      }
    })
    .catch(err => {
      __logger.error('error sendTemplateForApproval: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

/*
    <<</:templateId/evaluate>>>
    param  -> tid, evaluationResponse [approved,rejected],body -> if reject then rejectReason
    get data from db (tid) --> dbdata langcode and 2ndlang code

    check status =  requested
    if flag rejected then create input for status engine as (olfStatusId,newStatusID<rejected>,rejectReason)
    else if flag approved create input for status engine as (olfStatusId,newStatusID<submitted>)
    call status engine (oldStatusID,newStatusId<requested>)
    if new status = submitted call rule engine (dbdata) if status != submitted return true
    if new status = submitted call integration (dbdata)
    res.send
*/

const sendTemplateForEvaluaion = (req, res) => {
  __logger.info('sendTemplateForEvaluaion API called')
  const ruleEngine = new RuleEngine()
  // const statusEngine = new StatusEngine()
  let oldTemplateData
  __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getTemplateInfo(), [req.user.user_id, req.params.templateId])
    .then(result => {
      oldTemplateData = result
      if (result.messageTemplateStatusId === __constants.TEMPLATE_STATUS.requested) {
        // Call tyntec api for processing
      }
    })
    .then(data => {
      if (data === __constants.TEMPLATE_STATUS.rejected) {
        // return statusEngine.updateStatus(oldTemplateData.messageTemplateStatusId, __constants.TEMPLATE_STATUS.rejected)
      } else if (data === __constants.TEMPLATE_STATUS.approved) {
        // return statusEngine.updateStatus(oldTemplateData.messageTemplateStatusId, __constants.TEMPLATE_STATUS.approved)
      } else if (data === __constants.TEMPLATE_STATUS.submitted) {
        // return statusEngine.updateStatus(oldTemplateData.messageTemplateStatusId, __constants.TEMPLATE_STATUS.submitted)
      } else {
        return true
      }
    })
    .then(data => {
      const templateService = new integrationService.Template(req.user.providerId)
      return templateService.addTemplate(data, req.user.wabaNumber)
    })
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: {} }))
    .catch(err => {
      __logger.error('error sendTemplateForApproval: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = { sendTemplateForApproval, sendTemplateForEvaluaion }
