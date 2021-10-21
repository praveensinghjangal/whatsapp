
const q = require('q')
const HttpService = require('../service/httpService')
const __config = require('../../../config')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const IntegrationService = require('..')
const _ = require('lodash')
const getStatusMapping = require('../service/getStatusMapping')
const AuthService = require('../facebook/authService')
const DataMapper = require('./dataMapper')

class InternalFunctions {
  setTheMappingOfMessageData (templateData, whatsAppAccountId) {
    const finalData = []
    __logger.info('integration :: get template list data', templateData, templateData.data)
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
      return []
    }
  }
}

class Template {
  constructor (maxConcurrent, userId) {
    this.userId = userId
    this.http = new HttpService(60000, maxConcurrent, userId)
    this.dataMapper = new DataMapper()
  }

  getTemplateList (wabaNumber) {
    const deferred = q.defer()
    let whatsAppAccountId
    if (wabaNumber) {
      const authService = new AuthService(this.userId)
      authService.getFaceBookTokensByWabaNumber(wabaNumber)
        .then(data => {
          whatsAppAccountId = data.userAccountIdByProvider
          let url = `${__constants.FACEBOOK_GRAPHURL}${__constants.FACEBOOK_ENDPOINTS.getTemplateList}${data.graphApiKey}`
          url = url.split(':userAccountIdByProvider').join(data.userAccountIdByProvider || '')
          __logger.info('URL >>>>>>>>>>>>>>> __constants.FACEBOOK_ENDPOINTS.getTemplateList', url)
          return this.http.Get(url, {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          }, data.serviceProviderId)
        })
        .then((templateData) => {
          if (templateData) {
            const internalFunctions = new InternalFunctions()
            const data = internalFunctions.setTheMappingOfMessageData(templateData, whatsAppAccountId)
            return deferred.resolve({ ...__constants.RESPONSE_MESSAGES.SUCCESS, data: data })
          } else {
            return deferred.reject({ ...__constants.RESPONSE_MESSAGES.NOT_FOUND, data: {} })
          }
        })
        .catch(err => deferred.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
      return deferred.promise
    } else {
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
          console.log('herererererer', url)
          const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          }
          return this.http.Get(url, headers, data.serviceProviderId)
        })
        .then(templateData => {
          __logger.info('integration :: get template info data', { templateData })
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
          __logger.info('integration :: get template info data after mapping', { templateData })
          if (isData) {
            tempData.localizations = templateData
            templateData = tempData
          }
          return deferred.resolve({ ...__constants.RESPONSE_MESSAGES.SUCCESS, data: [] })
        })
        .catch(err => deferred.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
      return deferred.promise
    } else {
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
        .catch(err => err)
      thePromises.push(p)
    })
    return q.all(thePromises)
  }

  deleteTemplate (wabaNumber, templateId) {
    __logger.info('deleteTemplate::Template Service >>>>>>>>>>>>>>>>>>>>>>>>>>', { wabaNumber, templateId })
    const deferred = q.defer()
    if (wabaNumber && templateId) {
      const authService = new IntegrationService.Authentication(__config.service_provider_id.facebook, this.userId)
      authService.getFaceBookTokensByWabaNumber(wabaNumber)
        .then(data => {
          __logger.info('deleteTemplate::getWabaDataByPhoneNumber >>>>>>>>>>>>', { data, typeof: typeof data })
          const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          }
          let deleteUrl = `${__constants.FACEBOOK_GRAPHURL}${__constants.FACEBOOK_ENDPOINTS.deleteTemplate}${data.graphApiKey}&name=${templateId}`
          deleteUrl = deleteUrl.split(':userAccountIdByProvider').join(data.userAccountIdByProvider || '')
          return this.http.Delete(deleteUrl, headers, data.serviceProviderId)
        })
        .then(templateData => {
          __logger.info('deleteTemplate::facebook response =======?>', { wabaNumber, templateId })
          if (templateData) {
            return deferred.resolve({ type: __constants.RESPONSE_MESSAGES.TEMPLATE_SENT_FOR_DELETION, data: {} })
          } else {
            return deferred.reject({ type: __constants.RESPONSE_MESSAGES.TEMPLATE_DELETION_ERROR, err: {}, data: {} })
          }
        })
        .catch(err => deferred.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
      return deferred.promise
    } else {
      __logger.info('deleteTemplate::No waba and templateId =======?>', { wabaNumber, templateId })
      deferred.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: {} })
      return deferred.promise
    }
  }

  // when this service will be called we will call waba to get phone number to use here in redis
  addTemplate (templateData, wabaNumber) {
    __logger.info('facebook addTemplate ::>>>>>>>>>>>>>>>>>>>>> ', templateData)
    const deferred = q.defer()
    let url = __constants.FACEBOOK_GRAPHURL + __constants.FACEBOOK_GRAPHURL_VERSION + '/'
    let headers = {}
    let fbRequestbody = []
    const authService = new AuthService(this.userId)
    authService.getFaceBookTokensByWabaNumber(wabaNumber)
      .then(data => {
        url = url + data.userAccountIdByProvider + __constants.FACEBOOK_ENDPOINTS.addTemplate
        headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.apiKey}`
        }
        return this.dataMapper.addTemplate(templateData)
      })
      .then(reqBody => {
        fbRequestbody = reqBody
        return this.http.Post(fbRequestbody[0], 'body', url, headers, __config.service_provider_id.facebook)
      })
      .then(reqBody => {
        return this.http.Post(fbRequestbody[1], 'body', url, headers, __config.service_provider_id.facebook)
      })
      .then(data => {
        __logger.info('integration :: Add template data', { data })
        if (data && data.id) {
          deferred.resolve({ type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { id: data.id } })
        } else {
          return deferred.reject({ type: __constants.RESPONSE_MESSAGES.ERROR_CALLING_PROVIDER, err: data.body })
        }
      })
      .catch(err => deferred.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return deferred.promise
  }
}
module.exports = Template
