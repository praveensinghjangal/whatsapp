
const q = require('q')
const HttpService = require('../service/httpService')
const __config = require('../../../config')
// const tyntectConfig = __config.integration.tyntec
const __constants = require('../../../config/constants')
// const RedisService = require('../../../lib/redis_service/redisService')
const __logger = require('../../../lib/logger')
// const rejectionHandler = require('../../../lib/util/rejectionHandler')
const IntegrationService = require('..')
const _ = require('lodash')
const getStatusMapping = require('../service/getStatusMapping')
const AuthService = require('../facebook/authService')

class InternalFunctions {
  setTheMappingOfMessageData (templateData, whatsAppAccountId) {
    console.log('dsfsdfsfgdgsdghsdg', templateData)
    const finalData = []
    __logger.info('integration :: get template list data', templateData, templateData.data)
    if (templateData.data && templateData.data[0]) {
      const dataGroupedByName = _.chain(templateData.data)
        .groupBy('name')
        .map((value, key) => ({ name: key, users: value }))
        .value()
      dataGroupedByName.map((val, t) => {
        console.log('vallll', val, t)
        const localization = []
        dataGroupedByName[t].users.map((user) => {
          const localizationValue = {
            status: user.status,
            rejectionReason: user.rejected_reason,
            language: user.language,
            components: _.cloneDeep(user.components),
            createdAt: user.last_updated_time,
            lastUpdated: user.last_updated_time,
            qualityScore: _.cloneDeep(user.quality_score)
          }
          localization.push(localizationValue)
        })
        finalData.push({ whatsAppAccountId: whatsAppAccountId, templateName: val.users[0].name, category: val.users[0].category, templateId: val.users[0].name, localizations: localization })
      })
      console.log('--------------->', finalData)
      return finalData
    } else {
      return []
    }
  }
}

class Template {
  constructor (maxConcurrent, userId) {
    this.userId = userId
    this.http = new HttpService(60000)
  }

  getTemplateList (wabaNumber) {
    const deferred = q.defer()
    let whatsAppAccountId
    if (wabaNumber) {
      const authService = new AuthService(this.userId)
      authService.getFaceBookTokensByWabaNumber(wabaNumber)
      // const authService = new IntegrationService.Authentication(__config.service_provider_id.facebook, this.userId)
      // authService.getFaceBookTokensByWabaNumber(wabaNumber)
        .then(data => {
          __logger.info('dataatatatat', { data }, typeof data)
          whatsAppAccountId = data.userAccountIdByProvider
          let url = `${__constants.FACEBOOK_BASEURL}${__constants.FACEBOOK_ENDPOINTS.getTemplateList}${data.graphApiKey}`
          url = url.split(':userAccountIdByProvider').join(data.userAccountIdByProvider || '')
          __logger.info('URL====###########################', url)
          return this.http.Get(url, {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          })
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

  getTemplateInfo (wabaNumber, templateId) {
    __logger.info(wabaNumber, templateId)
    const deferred = q.defer()
    let isData = false
    let tempData = {}
    let whatsAppAccountId
    if (wabaNumber && templateId) {
      const authService = new AuthService(this.userId)
      authService.getFaceBookTokensByWabaNumber(wabaNumber)
        .then(data => {
          whatsAppAccountId = data.userAccountIdByProvider
          __logger.info('dataatatatat', { data }, typeof data)
          let url = `${__constants.FACEBOOK_BASEURL}${__constants.FACEBOOK_ENDPOINTS.getTemplateList}${data.graphApiKey}&name=${templateId}`
          url = url.split(':userAccountIdByProvider').join(data.userAccountIdByProvider || '')
          const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          }
          return this.http.Get(url, headers)
        })
        .then(templateData => {
          __logger.info('integration :: get template info data', { templateData })
          var dataAfterExactStringMatch = _.find(templateData.data, { name: templateId })
          const exactStringMatch = []
          exactStringMatch.push(dataAfterExactStringMatch)
          templateData.data = exactStringMatch
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
          if (templateData) {
            return deferred.resolve({ ...__constants.RESPONSE_MESSAGES.SUCCESS, data: templateData })
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

  mapStatusOfAllLocalization (localizationArray) {
    let p = q()
    const thePromises = []
    localizationArray.forEach(singleObject => {
      p = p.then(() => getStatusMapping(singleObject.status, 'a4f03720-3a33-4b94-b88a-e10453492183'))
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
          let deleteUrl = `${__constants.FACEBOOK_BASEURL}${__constants.FACEBOOK_ENDPOINTS.deleteTemplate}${data.graphApiKey}&name=${templateId}`
          deleteUrl = deleteUrl.split(':userAccountIdByProvider').join(data.userAccountIdByProvider || '')
          return this.http.Delete(deleteUrl, headers)
        })
        .then(templateData => {
          __logger.info('deleteTemplate::Tyntec response =======?>', { wabaNumber, templateId })
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
}
module.exports = Template
