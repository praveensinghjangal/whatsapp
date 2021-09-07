const q = require('q')
const _ = require('lodash')
const __constants = require('../../../config/constants')
const __config = require('../../../config')
const getCategoryMapping = require('../service/getCategoryMapping')
const getWabaCategoryMapping = require('../service/getWabaCategoryMapping')
const __logger = require('../../../lib/logger')
const { isArray } = require('../../../lib/util')

class InternalService {
  createInitialBody (td) {
    const body = {
      name: td.messageTemplateId,
      localizations: [
        {
          language: td.languageCode,
          components: [
            {
              type: 'BODY',
              text: td.bodyText
            }
          ]
        }
      ]
    }
    if (td.bodyTextVarExample && isArray(td.bodyTextVarExample) && td.bodyTextVarExample.length > 0) body.localizations[0].components[0].example = { texts: td.bodyTextVarExample }
    if (td.secondLanguageRequired) {
      body.localizations.push({
        language: td.secondLanguageCode,
        components: [
          {
            type: 'BODY',
            text: td.secondLanguageBodyText
          }
        ]
      })
      if (td.secondLanguageBodyTextVarExample && isArray(td.secondLanguageBodyTextVarExample) && td.secondLanguageBodyTextVarExample.length > 0) body.localizations[1].components[0].example = { texts: td.secondLanguageBodyTextVarExample }
    }
    return body
  }

  addHeader (body, td) {
    if (td.type.toLowerCase() === __constants.TEMPLATE_TYPE[1].templateType.toLowerCase() && td.headerType) {
      const headerData = {
        type: 'HEADER',
        format: td.headerType.toUpperCase()
      }
      if (td.headerType.toLowerCase() === __constants.TEMPLATE_HEADER_TYPE[3].templateHeaderType.toLowerCase()) headerData.text = td.headerText
      if (td.headerType.toLowerCase() === __constants.TEMPLATE_HEADER_TYPE[3].templateHeaderType.toLowerCase() && td.headerTextVarExample && isArray(td.headerTextVarExample) && td.headerTextVarExample.length > 0) headerData.example = { text: td.headerTextVarExample[0] }
      if (td.headerType.toLowerCase() !== __constants.TEMPLATE_HEADER_TYPE[3].templateHeaderType.toLowerCase() && td.mediaExampleUrl) headerData.example = { url: td.mediaExampleUrl }
      body.localizations[0].components.push(headerData)
      if (td.secondLanguageRequired) {
        const headerData = {
          type: 'HEADER',
          format: td.headerType.toUpperCase()
        }
        if (td.headerType.toLowerCase() === __constants.TEMPLATE_HEADER_TYPE[3].templateHeaderType.toLowerCase()) headerData.text = td.secondLanguageHeaderText
        if (td.headerType.toLowerCase() === __constants.TEMPLATE_HEADER_TYPE[3].templateHeaderType.toLowerCase() && td.secondLanguageHeaderTextVarExample && isArray(td.secondLanguageHeaderTextVarExample) && td.secondLanguageHeaderTextVarExample.length > 0) headerData.example = { text: td.secondLanguageHeaderTextVarExample[0] }
        if (td.headerType.toLowerCase() !== __constants.TEMPLATE_HEADER_TYPE[3].templateHeaderType.toLowerCase() && td.mediaExampleUrl) headerData.example = { url: td.mediaExampleUrl }
        body.localizations[1].components.push(headerData)
      }
    }
    return body
  }

  addFooter (body, td) {
    if (td.type.toLowerCase() === __constants.TEMPLATE_TYPE[1].templateType.toLowerCase() && td.footerText) {
      body.localizations[0].components.push({
        type: 'FOOTER',
        text: td.footerText
      })
      if (td.secondLanguageRequired) {
        body.localizations[1].components.push({
          type: 'FOOTER',
          text: td.secondLanguageFooterText
        })
      }
    }
    return body
  }

  addCallToActionButton (body, td) {
    if (td.type.toLowerCase() === __constants.TEMPLATE_TYPE[1].templateType.toLowerCase() && td.buttonType && td.buttonType.toLowerCase() === __constants.TEMPLATE_BUTTON_TYPE[0].buttonType.toLowerCase()) {
      body.localizations[0].components.push({
        type: 'BUTTONS',
        buttons: [
          {
            type: 'URL',
            text: td.buttonData.websiteButtontext,
            url: td.buttonData.webAddress
          },
          {
            type: 'PHONE_NUMBER',
            text: td.buttonData.phoneButtonText,
            phoneNumber: td.buttonData.phoneNumber
          }
        ]
      })
      if (td.secondLanguageRequired) {
        body.localizations[1].components.push({
          type: 'BUTTONS',
          buttons: [
            {
              type: 'URL',
              text: td.buttonData.secondLanguageWebsiteButtontext,
              url: td.buttonData.webAddress
            },
            {
              type: 'PHONE_NUMBER',
              text: td.buttonData.secondLanguagePhoneButtonText,
              phoneNumber: td.buttonData.phoneNumber
            }
          ]
        })
      }
    }
    return body
  }

  addQuickReplyButton (body, td) {
    if (td.type.toLowerCase() === __constants.TEMPLATE_TYPE[1].templateType.toLowerCase() && td.buttonType && td.buttonType.toLowerCase() === __constants.TEMPLATE_BUTTON_TYPE[1].buttonType.toLowerCase()) {
      const buttonArr = []
      _.each(td.buttonData.quickReply, str => { if (str) buttonArr.push({ type: 'QUICK_REPLY', text: str }) })
      body.localizations[0].components.push({
        type: 'BUTTONS',
        buttons: buttonArr
      })
      if (td.secondLanguageRequired) {
        const seconfLangButtonArr = []
        _.each(td.buttonData.secondLanguageQuickReply, str => { if (str) seconfLangButtonArr.push({ type: 'QUICK_REPLY', text: str }) })
        body.localizations[1].components.push({
          type: 'BUTTONS',
          buttons: seconfLangButtonArr
        })
      }
    }
    return body
  }
}

class DataMapper {
  addTemplate (templateData) {
    const apiReqBody = q.defer()
    const internalService = new InternalService()
    let body = internalService.createInitialBody(templateData)
    getCategoryMapping(templateData.messageTemplateCategoryId, __config.service_provider_id.tyntec)
      .then(data => {
        body.category = data.service_provider_category
        body = internalService.addHeader(body, templateData)
        body = internalService.addFooter(body, templateData)
        body = internalService.addCallToActionButton(body, templateData)
        body = internalService.addQuickReplyButton(body, templateData)
        apiReqBody.resolve(body)
      })
      .catch(err => apiReqBody.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
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
        __logger.info('updateProfileDetails:: data', body)
        apiReqBody.resolve(body)
      })
      .catch(err => apiReqBody.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return apiReqBody.promise
  }
}

module.exports = DataMapper
