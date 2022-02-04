// const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
// const __db = require('../../../lib/db')
const __util = require('../../../lib/util')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const ValidatonService = require('../services/validation')
const DbServices = require('../services/dbData')
// const queryProvider = require('../queryProvider')
// const _ = require('lodash')
// const q = require('q')

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
    .then(data => {
      __logger.info(' then 1', data)
      const billingDataObj = {
        startDate: req.query.dateFrom,
        endDate: req.query.dateTill,
        wabaPhoneNumber: req.user.wabaPhoneNumber
      }
      return dbServices.billingDataCount(billingDataObj)
    })
    .then(result => {
      if (result && result.length > 0) {
        let billingDataObj = {}
        const filterData = result.reduce((resultData, itm) => {
          resultData[itm.conversationCategory] = resultData[itm.conversationCategory] + 1 || 1
          return resultData
        }, {})
        const billingDataArr = []
        for (const [key, value] of Object.entries(filterData)) {
          billingDataObj = {
            conversationCategory: key, conversationCategoryCount: value
          }
          billingDataArr.push(billingDataObj)
        }
        __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: billingDataArr })
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
