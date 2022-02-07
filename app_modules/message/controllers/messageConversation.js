const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __util = require('../../../lib/util')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
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
      if (result && result.length > 0) {
        const filterData = result.reduce((resultData, itm) => {
          resultData[itm.conversationCategory] = resultData[itm.conversationCategory] + 1 || 1
          return resultData
        }, {})
        const billingDataArr = []

        for (const [key, value] of Object.entries(filterData)) {
          billingDataArr.push({ conversationCategory: key, conversationCategoryCount: value })
        }

        _.each(__constants.CONVERSATION_BILLING_CATEGORY, singleStatus => {
          const filterData1 = _.find(billingDataArr, obj => {
            if (obj.conversationCategory.toLowerCase() === singleStatus.toLowerCase()) {
              return true
            }
          })
          if (!filterData1) {
            billingDataArr.push({ conversationCategory: singleStatus, stateCount: 0 })
          }
        })
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: billingDataArr })
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
      }
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = { getBillingConversationDataOnBasisOfWabaNumber }
