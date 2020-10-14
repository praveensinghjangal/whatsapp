const q = require('q')
const _ = require('lodash')
const __constants = require('../../../config/constants')
const url = require('../../../lib/util/url')

class InternalClass {
  quickReplyButtonValid (td) {
    const valid = q.defer()
    if (td.buttonData && td.buttonType.toLowerCase() === __constants.TEMPLATE_BUTTON_TYPE[1].buttonType.toLowerCase()) {
      if (!td.buttonData.quickReply) {
        valid.reject('please provide quick reply text')
        return valid.promise
      }
      if (td.buttonData.quickReply && td.buttonData.quickReply.constructor.name.toLowerCase() !== 'array') {
        valid.reject('please provide quick reply text of type array')
        return valid.promise
      }
      if (td.buttonData.quickReply && td.buttonData.quickReply.length === 0) {
        valid.reject('please provide atleast one quick reply text')
        return valid.promise
      }
      if (td.buttonData.quickReply && td.buttonData.quickReply.length > __constants.TEMPLATE_QUICK_REPLY_BUTTON_MAX_LENGTH.arrayLength) {
        valid.reject(`quick reply buttons limit of ${__constants.TEMPLATE_QUICK_REPLY_BUTTON_MAX_LENGTH.arrayLength} exeeded`)
        return valid.promise
      }
      let isQRConInvalid = false
      _.each(td.buttonData.quickReply, str => {
        if (isQRConInvalid || typeof str !== 'string' || str.length > __constants.TEMPLATE_QUICK_REPLY_BUTTON_MAX_LENGTH.singleButtonLength) isQRConInvalid = true
      })
      if (isQRConInvalid) {
        valid.reject('quick reply button data invalid, please makle sure it is string with maximum length of ' + __constants.TEMPLATE_QUICK_REPLY_BUTTON_MAX_LENGTH.singleButtonLength)
        return valid.promise
      }
      if (td.secondLanguageRequired && !td.buttonData.secondLanguageQuickReply) {
        valid.reject('please provide quick reply text for second language')
        return valid.promise
      }
      if (td.secondLanguageRequired && td.buttonData.secondLanguageQuickReply && td.buttonData.secondLanguageQuickReply.constructor.name.toLowerCase() !== 'array') {
        valid.reject('please provide second language quick reply text of type array')
        return valid.promise
      }
      if (td.secondLanguageRequired && td.buttonData.secondLanguageQuickReply && td.buttonData.secondLanguageQuickReply.length === 0) {
        valid.reject('please provide the same amount of second language quick reply text as there in quick reply text')
        return valid.promise
      }
      if (td.buttonData.secondLanguageQuickReply && td.buttonData.secondLanguageQuickReply.length > __constants.TEMPLATE_QUICK_REPLY_BUTTON_MAX_LENGTH.arrayLength) {
        valid.reject(`second language quick reply buttons limit of ${__constants.TEMPLATE_QUICK_REPLY_BUTTON_MAX_LENGTH.arrayLength} exeeded`)
        return valid.promise
      }
      let isSLQRConInvalid = false
      _.each(td.buttonData.secondLanguageQuickReply, str => {
        if (isSLQRConInvalid || typeof str !== 'string' || str.length > __constants.TEMPLATE_QUICK_REPLY_BUTTON_MAX_LENGTH.singleButtonLength) isSLQRConInvalid = true
      })
      if (isSLQRConInvalid) {
        valid.reject('second language quick reply button data invalid, please makle sure it is string with maximum length of ' + __constants.TEMPLATE_QUICK_REPLY_BUTTON_MAX_LENGTH.singleButtonLength)
        return valid.promise
      }
      if (td.secondLanguageRequired && td.buttonData.secondLanguageQuickReply.length !== td.buttonData.quickReply.length) {
        valid.reject('both language quick reply buttons are not equal')
        return valid.promise
      }
    }
    valid.resolve(true)
    return valid.promise
  }

