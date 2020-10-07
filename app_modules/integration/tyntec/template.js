const q = require('q')
const HttpService = require('../service/httpService')
const __config = require('../../../config')
const tyntectConfig = __config.integration.tyntec
const __constants = require('../../../config/constants')
// const saveMessageApiLog = require('../service/saveMessageApiLog')
// const __constants = require('../../../config/constants')
const RedisService = require('../../../lib/redis_service/redisService')

class Template {
  constructor () {
    this.http = new HttpService(60000)
  }

  // when this service will be called we will call waba to get phone number to use here in redis
  addTemplate (templateData, wabaNumber) {
    const deferred = q.defer()
    let url = tyntectConfig.baseUrl + __constants.TYNTEC_ENDPOINTS.addTemplate
    const redisService = new RedisService()
    redisService.getWabaDataByPhoneNumber(wabaNumber)
      .then(data => {
        console.log('dataatatatat', data, typeof data)
        url = url.split(':accountId').join(data.userAccountIdByProvider || '')
        deferred.resolve({ url, templateData })
      })
      .catch(err => deferred.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return deferred.promise
  }

  getTemplateList (wabaNumber) {
    const deferred = q.defer()
    if (wabaNumber) {
      const redisService = new RedisService()
      redisService.getWabaDataByPhoneNumber(wabaNumber)
        .then(data => {
          console.log('dataatatatat', data, typeof data)
          let url = tyntectConfig.baseUrl + __constants.TYNTEC_ENDPOINTS.getTemplateList
          url = url.split(':accountId').join(data.userAccountIdByProvider || '')
          console.log('URL====', url)
          const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            apikey: data.apiKey
          }
          return this.http.Get(url, headers, data.serviceProviderId)
        })
        .then((templateData) => {
          if (templateData && templateData.constructor.name.toLowerCase() === 'array') {
            return deferred.resolve({ ...__constants.RESPONSE_MESSAGES.SUCCESS, data: templateData })
          } else if (templateData && templateData.status === 404) {
            return deferred.resolve({ ...__constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: [] })
          } else {
            return deferred.reject({ ...__constants.RESPONSE_MESSAGES.ERROR_CALLING_PROVIDER, err: templateData.title || templateData, data: {} })
          }
        })
        .catch(err => deferred.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
      return deferred.promise
    } else {
      deferred.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, error: 'Missing wabaNumber' })
      return deferred.promise
    }
  }

  getTemplateInfo (wabaNumber, templateId) {
    console.log(wabaNumber, templateId)
    const deferred = q.defer()
    if (wabaNumber && templateId) {
      const redisService = new RedisService()
      redisService.getWabaDataByPhoneNumber(wabaNumber)
        .then(data => {
          console.log('dataatatatat', data, typeof data)
          let url = tyntectConfig.baseUrl + __constants.TYNTEC_ENDPOINTS.getTemplateInfo
          url = url.split(':accountId').join(data.userAccountIdByProvider || '').split(':templateId').join(templateId || '')
          console.log('URL====', url)
          const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            apikey: data.apiKey
          }
          return this.http.Get(url, headers, data.serviceProviderId)
        })
        .then((templateData) => {
          if (templateData && templateData.constructor.name.toLowerCase() === 'object' && templateData.templateId) {
            return deferred.resolve({ ...__constants.RESPONSE_MESSAGES.SUCCESS, data: templateData })
          } else if (templateData && templateData.status === 404) {
            return deferred.resolve({ ...__constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
          } else {
            return deferred.reject({ ...__constants.RESPONSE_MESSAGES.ERROR_CALLING_PROVIDER, err: templateData.title || templateData, data: {} })
          }
        })
        .catch(err => deferred.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
      return deferred.promise
    } else {
      deferred.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Missing' })
      return deferred.promise
    }
  }
}

module.exports = Template
