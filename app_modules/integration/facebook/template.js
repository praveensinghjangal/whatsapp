
const q = require('q')
const HttpService = require('../service/httpService')
const __config = require('../../../config')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const _ = require('lodash')
const getStatusMapping = require('../service/getStatusMapping')
const AuthService = require('../facebook/authService').Authentication
const DataMapper = require('./dataMapper')

class InternalFunctions {
  constructor (maxConcurrent, userId) {
    this.http = new HttpService(60000, maxConcurrent, userId)
  }

  setTheMappingOfMessageData (templateData, whatsAppAccountId) {
    const finalData = []
    __logger.info('fb: template: setTheMappingOfMessageData():', templateData, templateData.data)
    if (templateData.data && templateData.data[0]) {
      const dataGroupedByName = _.chain(templateData.data)
        .groupBy('name')
        .map((value, key) => ({ name: key, users: value }))
        .value()
      dataGroupedByName.map((val, t) => {
        const localization = []
        dataGroupedByName[t].users.map((user) => {
          const localizationValue = {
            status: user.status,
            rejectionReason: user.rejected_reason,
            language: user.language,
            components: user.components,
            createdAt: user.last_updated_time,
            lastUpdated: user.last_updated_time,
            qualityScore: user.quality_score
          }
          localization.push(localizationValue)
        })
        finalData.push({ whatsAppAccountId: whatsAppAccountId, templateName: val.users[0].name, category: val.users[0].category, templateId: val.users[0].name, localizations: localization })
      })
      return finalData
    } else {
      __logger.error('fb: template: setTheMappingOfMessageData(): if/else: templateData not found.')
      return []
    }
  }

  getTemplateList (tokenData) {
    const deferred = q.defer()
    let url = `${__constants.FACEBOOK_GRAPHURL}${__constants.FACEBOOK_ENDPOINTS.getTemplateList}${tokenData.graphApiKey}`
    let outData = {}
    url = url.split(':userAccountIdByProvider').join(tokenData.userAccountIdByProvider || '')
    __logger.info('fb: template: getTemplateList(): ', url)
    this.http.Get(url, { 'Content-Type': 'application/json', Accept: 'application/json' }, tokenData.serviceProviderId)
      .then(async data => {
        __logger.info('fb: template: getTemplateList(): HTTP GET Req Res:', data)
        outData = data
        let nextUrl = data && data.paging && data.paging.next ? data.paging.next : ''
        while (nextUrl) {
          const apiRes = await this.http.Get(nextUrl, { 'Content-Type': 'application/json', Accept: 'application/json' }, tokenData.serviceProviderId)
          if (apiRes && apiRes.data && _.isArray(apiRes.data)) outData.data.push(apiRes.data)
          nextUrl = apiRes && apiRes.paging && apiRes.paging.next ? apiRes.paging.next : ''
        }
        outData.data = outData.data.flat()
        deferred.resolve(outData)
      })
      .catch(err => {
        __logger.error('fb: template: getTemplateList(): Erro while HTTP GET Req:', err)
        deferred.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return deferred.promise
  }
}

class Template {
  constructor (maxConcurrent, userId) {
    __logger.warn('fb: template: Template Class Initiated ...')
    this.maxConcurrent = maxConcurrent
    this.userId = userId
    this.http = new HttpService(60000, maxConcurrent, userId)
    this.dataMapper = new DataMapper()
  }

  getTemplateList (wabaNumber, mapData = true) {
    const deferred = q.defer()
    const internalFunctions = new InternalFunctions(this.maxConcurrent, this.userId)
    let whatsAppAccountId
    if (wabaNumber) {
      const authService = new AuthService(this.userId)
      authService.getFaceBookTokensByWabaNumber(wabaNumber)
        .then(data => {
          whatsAppAccountId = data.userAccountIdByProvider
          return internalFunctions.getTemplateList(data)
        })
        .then((templateData) => {
          if (templateData) {
            const data = mapData === true ? internalFunctions.setTheMappingOfMessageData(templateData, whatsAppAccountId) : templateData
            return deferred.resolve({ ...__constants.RESPONSE_MESSAGES.SUCCESS, data: data })
          } else {
            __logger.error('fb: template: getTemplateList(' + wabaNumber + '): then 2: if/else: templateData not found')
            return deferred.reject({ ...__constants.RESPONSE_MESSAGES.NOT_FOUND, data: {} })
          }
        })
        .catch(err => {
          __logger.error('fb: template: getTemplateList(' + wabaNumber + '): then 2: if/else: templateData not found')
          deferred.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
        })
      return deferred.promise
    } else {
      __logger.error('fb: template: getTemplateList(' + wabaNumber + '): WabaNumber doesn\'t exist')
      deferred.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, error: 'Missing wabaNumber' })
      return deferred.promise
    }
  }