  callToActionButtonValid (td) {
    const valid = q.defer()
    if (td.buttonData && td.buttonType.toLowerCase() === __constants.TEMPLATE_BUTTON_TYPE[0].buttonType.toLowerCase()) {
      if (!td.buttonData.websiteButtontext) {
        valid.reject('please provide website button text')
        return valid.promise
      }
      if (td.secondLanguageRequired && !td.buttonData.secondLanguageWebsiteButtontext) {
        valid.reject('please provide website button text for second language')
        return valid.promise
      }
      if (!td.buttonData.phoneButtonText) {
        valid.reject('please provide phone button text')
        return valid.promise
      }
      if (td.secondLanguageRequired && !td.buttonData.secondLanguagePhoneButtonText) {
        valid.reject('please provide phone button text for second language')
        return valid.promise
      }
      if (!td.buttonData.webAddress || !url.isValid(td.buttonData.webAddress)) {
        valid.reject('please provide valid web URL')
        return valid.promise
      }
      const testRegex = td.buttonData.phoneNumber ? td.buttonData.phoneNumber.match(new RegExp(__constants.VALIDATOR.phoneNumber, 'g')) : []
      if (!td.buttonData.phoneNumber || !testRegex || testRegex.length === 0) {
        valid.reject('please provide valid phone number')
        return valid.promise
      }
    }
    valid.resolve(true)
    return valid.promise
  }

  buttonDataPresent (td) {
    const valid = q.defer()
    const buttonTypeArr = _.map(__constants.TEMPLATE_BUTTON_TYPE, json => json.buttonType.toLowerCase())
    if (td.buttonType && buttonTypeArr.includes(td.buttonType.toLowerCase()) && (!td.buttonData || _.isEmpty(td.buttonData))) {
      valid.reject('please provide button data of type json')
      return valid.promise
    }
    valid.resolve(true)
    return valid.promise
  }

  bodyTextVarMatchInBothLang (td) {
    const valid = q.defer()
    const firstLangBodyVarCount = td.bodyText ? (td.bodyText.match(/{{\d}}/g) || []).length : 0
    const secondLangBodyVarCount = td.secondLanguageBodyText ? (td.secondLanguageBodyText.match(/{{\d}}/g) || []).length : 0
    console.log('header var match', firstLangBodyVarCount, secondLangBodyVarCount)
    if (td.secondLanguageRequired && firstLangBodyVarCount !== secondLangBodyVarCount) {
      valid.reject('Variable in both language body does not match')
      return valid.promise
    }
    valid.resolve(true)
    return valid.promise
  }

  textPresentForSecondLanguageFooterAndVarMatchInBothLang (td) {
    const valid = q.defer()
    if (td.secondLanguageRequired && td.footerText && !td.secondLanguageFooterText) {
      valid.reject('please provide second language footer type')
      return valid.promise
    }
    const firstLangFooterVarCount = td.footerText ? (td.footerText.match(/{{\d}}/g) || []).length : 0
    const secondLangFooterVarCount = td.secondLanguageFooterText ? (td.secondLanguageFooterText.match(/{{\d}}/g) || []).length : 0
    if (firstLangFooterVarCount > 0) {
      valid.reject('Variable not allowed in footer')
      return valid.promise
    }
    if (td.secondLanguageRequired && td.footerText && secondLangFooterVarCount > 0) {
      valid.reject('Variable not allowed in second language footer')
      return valid.promise
    }
    valid.resolve(true)
    return valid.promise
  }

  textPresentForSecondLanguageHeaderTypeTextAndVarMatchInBothLang (td) {
    const valid = q.defer()
    if (td.secondLanguageRequired && td.headerType && td.headerType.toLowerCase() === __constants.TEMPLATE_HEADER_TYPE[3].templateHeaderType.toLowerCase() && !td.secondLanguageHeaderText) {
      valid.reject('please provide second language header text for header type text')
      return valid.promise
    }
    const firstLangHeaderTextVarCount = td.headerText ? (td.headerText.match(/{{\d}}/g) || []).length : 0
    const secondLangHeaderTextVarCount = td.secondLanguageHeaderText ? (td.secondLanguageHeaderText.match(/{{\d}}/g) || []).length : 0
    console.log('header var match', firstLangHeaderTextVarCount, secondLangHeaderTextVarCount)
    if (td.secondLanguageRequired && firstLangHeaderTextVarCount !== secondLangHeaderTextVarCount) {
      valid.reject('Variable in both language header text does not match')
      return valid.promise
    }
    valid.resolve(true)
    return valid.promise
  }

