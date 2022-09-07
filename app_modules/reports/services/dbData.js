const q = require('q')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const encrypyDecrypt = require('encrypy-decrypt')
// const ValidatonService = require('../services/validation')
// const UniqueId = require('../../../lib/util/uniqueIdGenerator')
// const uniqueId = new UniqueId()

class MessageReportsServices {
  getDeliveryReportByMessageId (messageId, startDate, endDate, wabaPhoneNumber, limit, offset) {
    __logger.info('inside getDeliveryReportByMessageId', startDate, endDate, wabaPhoneNumber, limit, offset)
    const doesDeliveryReportExists = q.defer()
    const pineLine = [{
      $match: {
        wabaPhoneNumber: wabaPhoneNumber,
        createdOn: { $gte: new Date(startDate), $lte: new Date(endDate) },
        messageId: messageId
      }
    },
    {
      $facet: {
        data: [
          { $skip: offset },
          { $limit: limit }
        ],
        totalCount: [
          { $count: 'count' }
        ]
      }
    }
    ]
    __db.mongo.__custom_aggregate(__constants.DB_NAME, __constants.ENTITY_NAME.MESSAGES, pineLine)
      .then(result => {
        __logger.info('getDeliveryReportByMessageId query Result', { result })
        if (result && result[0] && result[0].totalCount.length > 0) {
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

  getDeliveryReportByConsumerNumber (consumerNumber, startDate, endDate, wabaPhoneNumber, limit, offset) {
    __logger.info('inside getDeliveryReportByConsumerNumber', consumerNumber, startDate, endDate, wabaPhoneNumber, limit, offset)
    var phoneNumber = encrypyDecrypt.encryptKeysInObj(consumerNumber, __constants.ENTITY_NAME.MESSAGES)
    const doesDeliveryReportExists = q.defer()
    const pineLine = [{
      $match: {
        wabaPhoneNumber: wabaPhoneNumber,
        createdOn: { $gte: new Date(startDate), $lte: new Date(endDate) },
        senderPhoneNumber: phoneNumber
      }
    },
    {
      $facet: {
        data: [
          { $skip: offset },
          { $limit: limit }
        ],
        totalCount: [
          { $count: 'count' }
        ]
      }
    }
    ]
    __db.mongo.__custom_aggregate(__constants.DB_NAME, __constants.ENTITY_NAME.MESSAGES, pineLine)
      .then(result => {
        __logger.info('getDeliveryReportByConsumerNumber query Result', { result })
        if (result && result[0] && result[0].totalCount.length > 0) {
          doesDeliveryReportExists.resolve(result)
        } else {
          return doesDeliveryReportExists.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('error in getDeliveryReportByConsumerNumber: ', err)
        doesDeliveryReportExists.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return doesDeliveryReportExists.promise
  }

  getDeliveryReportByStatus (status, startDate, endDate, wabaPhoneNumber, limit, offset) {
    __logger.info('inside getDeliveryReportByCampaignName', status, wabaPhoneNumber, limit, offset)
    const doesDeliveryReportExists = q.defer()
    const pineLine = [{
      $match: {
        wabaPhoneNumber: wabaPhoneNumber,
        createdOn: { $gte: new Date(startDate), $lte: new Date(endDate) },
        currentStatus: { $in: status }
      }
    },
    {
      $facet: {
        data: [
          { $skip: offset },
          { $limit: limit }
        ],
        totalCount: [
          { $count: 'count' }
        ]
      }
    }
    ]
    __db.mongo.__custom_aggregate(__constants.DB_NAME, __constants.ENTITY_NAME.MESSAGES, pineLine)
      .then(result => {
        __logger.info('getDeliveryReportByCampaignName query Result', { result })
        if (result && result[0] && result[0].totalCount.length > 0) {
          doesDeliveryReportExists.resolve(result)
        } else {
          return doesDeliveryReportExists.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('error in getDeliveryReportByCampaignName: ', err)
        doesDeliveryReportExists.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return doesDeliveryReportExists.promise
  }

  getDeliveryReportByDate (startDate, endDate, wabaPhoneNumber, limit, offset) {
    __logger.info('inside getDeliveryReportByDate', startDate, endDate, wabaPhoneNumber, limit, offset)
    const doesDeliveryReportExists = q.defer()
    const pineLine = [{
      $match: {
        wabaPhoneNumber: wabaPhoneNumber,
        createdOn: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }
    },
    {
      $facet: {
        data: [
          { $skip: offset },
          { $limit: limit }
        ],
        totalCount: [
          { $count: 'count' }
        ]
      }
    }
    ]
    __db.mongo.__custom_aggregate(__constants.DB_NAME, __constants.ENTITY_NAME.MESSAGES, pineLine)
      .then(result => {
        __logger.info('getDeliveryReportByDate query Result', { result })
        if (result && result[0] && result[0].totalCount.length > 0) {
          doesDeliveryReportExists.resolve(result)
        } else {
          return doesDeliveryReportExists.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('error in getDeliveryReportByDate: ', err)
        doesDeliveryReportExists.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return doesDeliveryReportExists.promise
  }

  getCampaignSummaryReportByCampaignName (campaignName, startDate, endDate, wabaPhoneNumber, limit, offset) {
    __logger.info('inside getCampaignSummaryReportByCampaignName', startDate, endDate, limit, offset, wabaPhoneNumber)
    const doesDeliveryReportExists = q.defer()
    const pineLine = [{
      $match: {
        wabaPhoneNumber: wabaPhoneNumber,
        createdOn: { $gte: new Date(startDate), $lte: new Date(endDate) },
        campaignName: campaignName
      }
    },
    {
      $facet: {
        data: [
          { $skip: offset },
          { $limit: limit }
        ],
        totalCount: [
          { $count: 'count' }
        ]
      }
    }
    ]
    __db.mongo.__custom_aggregate(__constants.DB_NAME, __constants.ENTITY_NAME.CAMPAIGNAME_SUMMARY_REPORT, pineLine)
      .then(data => {
        if (data && data[0] && data[0].totalCount.length > 0) {
          doesDeliveryReportExists.resolve(data)
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
    const pineLine = [{
      $match: {
        wabaPhoneNumber: wabaPhoneNumber,
        createdOn: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }
    },
    {
      $facet: {
        data: [
          { $skip: offset },
          { $limit: limit }
        ],
        totalCount: [
          { $count: 'count' }
        ]
      }
    }
    ]
    __db.mongo.__custom_aggregate(__constants.DB_NAME, __constants.ENTITY_NAME.CAMPAIGNAME_SUMMARY_REPORT, pineLine)
      .then(data => {
        if (data && data[0] && data[0].totalCount.length > 0) {
          doesDeliveryReportExists.resolve(data)
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

  // getTemplateSummaryReportByTemplateName (templateName, wabaPhoneNumber, limit, offset) {
  //   __logger.info('inside getTemplateSummaryReportByTemplateName', templateName, wabaPhoneNumber, limit, offset)
  //   const doesDeliveryReportExists = q.defer()
  //   __db.mysqlMis.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.getTemplateSummaryReportByTemplateName(), [templateName, wabaPhoneNumber, limit, offset, templateName, wabaPhoneNumber])
  //     .then(result => {
  //       __logger.info('getTemplateSummaryReportByTemplateName query Result', { result })
  //       if (result && result[0].length > 0) {
  //         doesDeliveryReportExists.resolve(result)
  //       } else {
  //         return doesDeliveryReportExists.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
  //       }
  //     })
  //     .catch(err => {
  //       __logger.error('error in getTemplateSummaryReportByTemplateName: ', err)
  //       doesDeliveryReportExists.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
  //     })
  //   return doesDeliveryReportExists.promise
  // }

  getTemplateSummaryReportByDate (startDate, endDate, wabaPhoneNumber, limit, offset) {
    __logger.info('inside getTemplateSummaryReportByDate', startDate, endDate, wabaPhoneNumber, limit, offset)
    const doesDeliveryReportExists = q.defer()
    __db.mysqlMis.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.getTemplateSummaryReportByDate(), [wabaPhoneNumber, startDate, endDate, limit, offset, wabaPhoneNumber, startDate, endDate])
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

  getTemplateSummaryReportByTemplateId (templateId, templateName, startDate, endDate, wabaPhoneNumber, limit, offset) {
    __logger.info('inside getTemplateSummaryReportByTemplateId', templateId, wabaPhoneNumber, limit, offset)
    const doesDeliveryReportExists = q.defer()
    __db.mysqlMis.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.getTemplateSummaryReportByTemplateId(), [templateId, templateName, startDate, endDate, wabaPhoneNumber, limit, offset, templateId, templateName, startDate, endDate, wabaPhoneNumber])
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

  getusserWiseSummaryCount (wabaPhoneNumber, limit, offset) {
    __logger.info('inside getusserWiseSummaryCount', wabaPhoneNumber, limit, offset)
    const getusserWiseSummaryCount = q.defer()
    __db.mysqlMis.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.getusserWiseSummaryCount(), [wabaPhoneNumber, limit, offset, wabaPhoneNumber])
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

  getusserWiseSummaryCountBasedOncountryName (wabaPhoneNumber, countryName, limit, offset) {
    __logger.info('inside getusserWiseSummaryCountBasedOncountryName', countryName, wabaPhoneNumber, limit, offset)
    const getusserWiseSummaryCountBasedOncountryName = q.defer()
    __db.mysqlMis.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.getusserWiseSummaryCountBasedOncountryName(), [wabaPhoneNumber, countryName, limit, offset, wabaPhoneNumber, countryName])
      .then(result => {
        __logger.info('getusserWiseSummaryCountBasedOncountryName query Result', { result })
        if (result && result[0].length > 0) {
          return getusserWiseSummaryCountBasedOncountryName.resolve(result)
        } else {
          return getusserWiseSummaryCountBasedOncountryName.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('error in getusserWiseSummaryCountBasedOncountryName: ', err)
        getusserWiseSummaryCountBasedOncountryName.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return getusserWiseSummaryCountBasedOncountryName.promise
  }

  getusserWiseSummaryCountBasedOnDate (wabaPhoneNumber, limit, offset, startDate, endDate) {
    __logger.info('inside getusserWiseSummaryCountBasedOnDate', wabaPhoneNumber, limit, offset, startDate, endDate)
    const getusserWiseSummaryCountBasedOnDate = q.defer()
    __db.mysqlMis.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.getusserWiseSummaryCountBasedOnDate(), [wabaPhoneNumber, startDate, endDate, limit, offset, wabaPhoneNumber, startDate, endDate])
      .then(result => {
        __logger.info('getusserWiseSummaryCount query Result', { result })
        if (result && result[0].length > 0) {
          return getusserWiseSummaryCountBasedOnDate.resolve(result)
        } else {
          return getusserWiseSummaryCountBasedOnDate.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('error in getTemplateSummaryReportByTemplateId: ', err)
        getusserWiseSummaryCountBasedOnDate.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return getusserWiseSummaryCountBasedOnDate.promise
  }

  getuserConversationReportCountBasedOncountryName (wabaPhoneNumber, countryName, startDate, endDate, limit, offset) {
    const getuserConversationReportCountBasedOncountryName = q.defer()
    __db.mysqlMis.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.getuserConversationReportCountBasedOncountryName(), [wabaPhoneNumber, countryName, startDate, endDate, limit, offset, wabaPhoneNumber, countryName, startDate, endDate])
      .then(result => {
        __logger.info('getusserWiseSummaryCount query Result', { result })
        if (result && result[0].length > 0) {
          return getuserConversationReportCountBasedOncountryName.resolve(result)
        } else {
          return getuserConversationReportCountBasedOncountryName.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('error in getTemplateSummaryReportByTemplateId: ', err)
        getuserConversationReportCountBasedOncountryName.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return getuserConversationReportCountBasedOncountryName.promise
  }

  getuserConversationReportCountBasedOnDate (wabaPhoneNumber, limit, offset, startDate, endDate) {
    const getuserConversationReportCountBasedOnDate = q.defer()
    __db.mysqlMis.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.getuserConversationReportCountBasedOnDate(), [wabaPhoneNumber, startDate, endDate, limit, offset, wabaPhoneNumber, startDate, endDate])
      .then(result => {
        __logger.info('getusserWiseSummaryCount query Result', { result })
        if (result && result[0].length > 0) {
          return getuserConversationReportCountBasedOnDate.resolve(result)
        } else {
          return getuserConversationReportCountBasedOnDate.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('error in getTemplateSummaryReportByTemplateId: ', err)
        getuserConversationReportCountBasedOnDate.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return getuserConversationReportCountBasedOnDate.promise
  }

  // getuserConversationReportCount (wabaPhoneNumber, limit, offset) {
  //   const getuserConversationReportCountBasedOnDate = q.defer()
  //   __db.mysqlMis.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.getuserConversationReportCount(), [wabaPhoneNumber, limit, offset, wabaPhoneNumber])
  //     .then(result => {
  //       __logger.info('getusserWiseSummaryCount query Result', { result })
  //       if (result && result[0].length > 0) {
  //         return getuserConversationReportCountBasedOnDate.resolve(result)
  //       } else {
  //         return getuserConversationReportCountBasedOnDate.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
  //       }
  //     })
  //     .catch(err => {
  //       __logger.error('error in getTemplateSummaryReportByTemplateId: ', err)
  //       getuserConversationReportCountBasedOnDate.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
  //     })
  //   return getuserConversationReportCountBasedOnDate.promise
  // }
}

module.exports = MessageReportsServices
