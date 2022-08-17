const q = require('q')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
// const ValidatonService = require('../services/validation')
// const UniqueId = require('../../../lib/util/uniqueIdGenerator')
// const uniqueId = new UniqueId()

class MessageReportsServices {
  getDeliveryReportByMessageId (messageId, consumerNumber, startDate, endDate, wabaPhoneNumber, limit, offset) {
    __logger.info('inside getDeliveryReportByMessageId', startDate, endDate, wabaPhoneNumber, limit, offset)
    const doesDeliveryReportExists = q.defer()
    __db.mysqlMis.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.getDeliveryReportByMessageId(), [messageId, consumerNumber, startDate, endDate, wabaPhoneNumber, limit, offset, messageId, consumerNumber, startDate, endDate, wabaPhoneNumber])
      .then(result => {
        __logger.info('getDeliveryReportByMessageId query Result', { result })
        if (result && result[0].length > 0) {
          doesDeliveryReportExists.resolve(result)
        } else {
          return doesDeliveryReportExists.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('error in getDeliveryReportByMessageId: ', err)
        doesDeliveryReportExists.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return doesDeliveryReportExists.promise
  }

  // getDeliveryReportByConsumerNumber (consumerNumber, wabaPhoneNumber, limit, offset) {
  //   __logger.info('inside getDeliveryReportByConsumerNumber', consumerNumber, wabaPhoneNumber, limit, offset)
  //   const doesDeliveryReportExists = q.defer()
  //   __db.mysqlMis.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.getDeliveryReportByConsumerNumber(), [consumerNumber, wabaPhoneNumber, limit, offset, consumerNumber, wabaPhoneNumber])
  //     .then(result => {
  //       __logger.info('getDeliveryReportByConsumerNumber query Result', { result })
  //       if (result && result[0].length > 0) {
  //         doesDeliveryReportExists.resolve(result)
  //       } else {
  //         return doesDeliveryReportExists.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
  //       }
  //     })
  //     .catch(err => {
  //       __logger.error('error in getDeliveryReportByConsumerNumber: ', err)
  //       doesDeliveryReportExists.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
  //     })
  //   return doesDeliveryReportExists.promise
  // }

  // getDeliveryReportByCampaignName (campaignName, wabaPhoneNumber, limit, offset) {
  //   __logger.info('inside getDeliveryReportByCampaignName', campaignName, wabaPhoneNumber, limit, offset)
  //   const doesDeliveryReportExists = q.defer()
  //   __db.mysqlMis.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.getDeliveryReportByCampaignName(), [campaignName, wabaPhoneNumber, limit, offset, campaignName, wabaPhoneNumber])
  //     .then(result => {
  //       __logger.info('getDeliveryReportByCampaignName query Result', { result })
  //       if (result && result[0].length > 0) {
  //         doesDeliveryReportExists.resolve(result)
  //       } else {
  //         return doesDeliveryReportExists.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
  //       }
  //     })
  //     .catch(err => {
  //       __logger.error('error in getDeliveryReportByCampaignName: ', err)
  //       doesDeliveryReportExists.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
  //     })
  //   return doesDeliveryReportExists.promise
  // }

  // getDeliveryReportByDate (startDate, endDate, wabaPhoneNumber, limit, offset) {
  //   __logger.info('inside getDeliveryReportByDate', startDate, endDate, wabaPhoneNumber, limit, offset)
  //   const doesDeliveryReportExists = q.defer()
  //   __db.mysqlMis.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.getDeliveryReportByDate(), [startDate, endDate, wabaPhoneNumber, limit, offset, startDate, endDate, wabaPhoneNumber])
  //     .then(result => {
  //       __logger.info('getDeliveryReportByDate query Result', { result })
  //       if (result && result[0].length > 0) {
  //         doesDeliveryReportExists.resolve(result)
  //       } else {
  //         return doesDeliveryReportExists.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
  //       }
  //     })
  //     .catch(err => {
  //       __logger.error('error in getDeliveryReportByDate: ', err)
  //       doesDeliveryReportExists.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
  //     })
  //   return doesDeliveryReportExists.promise
  // }

  getCampaignSummaryReportByCampaignName (campaignName, startDate, endDate, wabaPhoneNumber, limit, offset) {
    __logger.info('inside getCampaignSummaryReportByCampaignName', startDate, endDate, limit, offset)
    const doesDeliveryReportExists = q.defer()
    __db.mysqlMis.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.getCampaignSummaryReportByCampaignName(), [campaignName, startDate, endDate, wabaPhoneNumber, limit, offset, campaignName, startDate, endDate, wabaPhoneNumber])
      .then(result => {
        __logger.info('getCampaignSummaryReportByCampaignName query Result', { result })
        if (result && result[0].length > 0) {
          doesDeliveryReportExists.resolve(result)
        } else {
          return doesDeliveryReportExists.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('error in getCampaignSummaryReportByCampaignName: ', err)
        doesDeliveryReportExists.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return doesDeliveryReportExists.promise
  }

  getCampaignSummaryReportByDate (startDate, endDate, wabaPhoneNumber, limit, offset) {
    __logger.info('inside getCampaignSummaryReportByDate', startDate, endDate, wabaPhoneNumber, limit, offset)
    const doesDeliveryReportExists = q.defer()
    __db.mysqlMis.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.getCampaignSummaryReportByDate(), [startDate, endDate, wabaPhoneNumber, limit, offset, startDate, endDate, wabaPhoneNumber])
      .then(result => {
        __logger.info('getCampaignSummaryReportByDate query Result', { result })
        if (result && result[0].length > 0) {
          doesDeliveryReportExists.resolve(result)
        } else {
          return doesDeliveryReportExists.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('error in getCampaignSummaryReportByDate: ', err)
        doesDeliveryReportExists.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return doesDeliveryReportExists.promise
  }

  getTemplateSummaryReportByTemplateName (templateName, wabaPhoneNumber, limit, offset) {
    __logger.info('inside getTemplateSummaryReportByTemplateName', templateName, wabaPhoneNumber, limit, offset)
    const doesDeliveryReportExists = q.defer()
    __db.mysqlMis.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.getTemplateSummaryReportByTemplateName(), [templateName, wabaPhoneNumber, limit, offset, templateName, wabaPhoneNumber])
      .then(result => {
        __logger.info('getTemplateSummaryReportByTemplateName query Result', { result })
        if (result && result[0].length > 0) {
          doesDeliveryReportExists.resolve(result)
        } else {
          return doesDeliveryReportExists.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('error in getTemplateSummaryReportByTemplateName: ', err)
        doesDeliveryReportExists.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return doesDeliveryReportExists.promise
  }

  getTemplateSummaryReportByDate (startDate, endDate, wabaPhoneNumber, limit, offset) {
    __logger.info('inside getTemplateSummaryReportByDate', startDate, endDate, wabaPhoneNumber, limit, offset)
    const doesDeliveryReportExists = q.defer()
    __db.mysqlMis.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.getTemplateSummaryReportByDate(), [startDate, endDate, wabaPhoneNumber, limit, offset, startDate, endDate, wabaPhoneNumber])
      .then(result => {
        __logger.info('getTemplateSummaryReportByDate query Result', { result })
        if (result && result[0].length > 0) {
          doesDeliveryReportExists.resolve(result)
        } else {
          return doesDeliveryReportExists.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('error in getTemplateSummaryReportByDate: ', err)
        doesDeliveryReportExists.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return doesDeliveryReportExists.promise
  }

  getTemplateSummaryReportByTemplateId (templateId, wabaPhoneNumber, limit, offset) {
    __logger.info('inside getTemplateSummaryReportByTemplateId', templateId, wabaPhoneNumber, limit, offset)
    const doesDeliveryReportExists = q.defer()
    __db.mysqlMis.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.getTemplateSummaryReportByTemplateId(), [templateId, wabaPhoneNumber, limit, offset, templateId, wabaPhoneNumber])
      .then(result => {
        __logger.info('getTemplateSummaryReportByTemplateId query Result', { result })
        if (result && result[0].length > 0) {
          doesDeliveryReportExists.resolve(result)
        } else {
          return doesDeliveryReportExists.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('error in getTemplateSummaryReportByTemplateId: ', err)
        doesDeliveryReportExists.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return doesDeliveryReportExists.promise
  }

  getusserWiseSummaryCount (userId, limit, offset) {
    __logger.info('inside getusserWiseSummaryCount', userId, limit, offset)
    const getusserWiseSummaryCount = q.defer()
    __db.mysqlMis.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.getusserWiseSummaryCount(), [userId, limit, offset, userId])
      .then(result => {
        __logger.info('getusserWiseSummaryCount query Result', { result })
        if (result && result[0].length > 0) {
          return getusserWiseSummaryCount.resolve(result)
        } else {
          return getusserWiseSummaryCount.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('error in getTemplateSummaryReportByTemplateId: ', err)
        getusserWiseSummaryCount.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return getusserWiseSummaryCount.promise
  }

  getusserWiseSummaryCountBasedOncountryName (countryName, userId, limit, offset) {
    __logger.info('inside getusserWiseSummaryCountBasedOncountryName', countryName, userId, limit, offset)
    const getusserWiseSummaryCount = q.defer()
    __db.mysqlMis.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.getusserWiseSummaryCountBasedOncountryName(), [countryName, userId, limit, offset, userId])
      .then(result => {
        __logger.info('getusserWiseSummaryCountBasedOncountryName query Result', { result })
        if (result && result[0].length > 0) {
          return getusserWiseSummaryCount.resolve(result)
        } else {
          return getusserWiseSummaryCount.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('error in getusserWiseSummaryCountBasedOncountryName: ', err)
        getusserWiseSummaryCount.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return getusserWiseSummaryCount.promise
  }

  getusserWiseSummaryCountBasedOnDate (userId, wabaPhoneNumber, limit, offset, startDate, endDate) {
    __logger.info('inside getusserWiseSummaryCountBasedOnDate', userId, wabaPhoneNumber, limit, offset, startDate, endDate)
    const getusserWiseSummaryCount = q.defer()
    __db.mysqlMis.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.getusserWiseSummaryCountBasedOnDate(), [userId, wabaPhoneNumber, startDate, endDate, limit, offset])
      .then(result => {
        __logger.info('getusserWiseSummaryCount query Result', { result })
        if (result && result[0].length > 0) {
          return getusserWiseSummaryCount.resolve(result)
        } else {
          return getusserWiseSummaryCount.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('error in getTemplateSummaryReportByTemplateId: ', err)
        getusserWiseSummaryCount.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return getusserWiseSummaryCount.promise
  }
}

module.exports = MessageReportsServices
