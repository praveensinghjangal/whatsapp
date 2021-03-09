const _ = require('lodash')
const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const __config = require('../../../config')
const __util = require('../../../lib/util')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const HttpService = require('../../../lib/http_service')
const TemplateDbService = require('../services/dbData')

/**
 * @memberof -Template-Controller-
 * @name GetTemplateCount
 * @path {GET} /templates/count
 * @description Bussiness Logic :- This api returns templates count
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
  <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/templates/getTemplateCount|GetTemplateCount}
 * @response {string} ContentType=application/json - Response content type.
 * @response {array} metadata.data.statusCount - In response we get array of json data consist of statusName and templateCount in each object.
 * @code {200} if the msg is success than it return the different templates count with statusName.
 * @author Arjun Bhole 5th June, 2020
 * *** Last-Updated :- Danish Galiyara 30th December, 2020 ***
 */

const getTemplateCount = (req, res) => {
  __logger.info('Get Templates Count API Called')
  const http = new HttpService(60000)
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  const result = {}
  __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getTemplateCountByStatus(), [userId])
    .then(data => {
      __logger.info('formatAndReturnTemplateCount', { data })
      result.statusCount = []
      result.allocatedTemplateCount = data.length > 0 ? data[0].templates_allowed : 0
      result.usedTemplateCount = 0
      _.each(__constants.TEMPLATE_STATUS, singleStatus => {
        const recordData = _.find(data, obj => obj.status_name ? obj.status_name.toLowerCase() === singleStatus.displayName.toLowerCase() : false)
        if (!recordData) {
          result.statusCount.push({ templateCount: 0, statusName: singleStatus.displayName })
        } else {
          result.usedTemplateCount += recordData.count
          result.statusCount.push({ templateCount: recordData.count, statusName: singleStatus.displayName })
        }
      })
      __logger.info('Result ', { result })
      return http.Get(__config.chatAppUrl + __constants.CHAT_APP_ENDPOINTS.menuBasedTemplates, { authorization: req.headers.authorization })
    })
    .then(apiRes => {
      __logger.info('menu based template list api response ---->', apiRes)
      if (apiRes && apiRes.code === __constants.RESPONSE_MESSAGES.SUCCESS.code && apiRes.data && apiRes.data.length > 0) {
        result.usedTemplateCount += apiRes.data.length
        _.each(__constants.MENU_BASED_TEMPLATE_STATUS, singleStatus => {
          const recordData = _.filter(apiRes.data, obj => obj.statusName ? obj.statusName.toLowerCase() === singleStatus.displayName.toLowerCase() : false)
          if (_.isEmpty(recordData)) {
            const existsInDbTemplate = _.find(result.statusCount, obj => obj.statusName ? obj.statusName.toLowerCase() === singleStatus.displayName.toLowerCase() : false)
            if (!existsInDbTemplate) result.statusCount.push({ templateCount: 0, statusName: singleStatus.displayName })
          } else {
            const existsInDbTemplateIndex = _.findIndex(result.statusCount, obj => obj.statusName ? obj.statusName.toLowerCase() === singleStatus.displayName.toLowerCase() : false)
            if (result.statusCount[existsInDbTemplateIndex]) {
              result.statusCount[existsInDbTemplateIndex].templateCount += recordData.length
            } else {
              result.statusCount.push({ templateCount: recordData.length, statusName: singleStatus.displayName })
            }
          }
        })
      }
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: result })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

const getTemplateCountForAll = (req, res) => {
  __logger.info('Get Templates Count For Support  API Called')
  const http = new HttpService(60000)
  const templateDbService = new TemplateDbService()
  const result = {}
  templateDbService.getTemplateCountForAll()
    .then(data => {
      __logger.info('format And Return Template Count For Support', { data })
      result.statusCount = []
      let totalStaticTemplate = 0
      _.each(__constants.TEMPLATE_STATUS, (singleStatus, index) => {
        const recordData = _.find(data, obj => obj.statusName ? obj.statusName.toLowerCase() === singleStatus.displayName.toLowerCase() : false)
        if (!recordData) {
          result.statusCount.push({ templateCount: 0, statusName: singleStatus.displayName })
        } else {
          result.statusCount.push({ templateCount: recordData.statusCount, statusName: singleStatus.displayName })
        }
        totalStaticTemplate += recordData && recordData.statusCount ? recordData.statusCount : 0
      })
      result.totalStaticTemplate = totalStaticTemplate
      __logger.info('Result ', { result })
      return http.Get(__config.chatAppUrl + __constants.CHAT_APP_ENDPOINTS.menuBasedTemplatesCount, { authorization: req.headers.authorization })
    })
    .then(apiRes => {
      __logger.info('menu based template count for support api response ---->', apiRes)
      let totalInteractiveTemplate = 0
      if (apiRes && apiRes.code === __constants.RESPONSE_MESSAGES.SUCCESS.code && apiRes.data && apiRes.data.length > 0) {
        _.each(result.statusCount, (item, index) => {
          const recordData = _.find(apiRes.data, obj => obj.statusName ? obj.statusName.toLowerCase() === item.statusName.toLowerCase() : false)
          if (recordData) {
            console.log('if Condition ', (result.statusCount[index].statusName && result.statusCount[index].statusName === recordData.statusName))
            result.statusCount[index].templateCount = result.statusCount[index].templateCount + ((result.statusCount[index].statusName && result.statusCount[index].statusName === recordData.statusName) ? 0 + recordData.templateCount : 0)
            totalInteractiveTemplate += recordData.templateCount
          }
        })
      }
      result.totalInteractiveTemplate = totalInteractiveTemplate
      result.totalTemplates = result.totalInteractiveTemplate + result.totalStaticTemplate
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: result })
    })
    .catch(err => {
      __logger.error('Get Templates Count For Support error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = { getTemplateCount, getTemplateCountForAll }
