const q = require('q')
const _ = require('lodash')
const __constants = require('../../../config/constants')
const __config = require('../../../config')
const getCategoryMapping = require('../service/getCategoryMapping')

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
    }
    return body
  }

  addHeader (body, td) {
    if (td.type.toLowerCase() === __constants.TEMPLATE_TYPE[1].templateType.toLowerCase() && td.headerType) {
      body.localizations[0].components.push({
        type: 'HEADER',
        format: td.headerType.toUpperCase(),
        text: td.headerType.toLowerCase() === __constants.TEMPLATE_HEADER_TYPE[3].templateHeaderType.toLowerCase() ? td.headerText : ''
      })
      if (td.secondLanguageRequired) {
        body.localizations[1].components.push({
          type: 'HEADER',
          format: td.headerType.toUpperCase(),
          text: td.headerType.toLowerCase() === __constants.TEMPLATE_HEADER_TYPE[3].templateHeaderType.toLowerCase() ? td.secondLanguageHeaderText : ''
        })
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
      _.each(td.buttonData.quickReply, str => buttonArr.push({ type: 'QUICK_REPLY', text: str }))
      body.localizations[0].components.push({
        type: 'BUTTONS',
        buttons: buttonArr
      })
      if (td.secondLanguageRequired) {
        const seconfLangButtonArr = []
        _.each(td.buttonData.secondLanguageQuickReply, str => seconfLangButtonArr.push({ type: 'QUICK_REPLY', text: str }))
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
}

module.exports = DataMapper
