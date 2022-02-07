const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __util = require('../../../lib/util')
const ValidatonService = require('../services/validation')
const DbServices = require('../services/dbData')
const _ = require('lodash')

/**
 * @memberof -Whatsapp-message-(WABA)-Controller-
 * @name billingDataCount
 * @path {GET} /conversation/count
 * @description Bussiness Logic :- Gets list of billing conversation and its count on the basis of conversationCategory.
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @code {200} if the msg is success than return Gets list of billing conversation and its count on the basis of conversationCategory.
 */

// Get Business Category

const getBillingConversationDataOnBasisOfWabaNumber = (req, res) => {
  const dbServices = new DbServices()
  const validate = new ValidatonService()
  validate.billingConversation(req.query)
    .then(data => dbServices.billingDataCount(req.query.startDate, req.query.endDate, req.user.wabaPhoneNumber))
    .then(result => {
      _.each(__constants.CONVERSATION_BILLING_CATEGORY, singleStatus => { if (!_.find(result, obj => obj.conversationCategory.toLowerCase() === singleStatus.toLowerCase())) result.push({ conversationCategory: singleStatus, stateCount: 0 }) })
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: result })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = { getBillingConversationDataOnBasisOfWabaNumber }