  textPresentForHeaderTypeText (td) {
    const valid = q.defer()
    if (td.headerType && td.headerType.toLowerCase() === __constants.TEMPLATE_HEADER_TYPE[3].templateHeaderType.toLowerCase() && !td.headerText) {
      valid.reject('please provide header text for header type text')
      return valid.promise
    }
    valid.resolve(true)
    return valid.promise
  }

  validHeaderType (td) {
    const valid = q.defer()
    const headerTypeArr = _.map(__constants.TEMPLATE_HEADER_TYPE, json => json.templateHeaderType.toLowerCase())
    if (!td.headerType || !headerTypeArr.includes(td.headerType.toLowerCase())) {
      valid.reject('please provide a valid template header type of enum values: ' + headerTypeArr.join(', '))
      return valid.promise
    }
    valid.resolve(true)
    return valid.promise
  }

  templateSecondryBodyPresent (td) {
    const valid = q.defer()
    if (td.secondLanguageRequired && !td.secondLanguageBodyText) {
      valid.reject('please provide a body for secondry language')
      return valid.promise
    }
    valid.resolve(true)
    return valid.promise
  }

  bothLanguageSame (td) {
    const valid = q.defer()
    if (td.secondLanguageRequired && td.messageTemplateLanguageId === td.secondTemplateLanguageId) {
      valid.reject('Both of the template language cannot be same')
      return valid.promise
    }
    valid.resolve(true)
    return valid.promise
  }

  templatePrimaryBodyPresent (td) {
    const valid = q.defer()
    if (!td.bodyText) {
      valid.reject('please provide a body for primary language')
      return valid.promise
    }
    valid.resolve(true)
    return valid.promise
  }

  basicDataPresent (td) {
    const valid = q.defer()
    const testRegex = td.templateName.match(new RegExp(__constants.VALIDATOR.aplphaNumericWithUnderscore, 'g'))
    if (!td.templateName || !testRegex || testRegex.length === 0) {
      valid.reject('please provide valid template name with only aplha numeric character in lowercase and underscore')
      return valid.promise
    }
    const typeArr = _.map(__constants.TEMPLATE_TYPE, json => json.templateType.toLowerCase())
    if (!td.type || !typeArr.includes(td.type.toLowerCase())) {
      valid.reject('please provide a valid template type of enum values: ' + typeArr.join(', '))
      return valid.promise
    }
    if (!td.messageTemplateCategoryId) {
      valid.reject('Template category not selected')
      return valid.promise
    }
    if (!td.messageTemplateLanguageId) {
      valid.reject('Template language not selected')
      return valid.promise
    }
    valid.resolve(true)
    return valid.promise
  }

  addTemplate (dbDatemplateData) {
    const valid = q.defer()
    this.basicDataPresent(dbDatemplateData)
      .then(data => this.templatePrimaryBodyPresent(dbDatemplateData))
      .then(data => this.bothLanguageSame(dbDatemplateData))
      .then(data => this.validHeaderType(dbDatemplateData))
      .then(data => this.textPresentForHeaderTypeText(dbDatemplateData))
      .then(data => this.templateSecondryBodyPresent(dbDatemplateData))
      .then(data => this.textPresentForSecondLanguageHeaderTypeTextAndVarMatchInBothLang(dbDatemplateData))
      .then(data => this.textPresentForSecondLanguageFooterAndVarMatchInBothLang(dbDatemplateData))
      .then(data => this.bodyTextVarMatchInBothLang(dbDatemplateData))
      .then(data => this.buttonDataPresent(dbDatemplateData))
      .then(data => this.callToActionButtonValid(dbDatemplateData))
      .then(data => this.quickReplyButtonValid(dbDatemplateData))
      .then(result => valid.resolve(result))
      .catch(err => valid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err }))
    return valid.promise
  }

  getTemplateCompletionStatus (templateData) {
    const templateStatus = q.defer()
    this.addTemplate(templateData)
      .then((data) => {
        templateStatus.resolve({ complete: true })
      })
      .catch(err => {
        templateStatus.resolve({ complete: false, err: err })
      })
    return templateStatus.promise
  }
}

module.exports = class RuleEngine {
  constructor () {
    this.internalClass = new InternalClass()
  }

  addTemplate (templateDbData) { return this.internalClass.addTemplate(templateDbData) }
  getTemplateCompletionStatus (templateDbData) { return this.internalClass.getTemplateCompletionStatus(templateDbData) }
}
