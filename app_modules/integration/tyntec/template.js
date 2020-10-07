const q = require('q')
const HttpService = require('../service/httpService')
const __config = require('../../../config')
const tyntectConfig = __config.integration.tyntec
const __constants = require('../../../config/constants')
const RedisService = require('../../../lib/redis_service/redisService')
const DataMapper = require('./dataMapper')
const __logger = require('../../../lib/logger')

class Template {
  constructor () {
    this.http = new HttpService(60000)
    this.dataMapper = new DataMapper()
  }

  // when this service will be called we will call waba to get phone number to use here in redis
  addTemplate (templateData, wabaNumber) {
    const deferred = q.defer()
    let url = tyntectConfig.baseUrl + __constants.TYNTEC_ENDPOINTS.addTemplate
    let headers = {}
    let spId = ''
    const redisService = new RedisService()
    redisService.getWabaDataByPhoneNumber(wabaNumber)
      .then(data => {
        console.log('dataatatatat', data, typeof data)
        url = url.split(':accountId').join(data.userAccountIdByProvider || '')
        headers = {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          apikey: data.apiKey
        }
        spId = data.serviceProviderId
        return this.dataMapper.addTemplate(templateData)
      })
      .then(reqBody => this.http.Post(reqBody, 'body', url, headers, spId))
      .then(data => {
        // console.log('add responseeeeeeeeeeeeeeeeeeeeeeeeeeeee', data, data.statusCode, JSON.stringify(data.body))
        __logger.info('integration :: Add template data', data)
        if (data && data.statusCode === 201) {
          deferred.resolve({ type: __constants.RESPONSE_MESSAGES.SUCCESS, data: {} })
        } else {
          return deferred.reject({ type: __constants.RESPONSE_MESSAGES.ERROR_CALLING_PROVIDER, err: data.body })
        }
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
          __logger.info('integration :: get template list data', templateData)
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
          __logger.info('integration :: get template info data', templateData)
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