  getTemplateInfo (wabaNumber, templateId, queryParams) {
    const deferred = q.defer()
    let isData = false
    let tempData = {}
    let whatsAppAccountId
    if (wabaNumber && templateId) {
      const authService = new AuthService(this.userId)
      authService.getFaceBookTokensByWabaNumber(wabaNumber)
        .then(data => {
          whatsAppAccountId = data.userAccountIdByProvider
          const obj = { ...queryParams, name: templateId }
          const qs = new URLSearchParams(obj).toString()
          // let url = `${__constants.FACEBOOK_GRAPHURL}${__constants.FACEBOOK_ENDPOINTS.getTemplateList}${data.graphApiKey}&name=${templateId}`
          let url = `${__constants.FACEBOOK_GRAPHURL}${__constants.FACEBOOK_ENDPOINTS.getTemplateList}${data.graphApiKey}&${qs}`

          url = url.split(':userAccountIdByProvider').join(data.userAccountIdByProvider || '')
          const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          }
          return this.http.Get(url, headers, __config.service_provider_id.facebook)
        })
        .then(templateData => {
          __logger.info('fb: template: getTemplateInfo(): then 2:', templateData)
          if (templateData && templateData.data && templateData.data.length > 0) {
            const dataAfterExactStringMatch = templateData.data.filter(s => s.name === templateId)
            templateData.data = dataAfterExactStringMatch
          } else {
            return deferred.resolve({ ...__constants.RESPONSE_MESSAGES.ERROR_CALLING_PROVIDER, err: templateData.error || {} })
          }
          if (templateData) {
            const internalFunctions = new InternalFunctions()
            let data = internalFunctions.setTheMappingOfMessageData(templateData, whatsAppAccountId)
            data = data[0]
            isData = true
            tempData = data
            return this.mapStatusOfAllLocalization(data.localizations || [])
          } else {
            return templateData
          }
        })
        .then(templateData => {
          __logger.info('fb: template: getTemplateInfo(): then 3:', templateData)
          if (isData) {
            tempData.localizations = templateData
            templateData = tempData
          }
          return deferred.resolve({ ...__constants.RESPONSE_MESSAGES.SUCCESS, data: templateData })
        })
        .catch(err => {
          __logger.error('fb: template: getTemplateInfo(): catch:', err)
          deferred.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
        })
      return deferred.promise
    } else {
      __logger.error('fb: template: getTemplateInfo(): if/else: WabaNumber & templateId missing....')
      deferred.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Missing' })
      return deferred.promise
    }
  }

  mapStatusOfAllLocalization (localizationArray) {
    let p = q()
    const thePromises = []
    localizationArray.forEach(singleObject => {
      p = p.then(() => getStatusMapping(singleObject.status, __config.service_provider_id.facebook))
        .then(data => {
          singleObject.messageTemplateStatusId = data.messageTemplateStatusId
          return singleObject
        })
        .catch(err => {
          __logger.error('fb: template: mapStatusOfAllLocalization(): catch:', err)
          return err
        })
      thePromises.push(p)
    })
    return q.all(thePromises)
  }

  deleteTemplate (wabaNumber, templateId) {
    __logger.info('fb: template: deleteTemplate(' + wabaNumber + '): Deleting Template ....')
    const deferred = q.defer()
    if (wabaNumber && templateId) {
      const authService = new AuthService(this.userId)
      authService.getFaceBookTokensByWabaNumber(wabaNumber)
        .then(data => {
          const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          }
          let deleteUrl = `${__constants.FACEBOOK_GRAPHURL}${__constants.FACEBOOK_ENDPOINTS.deleteTemplate}${data.graphApiKey}&name=${templateId}`
          deleteUrl = deleteUrl.split(':userAccountIdByProvider').join(data.userAccountIdByProvider || '')
          return this.http.Delete(deleteUrl, headers, data.serviceProviderId)
        })
        .then(templateData => {
          __logger.info('fb: template: deleteTemplate(' + wabaNumber + '): Response from fb:', templateData)
          if (templateData) {
            return deferred.resolve({ type: __constants.RESPONSE_MESSAGES.TEMPLATE_SENT_FOR_DELETION, data: {} })
          } else {
            __logger.error('fb: template: deleteTemplate(' + wabaNumber + '): templateData not found:')
            return deferred.reject({ type: __constants.RESPONSE_MESSAGES.TEMPLATE_DELETION_ERROR, err: {}, data: {} })
          }
        })
        .catch(err => {
          __logger.error('fb: template: deleteTemplate(' + wabaNumber + '): catch: Error while deleting template', err)
          deferred.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
        })
      return deferred.promise
    } else {
      __logger.error('fb: template: deleteTemplate(' + wabaNumber + '): catch: wabaNumber & templateId missing ....')
      deferred.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: {} })
      return deferred.promise
    }
  }

  // when this service will be called we will call waba to get phone number to use here in redis
  addTemplate (templateData, wabaNumber) {
    console.log('found th answer', templateData, wabaNumber);
    __logger.info('fb: template: addTemplate(' + wabaNumber + '): Adding template')
    const deferred = q.defer()
    let url = __constants.FACEBOOK_GRAPHURL + __constants.FACEBOOK_GRAPHURL_VERSION + '/'
    let headers = {}
    let fbRequestbody = []
    const authService = new AuthService(this.userId)
    authService.getFaceBookTokensByWabaNumber(wabaNumber)
      .then(data => {
        url = url + data.userAccountIdByProvider + __constants.FACEBOOK_ENDPOINTS.addTemplate + data.graphApiKey
        headers = {
          'Content-Type': 'application/json'
        }
        return this.dataMapper.addTemplate(templateData, data.graphApiKey)
      })
      .then(reqBody => {
        fbRequestbody = reqBody
        return this.http.Post(fbRequestbody[0], 'body', url, headers, __config.service_provider_id.facebook)
      })
      .then(reqBody => {
        if (templateData && templateData.secondLanguageRequired && fbRequestbody && fbRequestbody.length > 1 && fbRequestbody[1]) {
          return this.http.Post(fbRequestbody[1], 'body', url, headers, __config.service_provider_id.facebook)
        } else {
          return reqBody
        }
      })
      .then(data => {
        __logger.info('fb: template: addTemplate(' + wabaNumber + '): then 4:', { data: data })
        if (data && data.body && data.body.id) {
          deferred.resolve({ type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { id: data.id } })
        } else {
          __logger.error('fb: template: addTemplate(' + wabaNumber + '): if/else: data not found.')
          return deferred.reject({ type: __constants.RESPONSE_MESSAGES.ERROR_CALLING_PROVIDER, err: data.body.error || data.body })
        }
      })
      .catch(err => {
        __logger.error('fb: template: addTemplate(' + wabaNumber + '): catch:', err)
        deferred.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return deferred.promise
  }
}
module.exports = Template
