const __logger = require('../../../lib/logger')
const __config = require('../../../config')
const __constants = require('../../../config/constants')
const HttpService = require('../../../lib/http_service')
const ValidatonService = require('./validation')
const q = require('q')

module.exports = (wabaPhoneNumber, wabaInformationId, userId) => {
  __logger.info('addUpdateWabNoMapping::>>>>>>>>>>>>>', wabaPhoneNumber, wabaInformationId, userId)
  const wabaNumberMappingResult = q.defer()
  this.http = new HttpService(60000)
  this.validate = new ValidatonService()
  const inputRequest = {
    wabaPhoneNumber, wabaInformationId, userId
  }
  const headers = { Authorization: __config.authTokens[0], 'User-Agent': __constants.INTERNAL_CALL_USER_AGENT }
  this.validate.wabaNoMappingInputCheck(inputRequest)
    .then(() => this.http.Post(inputRequest, 'body', __config.base_url + __constants.INTERNAL_END_POINTS.addUpdateWabNoMapping, headers))
    .then(apiRes => {
      __logger.info('addUpdateWabNoMapping api response', apiRes)
      wabaNumberMappingResult.resolve({ type: __constants.RESPONSE_MESSAGES.SUCCESS, data: {} })
    })
    .catch(err => wabaNumberMappingResult.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
  return wabaNumberMappingResult.promise
}
