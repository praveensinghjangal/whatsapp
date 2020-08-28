const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const DbServices = require('../services/dbData')
const ValidatonService = require('../services/validation')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const dbServices = new DbServices()
const validate = new ValidatonService()

module.exports = (req, res) => {
  __logger.info('deactivateFlowbyflowId::get identifier called', req.body)
  __logger.info(req.body.auotMessageFlowId)
  validate.deleteFlowData(req.body)
    .then(isvalid => dbServices.getFlowDataByFlowId(req.body.auotMessageFlowId))
    .then(flowData => {
      if (!flowData.detailsFound) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
      }
      __logger.info('deactivateFlow:: Flow data found in db', flowData)
      return dbServices.deleteFlow(req.body.auotMessageFlowId)
    })
    .then(deleteResponse => {
      __logger.info('deactivateFlow1::got deactivate response from db', deleteResponse)
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, dbData: deleteResponse })
    })
    .catch(err => {
      __logger.error('error::getCancelonIdentifiers : ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}
