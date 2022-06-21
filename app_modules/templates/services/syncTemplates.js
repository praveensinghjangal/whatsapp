/**
 * @namespace -Template-Sync-Service-
 * @description This service is to be used in onboarding flow to sync facebook template and platform templates
 * @author Danish Galiyara 11th May, 2022
 * *** Last-Updated :- Danish Galiyara 11th May, 2022 ***
 */

const q = require('q')
const _ = require('lodash')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const UniqueId = require('../../../lib/util/uniqueIdGenerator')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const integrationService = require('../../integration/')
const TemplateService = require('../services/dbData')

const createInsertParam = (fbTemplate, wabaId, userId) => {
  console.log('i will create insert param', fbTemplate)
  const uniqueId = new UniqueId()
  const insertJson = {
    templateId: uniqueId.uuid(),
    wabaId: wabaId,
    templateName: fbTemplate.name + '_' + fbTemplate.language,
    type: __constants.TEMPLATE_TYPE[0].templateType,
    categoryId: __constants.FB_CATEGORY_TO_VIVA_CATEGORY[fbTemplate.category] || __constants.FB_CATEGORY_TO_VIVA_CATEGORY.AUTO_REPLY,
    templateStatus: __constants.TEMPLATE_STATUS.approved.statusCode,
    templateLanguage: __constants.FB_LANG_TO_VIVA_LANG_MAPPING[fbTemplate.language] || __constants.FB_LANG_TO_VIVA_LANG_MAPPING.en,
    bodyText: null,
    headerText: null,
    footerText: null,
    mediaType: null,
    createdBy: userId,
    updatedBy: userId,
    secondLang: 0,
    headerType: null,
    buttonType: null,
    buttonData: {},
    firstLanguageStatus: __constants.TEMPLATE_STATUS.approved.statusCode,
    bodyTextVarExample: [],
    headerTextVarExample: [],
    secondLanguageBodyTextVarExample: '[]',
    secondLanguageHeaderTextVarExample: '[]',
    mediaExampleUrl: null,
    isPersonalised: 0,
    facebook_message_template_id: fbTemplate.name
  }
  _.each(fbTemplate.components, singleComponent => {
    if (singleComponent.type.toLowerCase() === 'body') {
      insertJson.bodyText = singleComponent.text
      if (singleComponent.example) insertJson.bodyTextVarExample = singleComponent.example.body_text[0]
    }
    if (singleComponent.type.toLowerCase() === 'header') {
      // console.log('=============,', singleComponent.format.toLowerCase(), __constants.FB_HEADER_TO_VIVA_HEADER[singleComponent.format.toLowerCase()], singleComponent.example)
      insertJson.headerType = __constants.FB_HEADER_TO_VIVA_HEADER[singleComponent.format.toLowerCase()] || null
      if (singleComponent.format.toLowerCase() === 'text') insertJson.headerText = singleComponent.text
      if (singleComponent.example && singleComponent.example.header_text) insertJson.headerTextVarExample = singleComponent.example.header_text
      if (singleComponent.example && singleComponent.example.header_handle) insertJson.mediaExampleUrl = singleComponent.example.header_handle[0]
    }
    if (singleComponent.type.toLowerCase() === 'footer') {
      insertJson.footerText = singleComponent.text
    }
    if (singleComponent.type.toLowerCase() === 'buttons') {
      insertJson.buttonData = { quickReply: [] }
      _.each(singleComponent.buttons, buttonData => {
        if (buttonData.type.toLowerCase() === 'quick_reply') {
          insertJson.buttonType = __constants.TEMPLATE_BUTTON_TYPE[1].buttonType.toLowerCase()
          insertJson.buttonData.quickReply.push(buttonData.text)
        }
        if (buttonData.type.toLowerCase() === 'url') {
          insertJson.buttonType = __constants.TEMPLATE_BUTTON_TYPE[0].buttonType.toLowerCase()
          insertJson.buttonData.webAddress = buttonData.url
          insertJson.buttonData.websiteButtontext = buttonData.text
        }
        if (buttonData.type.toLowerCase() === 'phone_number') {
          insertJson.buttonType = __constants.TEMPLATE_BUTTON_TYPE[0].buttonType.toLowerCase()
          insertJson.buttonData.phoneNumber = buttonData.phone_number
          insertJson.buttonData.phoneButtonText = buttonData.text
        }
      })
      if (insertJson.buttonData.quickReply.length === 0) delete insertJson.buttonData.quickReply
    }
  })
  if (insertJson.headerText || insertJson.footerText || insertJson.buttonType) insertJson.type = __constants.TEMPLATE_TYPE[1].templateType
  if (insertJson.headerType) {
    insertJson.isPersonalised = 1
    if (insertJson.headerType === __constants.TEMPLATE_HEADER_TYPE[3].templateHeaderType && insertJson.headerText && (insertJson.headerText.match(/{{\d{1,2}}}/g) || []).length === 0) insertJson.isPersonalised = 0
  }
  if (insertJson.bodyText && (insertJson.bodyText.match(/{{\d{1,2}}}/g) || []).length > 0)insertJson.isPersonalised = 1
  insertJson.buttonData = JSON.stringify(insertJson.buttonData)
  insertJson.bodyTextVarExample = JSON.stringify(insertJson.bodyTextVarExample)
  insertJson.headerTextVarExample = JSON.stringify(insertJson.headerTextVarExample)
  const insertArr = []
  _.each(insertJson, val => insertArr.push(val))
  // console.log('--------------->', insertArr)
  return insertArr
}

