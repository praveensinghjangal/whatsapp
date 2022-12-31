const q = require('q')
const _ = require('lodash')
const __constants = require('../../../config/constants')
const __config = require('../../../config')
const getCategoryMapping = require('../service/getCategoryMapping')
const getWabaCategoryMapping = require('../service/getWabaCategoryMapping')
const __logger = require('../../../lib/logger')
const { isArray } = require('../../../lib/util')
const ResumableApi = require('./resumableApi')
const RedisService = require('../../../lib/redis_service/redisService')
const AuthService = require('./authService').Authentication
const HttpService = require('../service/httpService')
const BusinessAccountService = require('../../whatsapp_business/services/businesAccount')
const csc = require('country-state-city').default

const getWabaDetails = (wabaNumber, userid, maxTpsToProvider, wabaInformationId, wabaDataFromRedis) => {
  const deferred = q.defer()
  __logger.info('inside getWabaDetails', { wabaNumber, wabaDataFromRedis })
  let whatsAppAccountId
  if (wabaNumber) {
    const authService = new AuthService(this.userId)
    authService.getFaceBookTokensByWabaNumber(wabaNumber)
      .then(data => {
        whatsAppAccountId = data.userAccountIdByProvider
        let url = `${__constants.FACEBOOK_GRAPHURL}${__constants.FACEBOOK_ENDPOINTS.getWaba}${data.graphApiKey}`
        url = url.split(':userAccountIdByProvider').join(whatsAppAccountId || '')
        const headers = {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
        const http = new HttpService(60000, maxTpsToProvider, userid)
        return http.Get(url, headers, __config.service_provider_id.facebook)
      })
      .then(wabaData => {
        __logger.info('integration :: get waba data', { wabaData })
        wabaDataFromRedis.namespace = wabaData.message_template_namespace
        const businessAccountService = new BusinessAccountService()
        return businessAccountService.setNamespace(wabaData.message_template_namespace, wabaInformationId)
      })
      .then(resp => {
        const redisService = new RedisService()
        return redisService.setWabaDataInRedis(wabaNumber, wabaDataFromRedis)
      })
      .then(data => {
        return deferred.resolve(wabaDataFromRedis.namespace)
      })
      .catch(err => deferred.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return deferred.promise
  } else {
    deferred.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Missing' })
    return deferred.promise
  }
}
class InternalService {
  createInitialBody (td) {
    const body = [{
      name: td.messageTemplateId,
      language: td.languageCode,
      components: [
        {
          type: 'BODY',
          text: td.bodyText
        }
      ]
    }]
    if (td.bodyTextVarExample && isArray(td.bodyTextVarExample) && td.bodyTextVarExample.length > 0) {
      body[0].components[0].example = { body_text: [td.bodyTextVarExample] }
    }
    if (td.secondLanguageRequired) {
      body.push({
        name: td.messageTemplateId,
        language: td.secondLanguageCode,
        components: [
          {
            type: 'BODY',
            text: td.secondLanguageBodyText
          }
        ]
      })
      if (td.secondLanguageBodyTextVarExample && isArray(td.secondLanguageBodyTextVarExample) && td.secondLanguageBodyTextVarExample.length > 0) {
        body[1].components[0].example = { body_text: [td.secondLanguageBodyTextVarExample] }
      }
    }
    return body
  }

  getNamespaceForTheTemplate (wabaPhoneNumber, maxTpsToProvider) {
    const namespaceReceived = q.defer()
    __logger.info('Inside function to get namespace for the template', { wabaPhoneNumber })
    const redisService = new RedisService()
    redisService.getWabaDataByPhoneNumber(wabaPhoneNumber)
      .then((data) => {
        if (data.namespace) {
          return data.namespace
        } else {
          // call fb api, store it in db, store it in redis & return
          return getWabaDetails(wabaPhoneNumber, data.userId, maxTpsToProvider, data.wabaInformationId, data)
        }
      })
      .then(namespace => {
        namespaceReceived.resolve(namespace)
      })
      .catch((err) => {
        namespaceReceived.reject(err)
      })
    return namespaceReceived.promise
  }

  getFbTemplateName (wabaPhoneNumber, templateid) {
    const fbTemplateName = q.defer()
    __logger.info('getFbTemplateName ------------>', { wabaPhoneNumber, templateid })
    const redisService = new RedisService()
    redisService.getFbTemplateName(templateid)
      .then(templateName => fbTemplateName.resolve(templateName))
      .catch(err => {
        console.log('getFbTemplateName err -->', err)
        fbTemplateName.reject(err)
      })
    return fbTemplateName.promise
  }

  mapComponent (components) {
    if (!components || components.length <= 0) {
      return []
    }
    _.each(components, (component) => {
      _.each(component.parameters, (parameter) => {
        if (parameter.media) {
          parameter.type = parameter.media.type
          parameter[parameter.media.type] = parameter.media
          delete parameter[parameter.media.type].caption
          if (parameter[parameter.media.type].url) {
            if (parameter && parameter.media && parameter.media.type && parameter.media.type === 'document' && parameter.document && parameter.document.url) {
              const fileNameExtArray = parameter.document.url.split('/')
              if (fileNameExtArray && fileNameExtArray.length) parameter[parameter.media.type].filename = fileNameExtArray[fileNameExtArray.length - 1] || 'generic.pdf'
            }
            parameter[parameter.media.type].link = parameter[parameter.media.type].url
            delete parameter[parameter.media.type].url
          }
          delete parameter.media
        }
      })
    })
    return components
  }

  mapContacts (components) {
    if (!components || components.length <= 0) {
      return []
    }
    _.each(components, (component) => {
      _.each(component.addresses, (parameter) => {
        if (parameter.country_code) {
          parameter.countryCode = parameter.country_code
          delete parameter.country_code
        }
      })
      _.each(component.name, (parameter) => {
        if (parameter.firstName) {
          parameter.first_name = parameter.firstName
          delete parameter.firstName
        }
        if (parameter.lastName) {
          parameter.last_name = parameter.lastName
          delete parameter.lastName
        }
        if (parameter.formattedName) {
          parameter.formatted_name = parameter.formattedName
          delete parameter.formattedName
          if (parameter.middleName) {
          }
          parameter.middle_name = parameter.middleName
          delete parameter.middleName
        }
      })
    })
    return components
  }

  async sendMessageFbBody (td, maxTpsToProvider) {
    const body = {
      to: td.to,
      type: td.whatsapp.contentType,
      recipient_type: 'individual'

    }
    if (td.whatsapp.contentType === 'text') {
      body.text = {
        body: td.whatsapp.text
      }
    } else if (td.whatsapp.contentType === 'contact') {
      body.type = 'contacts'
      body.contacts = this.mapContacts(td.whatsapp.contact)
    } else if (td.whatsapp.contentType === 'location') {
      body.location = {
        longitude: `${td.whatsapp.location.longitude}`,
        latitude: `${td.whatsapp.location.latitude}`,
        name: td.whatsapp.location.name,
        address: td.whatsapp.location.address
      }
    } else if (td.whatsapp.contentType === 'media' && td.whatsapp.media && td.whatsapp.media.type === 'image') {
      body.image = {
        link: td.whatsapp.media.url,
        caption: td.whatsapp.media.caption
      }
      body.type = 'image'
    } else if (td.whatsapp.contentType === 'media' && td.whatsapp.media && td.whatsapp.media.type === 'video') {
      body.video = {
        link: td.whatsapp.media.url,
        caption: td.whatsapp.media.caption
      }
      body.type = 'video'
    } else if (td.whatsapp.contentType === 'media' && td.whatsapp.media && td.whatsapp.media.type === 'audio') {
      body.audio = {
        link: td.whatsapp.media.url
      }
      body.type = 'audio'
    } else if (td.whatsapp.contentType === 'media' && td.whatsapp.media && td.whatsapp.media.type === 'document') {
      body.document = {
        link: td.whatsapp.media.url,
        caption: td.whatsapp.media.caption,
        filename: td.whatsapp.media.filename
      }
      body.type = 'document'
    } else if (td.whatsapp.contentType === 'template') {
      body.template = {
        // namespace: __constants.NAME_SPACE_FB,
        namespace: await this.getNamespaceForTheTemplate(td.whatsapp.from, maxTpsToProvider),
        name: await this.getFbTemplateName(td.whatsapp.from, td.whatsapp.template.templateId),
        language: td.whatsapp.template.language,
        components: this.mapComponent(td.whatsapp.template.components)
      }
    } else if (td.whatsapp.contentType === 'interactive') {
      if (td.whatsapp.interactive.type === 'list') {
        body.interactive = td.whatsapp.interactive
        body.from = td.whatsapp.from
      } else {
        body.interactive = td.whatsapp.interactive
      }
    }

    return body
  }

  addHeader (body, td, headerHandleData) {
    __logger.info('Inside addHeader in datamapper')
    if (td.type.toLowerCase() === __constants.TEMPLATE_TYPE[1].templateType.toLowerCase() && td.headerType) {
      const headerData = {
        type: 'HEADER',
        format: td.headerType.toUpperCase()
      }
      if (td.headerType.toLowerCase() === __constants.TEMPLATE_HEADER_TYPE[3].templateHeaderType.toLowerCase()) headerData.text = td.headerText
      if (td.headerType.toLowerCase() === __constants.TEMPLATE_HEADER_TYPE[3].templateHeaderType.toLowerCase() && td.headerTextVarExample && isArray(td.headerTextVarExample) && td.headerTextVarExample.length > 0) headerData.example = { header_text: td.headerTextVarExample[0] }
      if (td.headerType.toLowerCase() !== __constants.TEMPLATE_HEADER_TYPE[3].templateHeaderType.toLowerCase() && td.mediaExampleUrl) headerData.example = { header_handle: headerHandleData || '' }
      body[0].components.push(headerData)
      if (td.secondLanguageRequired) {
        const headerData = {
          type: 'HEADER',
          format: td.headerType.toUpperCase()
        }
        if (td.headerType.toLowerCase() === __constants.TEMPLATE_HEADER_TYPE[3].templateHeaderType.toLowerCase()) headerData.text = td.secondLanguageHeaderText
        if (td.headerType.toLowerCase() === __constants.TEMPLATE_HEADER_TYPE[3].templateHeaderType.toLowerCase() && td.secondLanguageHeaderTextVarExample && isArray(td.secondLanguageHeaderTextVarExample) && td.secondLanguageHeaderTextVarExample.length > 0) headerData.example = { header_text: td.secondLanguageHeaderTextVarExample[0] }
        if (td.headerType.toLowerCase() !== __constants.TEMPLATE_HEADER_TYPE[3].templateHeaderType.toLowerCase() && td.mediaExampleUrl) headerData.example = { header_handle: __constants.HEADER_HANDLE[td.headerType.toLowerCase()] ? __constants.HEADER_HANDLE[td.headerType.toLowerCase()] : td.mediaExampleUrl }
        body[1].components.push(headerData)
      }
    }
    return body
  }

  addFooter (body, td) {
    if (td.type.toLowerCase() === __constants.TEMPLATE_TYPE[1].templateType.toLowerCase() && td.footerText) {
      body[0].components.push({
        type: 'FOOTER',
        text: td.footerText
      })
      if (td.secondLanguageRequired) {
        body[1].components.push({
          type: 'FOOTER',
          text: td.secondLanguageFooterText
        })
      }
    }
    return body
  }

  addCallToActionButton (body, td) {
    if (td.type.toLowerCase() === __constants.TEMPLATE_TYPE[1].templateType.toLowerCase() && td.buttonType && td.buttonType.toLowerCase() === __constants.TEMPLATE_BUTTON_TYPE[0].buttonType.toLowerCase()) {
      const pushData = { type: 'BUTTONS', buttons: [] }
      if (td.buttonData.websiteButtontext && td.buttonData.webAddress) pushData.buttons.push({ type: 'URL', text: td.buttonData.websiteButtontext, url: td.buttonData.webAddress })
      if (td.buttonData.phoneButtonText && td.buttonData.phoneNumber) pushData.buttons.push({ type: 'PHONE_NUMBER', text: td.buttonData.phoneButtonText, phone_number: `+${td.buttonData.phoneNumber}` })
      if (pushData.buttons.length > 0) body[0].components.push(pushData)

      if (td.secondLanguageRequired) {
        const secondLangPushData = { type: 'BUTTONS', buttons: [] }
        if (td.buttonData.secondLanguageWebsiteButtontext && td.buttonData.webAddress) secondLangPushData.buttons.push({ type: 'URL', text: td.buttonData.secondLanguageWebsiteButtontext, url: td.buttonData.webAddress })
        if (td.buttonData.secondLanguagePhoneButtonText && td.buttonData.phoneNumber) secondLangPushData.buttons.push({ type: 'PHONE_NUMBER', text: td.buttonData.secondLanguagePhoneButtonText, phone_number: `+${td.buttonData.phoneNumber}` })
        if (secondLangPushData.buttons.length > 0) body[1].components.push(secondLangPushData)
      }
    }
    return body
  }

  addQuickReplyButton (body, td) {
    if (td.type.toLowerCase() === __constants.TEMPLATE_TYPE[1].templateType.toLowerCase() && td.buttonType && td.buttonType.toLowerCase() === __constants.TEMPLATE_BUTTON_TYPE[1].buttonType.toLowerCase()) {
      const buttonArr = []
      _.each(td.buttonData.quickReply, str => { if (str) buttonArr.push({ type: 'QUICK_REPLY', text: str }) })
      body[0].components.push({
        type: 'BUTTONS',
        buttons: buttonArr
      })
      if (td.secondLanguageRequired) {
        const seconfLangButtonArr = []
        _.each(td.buttonData.secondLanguageQuickReply, str => { if (str) seconfLangButtonArr.push({ type: 'QUICK_REPLY', text: str }) })
        body[1].components.push({
          type: 'BUTTONS',
          buttons: seconfLangButtonArr
        })
      }
    }
    return body
  }
}

class DataMapper {
  addTemplate (templateData, accesToken) {
    __logger.info('fb: dataMapper: addTemplate():')
    const apiReqBody = q.defer()
    const internalService = new InternalService()
    const resumableApi = new ResumableApi()
    let body = internalService.createInitialBody(templateData)
    getCategoryMapping(templateData.messageTemplateCategoryId, __config.service_provider_id.facebook)
      .then(data => {
        __logger.info('fb: dataMapper: addTemplate(): getCategoryMapping(): then 1:', data)
        if (body && body[0]) {
          body[0].category = data.service_provider_category
        }
        if (body && body[1]) {
          body[1].category = data.service_provider_category
        }
        if (templateData.mediaExampleUrl) {
          return resumableApi.createHeaderHandleDataFromMediaUrl(templateData.mediaExampleUrl, accesToken)
        } else {
          return null
        }
      }).then(headerHandleData => {
        __logger.info('fb: dataMapper: addTemplate(): getCategoryMapping(): headerHandleData(): then 2:', headerHandleData)
        body = internalService.addHeader(body, templateData, headerHandleData)
        body = internalService.addFooter(body, templateData)
        body = internalService.addCallToActionButton(body, templateData)
        body = internalService.addQuickReplyButton(body, templateData)
        apiReqBody.resolve(body)
      })
      .catch(err => {
        __logger.error('fb: dataMapper: addTemplate(): getCategoryMapping(): catch:', err)
        apiReqBody.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return apiReqBody.promise
  }

  updateProfileDetails (wabaData) {
    const apiReqBody = q.defer()
    getWabaCategoryMapping(wabaData.businessCategoryId, __config.service_provider_id.tyntec)
      .then(data => {
        const body = {
          vertical: data.service_provider_business_category_name,
          address: wabaData.address || '' + ', ' + wabaData.city || '' + ', ' + wabaData.state || '' + ', ' + wabaData.country || '' + 'Pin Code ' + wabaData.postalCode || '',
          description: wabaData.description,
          email: wabaData.email,
          websites: wabaData.websites,
          about: wabaData.whatsappStatus
        }
        __logger.info('fb: dataMapper: updateProfileDetails(): getWabaCategoryMapping():', data, body)
        apiReqBody.resolve(body)
      })
      .catch(err => {
        __logger.error('fb: dataMapper: updateProfileDetails(): getWabaCategoryMapping(): catch:', err)
        apiReqBody.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return apiReqBody.promise
  }

  updateBusinessProfileDetails (wabaData) {
    const apiReqBody = q.defer()
    getWabaCategoryMapping(wabaData.businessCategoryId, __config.service_provider_id.facebook)
      .then(data => {
        const body = {
          vertical: data.service_provider_business_category_name,
          address: `${wabaData.address || ''}` + ', ' + `${csc.getCityById(wabaData.city).name || ''}` + ', ' + `${csc.getStateById(wabaData.state).name || ''}` + ', ' + `${csc.getCountryById(wabaData.country).name || ''}` + ', ' + 'Pin Code ' + `${wabaData.postalCode || ''}`,
          description: wabaData.description || '',
          email: wabaData.email || '',
          websites: wabaData.websites || ''
        }
        __logger.info('fb: dataMapper: updateBusinessProfileDetails(): getWabaCategoryMapping():', data, body)
        apiReqBody.resolve(body)
      })
      .catch(err => {
        __logger.error('fb: dataMapper: updateBusinessProfileDetails(): getWabaCategoryMapping(): catch:', err)
        apiReqBody.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return apiReqBody.promise
  }

  // updateAboutDetails (wabaData) {
  //   const apiReqBody = q.defer()
  //   getWabaCategoryMapping(wabaData.businessCategoryId, __config.service_provider_id.facebook)
  //     .then(data => {
  //       const body = {
  //         about: wabaData.whatsappStatus
  //       }
  //       __logger.info('updateProfileDetails:: data', body)
  //       apiReqBody.resolve(body)
  //     })
  //     .catch(err => apiReqBody.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
  //   return apiReqBody.promise
  // }

  sendMessage (data, maxTpsToProvider) {
    const deferred = q.defer()
    const internalService = new InternalService()
    internalService.sendMessageFbBody(data, maxTpsToProvider)
      .then(body => {
        deferred.resolve(body)
      })
      .catch(err => {
        __logger.error('fb: dataMapper: sendMessage(): catch:', err)
        deferred.reject(err)
      })
    return deferred.promise
  }
}

module.exports = DataMapper
