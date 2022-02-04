// const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const __util = require('../../../lib/util')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const ValidatonService = require('../services/validation')
const queryProvider = require('../queryProvider')
const _ = require('lodash')
const q = require('q')

/**
 * @memberof -Whatsapp-Business-Account-(WABA)-Controller-
 * @name billingDataCount
 * @path {GET} /business/billingconversationcount
 * @description Bussiness Logic :- Gets list of billing conversation and its count on the basis of conversationCategory.
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @code {200} if the msg is success than return Gets list of billing conversation and its count on the basis of conversationCategory.
 */

// Get Business Category

const billingDataCount = (billingData) => {
  const billingConversation = q.defer()
  const queryParam = []
  _.each(billingData, (val) => queryParam.push(val))
  __db.mysqlMis.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.getDataOnBasisOfWabaNumberFromBillingCoversation(), queryParam)
    .then(result => {
      if (result) {
        billingConversation.resolve(result)
      } else {
        billingConversation.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
      }
    })
    .catch(err => {
      billingConversation.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
    })
  return billingConversation.promise
}

const getBillingConversationDataOnBasisOfWabaNumber = (req, res) => {
  const validate = new ValidatonService()
  validate.billingConversation(req.query)
    .then(data => {
      __logger.info(' then 1', data)
      const billingDataObj = {
        startDate: req.query.dateFrom,
        endDate: req.query.dateTill,
        wabaPhoneNumber: req.user.wabaPhoneNumber
      }
      return billingDataCount(billingDataObj)
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