class SyncTemplates {
  /**
     * @memberof -Template-Services-
     * @name getTemplateTableDataAndWabaId
     * @description This service is get template data and waba data by template ID and user ID.
     * @body {string} messageTemplateId
     * @body {string} userId
     * @response {object} templateAndWabaData  -  Object which is fetched from DB.
     * @author Danish Galiyara 5th June, 2020
     *  * *** Last-Updated :- Danish Galiyara 8th December, 2020 ***
   */
  constructor (wabaNumber, serviceProviderId, userId, wabaid, trackId) {
    this.uniqueId = new UniqueId()
    this.trackId = trackId || this.uniqueId.uuid()
    this.wabaNumber = wabaNumber
    this.trackId = trackId
    this.serviceProviderId = serviceProviderId
    this.userId = userId
    this.wabaId = wabaid
    this.templateIntegrationService = new integrationService.Template(serviceProviderId, 30, userId)
  }

  sync () {
    __logger.trace('info', { vivaReqId: this.trackId }, { wabaNumber: this.wabaNumber, trackId: this.trackId, serviceProviderId: this.serviceProviderId, userId: this.userId }, 'sync template service called ~function=sync.', [], [])
    const templateSyncd = q.defer()
    const templateService = new TemplateService()
    let fbTemplates = []
    this.templateIntegrationService.getTemplateList(this.wabaNumber, false)
      .then(facebookTemplateData => {
        // console.log('-----', facebookTemplateData)
        if (facebookTemplateData && facebookTemplateData.data && facebookTemplateData.data.data && _.isArray(facebookTemplateData.data.data)) {
          fbTemplates = _.filter(facebookTemplateData.data.data, { status: 'APPROVED' })
          const facebookTemplateIdArr = fbTemplates.reduce((filtered, singleTemplate) => { // todo change to map as already filtering above
            if (singleTemplate.status === 'APPROVED') {
              filtered.push(singleTemplate.name)
            }
            return filtered
          }, [])
          return templateService.getBulkTemplateDataByIds(facebookTemplateIdArr)
        } else {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
        }
      })
      .then(dbData => {
        // console.log('dbDatadbDatadbDatadbDatadbData', dbData)
        const insertQueryData = []
        _.each(fbTemplates, singleTemplate => {
          const matched = _.filter(dbData, { facebookMessageTemplateId: singleTemplate.name })
          // console.log('matched ---->', matched)
          const languageArr = []
          _.each(matched, oneRow => { if (oneRow.firstLanguage) languageArr.push(oneRow.firstLanguage); if (oneRow.secondLanguage)languageArr.push(oneRow.secondLanguage) })
          // console.log('==============>', languageArr)
          if (!languageArr.includes(singleTemplate.language.slice(0, 2).toLowerCase())) insertQueryData.push(createInsertParam(singleTemplate, this.wabaId, this.userId))
        })
        console.log('insertQueryData ---', insertQueryData.length, fbTemplates.length)
        if (insertQueryData.length > 0) {
          return templateService.insertTemplateBulk(insertQueryData)
        } else {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.RECORD_EXIST, err: {}, data: {} })
        }
      })
      .then(data => templateSyncd.resolve(data))
      .catch(err => {
        console.log('errrrrrrrrr SyncTemplates', err)
        __logger.error('error: SyncTemplates', err)
        templateSyncd.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return templateSyncd.promise
  }
}

module.exports = SyncTemplates
