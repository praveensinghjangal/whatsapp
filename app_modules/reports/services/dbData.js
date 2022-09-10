const q = require('q')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const encrypyDecrypt = require('encrypy-decrypt')
const mongoConfig = require('../../../config/keysToEncrypt.json')
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
    var phoneNumber = encrypyDecrypt.encryptKeysInObj({ senderPhoneNumber: consumerNumber }, mongoConfig[__constants.ENTITY_NAME.MESSAGES])
    const doesDeliveryReportExists = q.defer()
    const pineLine = [{
      $match: {
        wabaPhoneNumber: wabaPhoneNumber,
        createdOn: { $gte: new Date(startDate), $lte: new Date(endDate) },
        senderPhoneNumber: phoneNumber.senderPhoneNumber
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

  getTemplateSummaryReportByTemplateName (templateName, startDate, endDate, wabaPhoneNumber, limit, offset) {
    __logger.info('inside getTemplateSummaryReportByTemplateName', templateName, wabaPhoneNumber, limit, offset)
    const doesDeliveryReportExists = q.defer()
    const pineLine = [{
      $match: {
        wabaPhoneNumber: wabaPhoneNumber,
        createdOn: { $gte: new Date(startDate), $lte: new Date(endDate) },
        templateName: templateName
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
    __db.mongo.__custom_aggregate(__constants.DB_NAME, __constants.ENTITY_NAME.TEMEPLATE_SUMMARY, pineLine)
      .then(data => {
        if (data && data[0] && data[0].totalCount.length > 0) {
          doesDeliveryReportExists.resolve(data)
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
    __db.mongo.__custom_aggregate(__constants.DB_NAME, __constants.ENTITY_NAME.TEMEPLATE_SUMMARY, pineLine)
      .then(data => {
        if (data && data[0] && data[0].totalCount.length > 0) {
          doesDeliveryReportExists.resolve(data)
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

  getTemplateSummaryReportByTemplateId (templateId, startDate, endDate, wabaPhoneNumber, limit, offset) {
    __logger.info('inside getTemplateSummaryReportByTemplateId', templateId, wabaPhoneNumber, limit, offset)
    const doesDeliveryReportExists = q.defer()
    const pineLine = [{
      $match: {
        wabaPhoneNumber: wabaPhoneNumber,
        createdOn: { $gte: new Date(startDate), $lte: new Date(endDate) },
        templateId: templateId
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
    __db.mongo.__custom_aggregate(__constants.DB_NAME, __constants.ENTITY_NAME.TEMEPLATE_SUMMARY, pineLine)
      .then(data => {
        if (data && data[0] && data[0].totalCount.length > 0) {
          doesDeliveryReportExists.resolve(data)
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
    const pineLine = [{
      $match: {
        wabaPhoneNumber: wabaPhoneNumber,
        createdOn: { $gte: new Date(startDate), $lte: new Date(endDate) },
        countryName: { $in: countryName }
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
    __db.mongo.__custom_aggregate(__constants.DB_NAME, __constants.ENTITY_NAME.CONVERSATION_SUMMARY, pineLine)
      .then(data => {
        __logger.info('getusserWiseSummaryCount query Result', { data })
        if (data && data[0] && data[0].totalCount.length > 0) {
          return getuserConversationReportCountBasedOncountryName.resolve(data)
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
    __db.mongo.__custom_aggregate(__constants.DB_NAME, __constants.ENTITY_NAME.CONVERSATION_SUMMARY, pineLine)
      .then(data => {
        __logger.info('getusserWiseSummaryCount query Result', { data })
        if (data && data[0] && data[0].totalCount.length > 0) {
          return getuserConversationReportCountBasedOnDate.resolve(data)
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
  downloadCampaignSummary (wabaPhoneNumber, startDate, endDate) {
    __logger.info('inside downloadCampaignSummary', startDate, endDate, wabaPhoneNumber)

    const downloadSummary = q.defer()
    const pipeline = [{
      $match: {
        wabaPhoneNumber: wabaPhoneNumber,
        createdOn: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }
    },
    {
      $project: {
        'campaign Name': '$campaignName',
        'Phone Number': '$wabaPhoneNumber',
        'Total Sent': '$totalSent',
        'Total Inprocess': '$totalInprocess',
        'Total Resource Allocated': '$totalResourceAllocated',
        'Total Forwarded': '$totalForwarded',
        'Total Seen': '$totalSeen',
        'Total Deleted': '$totalDeleted',
        'Total Accepted': '$totalAccepted',
        'Total Failed': '$totalFailed',
        'Total Pending': '$totalPending',
        'Total Rejected': '$totalRejected',
        'Total Rate Limit': '$totalRateLimit',
        'Delivered Message': '$deliveredMessage',
        'Deliverey Percentage': '$delivereyPercentage',
        'Date (MM/DD/YYYY)': { $dateToString: { format: '%m/%d/%Y', date: '$createdOn' } }
      }
    }
    ]
    __db.mongo.__custom_aggregate(__constants.DB_NAME, __constants.ENTITY_NAME.CAMPAIGNAME_SUMMARY_REPORT, pipeline)
      .then(data => {
        __logger.info('downloadCampaignSummary query Result', { })
        if (data && data.length > 0) {
          return downloadSummary.resolve(data)
        } else {
          return downloadSummary.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('error in downloadCampaignSummary: ', err)
        downloadSummary.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return downloadSummary.promise
  }

  downloadTemplateSummary (wabaPhoneNumber, startDate, endDate) {
    __logger.info('inside downloadTemplateSummary', startDate, endDate, wabaPhoneNumber)

    const downloadSummary = q.defer()
    const pipeline = [{
      $match: {
        wabaPhoneNumber: wabaPhoneNumber,
        createdOn: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }
    },
    {
      $project: {
        'Template id': '$campaignName',
        'Template Name': '$templateName',
        'Phone Number': '$wabaPhoneNumber',
        'Total Sent': '$totalMessageSent',
        'Total Inprocess': '$totalMessageInProcess',
        'Total Resource Allocated': '$totalMessageResourceAllocated',
        'Total Forwarded': '$totalMessageForwarded',
        'Total Seen': '$totalMessageSeen',
        'Total Deleted': '$totalMessageDeleted',
        'Total Accepted': '$totalMessageAccepted',
        'Total Failed': '$totalMessageFailed',
        'Total Pending': '$totalMessagePending',
        'Total Rejected': '$totalMessageRejected',
        'Delivered Message': '$totalMessageDelivered',
        'Deliverey Percentage': '$deliveredPercentage',
        'Date (MM/DD/YYYY)': { $dateToString: { format: '%m/%d/%Y', date: '$createdOn' } }
      }
    }
    ]
    __db.mongo.__custom_aggregate(__constants.DB_NAME, __constants.ENTITY_NAME.TEMEPLATE_SUMMARY, pipeline)
      .then(data => {
        __logger.info('downloadTemplateSummary query Result', { })
        if (data && data.length > 0) {
          return downloadSummary.resolve(data)
        } else {
          return downloadSummary.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('error in downloadTemplateSummary: ', err)
        downloadSummary.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return downloadSummary.promise
  }

  downloadUserConversationSummary (wabaPhoneNumber, startDate, endDate) {
    __logger.info('inside downloadUserConversationSummary', startDate, endDate, wabaPhoneNumber)
    const downloadSummary = q.defer()
    const pipeline = [{
      $match: {
        wabaPhoneNumber: wabaPhoneNumber,
        createdOn: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }
    },
    {
      $project: {
        'Countru Name': '$countryName',
        'Phone Number': '$wabaPhoneNumber',
        'User Initiated': '$userInitiated',
        'Business Initiated': '$businessInitiated',
        'Referral Conversion': '$referralConversion',
        'Not Applicable': '$notApplicable',
        'Total Count': '$totalcount',
        'Date (MM/DD/YYYY)': { $dateToString: { format: '%m/%d/%Y', date: '$createdOn' } }
      }
    }
    ]
    __db.mongo.__custom_aggregate(__constants.DB_NAME, __constants.ENTITY_NAME.CONVERSATION_SUMMARY, pipeline)
      .then(data => {
        __logger.info('downloadUserConversationSummary query Result', { })
        if (data && data.length > 0) {
          return downloadSummary.resolve(data)
        } else {
          return downloadSummary.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('error in downloadUserConversationSummary: ', err)
        downloadSummary.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return downloadSummary.promise
  }
}

module.exports = MessageReportsServices
