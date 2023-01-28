const q = require('q')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const encrypyDecrypt = require('encrypy-decrypt')
const mongoConfig = require('../../../config/keysToEncrypt.json')

class MessageReportsServices {
  getDeliveryReportByMessageId (messageId, startDate, endDate, wabaPhoneNumber, limit, offset) {
    __logger.info('dbData: getDeliveryReportByMessageId():', startDate, endDate, wabaPhoneNumber, limit, offset)
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
          { $limit: limit },
          { $sort: { createdOn: 1 } }
        ],
        totalCount: [
          { $count: 'count' }
        ]
      }
    }
    ]
    __db.mongo.__custom_aggregate(__constants.DB_NAME, __constants.ENTITY_NAME.MESSAGES, pineLine)
      .then(result => {
        if (result && result[0] && result[0].totalCount.length > 0) {
          doesDeliveryReportExists.resolve(result)
        } else {
          return doesDeliveryReportExists.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('dbData: getDeliveryReportByMessageId(): ', err)
        doesDeliveryReportExists.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return doesDeliveryReportExists.promise
  }

  getDeliveryReportByConsumerNumber (consumerNumber, startDate, endDate, wabaPhoneNumber, limit, offset) {
    __logger.info('dbData: getDeliveryReportByConsumerNumber():', consumerNumber, startDate, endDate, wabaPhoneNumber, limit, offset)
    var phoneNumber = encrypyDecrypt.encryptKeysInObj({ senderPhoneNumber: consumerNumber }, mongoConfig[__constants.ENTITY_NAME.MESSAGES])
    const doesDeliveryReportByConsumerNumberExists = q.defer()
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
          { $limit: limit },
          { $sort: { createdOn: 1 } }
        ],
        totalCount: [
          { $count: 'count' }
        ]
      }
    }
    ]
    __db.mongo.__custom_aggregate(__constants.DB_NAME, __constants.ENTITY_NAME.MESSAGES, pineLine)
      .then(result => {
        if (result && result[0] && result[0].totalCount.length > 0) {
          doesDeliveryReportByConsumerNumberExists.resolve(result)
        } else {
          return doesDeliveryReportByConsumerNumberExists.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('dbData: getDeliveryReportByConsumerNumber(): ', err)
        doesDeliveryReportByConsumerNumberExists.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return doesDeliveryReportByConsumerNumberExists.promise
  }

  getDeliveryReportByStatus (status, startDate, endDate, wabaPhoneNumber, limit, offset) {
    __logger.info('dbData: getDeliveryReportByStatus():', status, wabaPhoneNumber, limit, offset)
    const doesDeliveryReportByStatusExists = q.defer()
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
          { $limit: limit },
          { $sort: { createdOn: 1 } }
        ],
        totalCount: [
          { $count: 'count' }
        ]
      }
    }
    ]
    __db.mongo.__custom_aggregate(__constants.DB_NAME, __constants.ENTITY_NAME.MESSAGES, pineLine)
      .then(result => {
        if (result && result[0] && result[0].totalCount.length > 0) {
          doesDeliveryReportByStatusExists.resolve(result)
        } else {
          return doesDeliveryReportByStatusExists.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('dbData: getDeliveryReportByStatus(' + wabaPhoneNumber + '): ', err)
        doesDeliveryReportByStatusExists.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return doesDeliveryReportByStatusExists.promise
  }

  getDeliveryReportByCampaignName (campaignName, startDate, endDate, wabaPhoneNumber, limit, offset) {
    __logger.info('dbData: getDeliveryReportByCampaignName', campaignName, wabaPhoneNumber, limit, offset)
    const doesDeliveryReportByStatusExists = q.defer()
    const pineLine = [{
      $match: {
        wabaPhoneNumber: wabaPhoneNumber,
        createdOn: { $gte: new Date(startDate), $lte: new Date(endDate) },
        campName: campaignName
      }
    },
    {
      $facet: {
        data: [
          { $skip: offset },
          { $limit: limit },
          { $sort: { createdOn: 1 } }
        ],
        totalCount: [
          { $count: 'count' }
        ]
      }
    }
    ]
    __db.mongo.__custom_aggregate(__constants.DB_NAME, __constants.ENTITY_NAME.MESSAGES, pineLine)
      .then(result => {
        if (result && result[0] && result[0].totalCount.length > 0) {
          doesDeliveryReportByStatusExists.resolve(result)
        } else {
          return doesDeliveryReportByStatusExists.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('dbData: getDeliveryReportByCampaignName: ', err)
        doesDeliveryReportByStatusExists.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return doesDeliveryReportByStatusExists.promise
  }

  getDeliveryReportByDate (startDate, endDate, wabaPhoneNumber, limit, offset) {
    __logger.info('dbData: getDeliveryReportByDate', startDate, endDate, wabaPhoneNumber, limit, offset)
    const doesDeliveryReportByDateExists = q.defer()
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
          { $limit: limit },
          { $sort: { createdOn: 1 } }
        ],
        totalCount: [
          { $count: 'count' }
        ]
      }
    }
    ]
    __db.mongo.__custom_aggregate(__constants.DB_NAME, __constants.ENTITY_NAME.MESSAGES, pineLine)
      .then(result => {
        if (result && result[0] && result[0].totalCount.length > 0) {
          doesDeliveryReportByDateExists.resolve(result)
        } else {
          return doesDeliveryReportByDateExists.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('dbData: getDeliveryReportByDate: ', err)
        doesDeliveryReportByDateExists.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return doesDeliveryReportByDateExists.promise
  }

  getCampaignSummaryReportByCampaignName (campaignName, startDate, endDate, wabaPhoneNumber, limit, offset) {
    __logger.info('dbData: getCampaignSummaryReportByCampaignName', campaignName, startDate, endDate, limit, offset, wabaPhoneNumber)
    const doesCampaignSummaryReportByCampaignNameExists = q.defer()
    const pineLine = [{
      $match: {
        wabaPhoneNumber: wabaPhoneNumber,
        summaryDate: { $gte: startDate, $lte: endDate },
        campaignName: campaignName
      }
    },
    {
      $facet: {
        data: [
          { $skip: offset },
          { $limit: limit },
          { $sort: { summaryDate: 1 } }
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
          doesCampaignSummaryReportByCampaignNameExists.resolve(data)
        } else {
          return doesCampaignSummaryReportByCampaignNameExists.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('dbData: getCampaignSummaryReportByCampaignName: ', err)
        doesCampaignSummaryReportByCampaignNameExists.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return doesCampaignSummaryReportByCampaignNameExists.promise
  }

  getCampaignSummaryReportByDate (startDate, endDate, wabaPhoneNumber, limit, offset) {
    __logger.info('dbData: getCampaignSummaryReportByDate', startDate, endDate, wabaPhoneNumber, limit, offset)
    const doesCampaignSummaryReportByDateExists = q.defer()
    const pineLine = [{
      $match: {
        wabaPhoneNumber: wabaPhoneNumber,
        summaryDate: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $facet: {
        data: [
          { $skip: offset },
          { $limit: limit },
          { $sort: { summaryDate: 1 } }
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
          doesCampaignSummaryReportByDateExists.resolve(data)
        } else {
          return doesCampaignSummaryReportByDateExists.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('dbData: getCampaignSummaryReportByDate: ', err)
        doesCampaignSummaryReportByDateExists.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return doesCampaignSummaryReportByDateExists.promise
  }

  getTemplateSummaryReportByTemplateName (templateName, startDate, endDate, wabaPhoneNumber, limit, offset) {
    __logger.info('dbData: getTemplateSummaryReportByTemplateName', templateName, wabaPhoneNumber, limit, offset)
    const doesTemplateSummaryReportByTemplateNameExists = q.defer()
    const pineLine = [{
      $match: {
        wabaPhoneNumber: wabaPhoneNumber,
        summaryDate: { $gte: startDate, $lte: endDate },
        templateName: templateName
      }
    },
    {
      $facet: {
        data: [
          { $skip: offset },
          { $limit: limit },
          { $sort: { summaryDate: 1 } }
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
          doesTemplateSummaryReportByTemplateNameExists.resolve(data)
        } else {
          return doesTemplateSummaryReportByTemplateNameExists.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('dbData: getTemplateSummaryReportByTemplateName: ', err)
        doesTemplateSummaryReportByTemplateNameExists.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return doesTemplateSummaryReportByTemplateNameExists.promise
  }

  getTemplateSummaryReportByDate (startDate, endDate, wabaPhoneNumber, limit, offset) {
    __logger.info('dbData: getTemplateSummaryReportByDate', startDate, endDate, wabaPhoneNumber, limit, offset)
    const doesTemplateSummaryReportByDateExists = q.defer()
    const pineLine = [{
      $match: {
        wabaPhoneNumber: wabaPhoneNumber,
        summaryDate: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $facet: {
        data: [
          { $skip: offset },
          { $limit: limit },
          { $sort: { summaryDate: 1 } }
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
          doesTemplateSummaryReportByDateExists.resolve(data)
        } else {
          return doesTemplateSummaryReportByDateExists.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('dbData: getTemplateSummaryReportByDate: ', err)
        doesTemplateSummaryReportByDateExists.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return doesTemplateSummaryReportByDateExists.promise
  }

  getTemplateSummaryReportByTemplateId (templateId, startDate, endDate, wabaPhoneNumber, limit, offset) {
    __logger.info('dbData: getTemplateSummaryReportByTemplateId', templateId, wabaPhoneNumber, limit, offset)
    const doesTemplateSummaryReportByTemplateIdExists = q.defer()
    const pineLine = [{
      $match: {
        wabaPhoneNumber: wabaPhoneNumber,
        summaryDate: { $gte: startDate, $lte: endDate },
        templateId: templateId
      }
    },
    {
      $facet: {
        data: [
          { $skip: offset },
          { $limit: limit },
          { $sort: { summaryDate: 1 } }
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
          doesTemplateSummaryReportByTemplateIdExists.resolve(data)
        } else {
          return doesTemplateSummaryReportByTemplateIdExists.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('dbData: getTemplateSummaryReportByTemplateId: ', err)
        doesTemplateSummaryReportByTemplateIdExists.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return doesTemplateSummaryReportByTemplateIdExists.promise
  }

  // getUserWiseSummaryCount (wabaPhoneNumber, limit, offset) {
  //   __logger.info('dbData: getusserWiseSummaryCount', wabaPhoneNumber, limit, offset)
  //   const doesUserWiseSummaryCountExists = q.defer()
  //   __db.mysqlMis.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.getusserWiseSummaryCount(), [wabaPhoneNumber, limit, offset, wabaPhoneNumber])
  //     .then(result => {
  //       __logger.info('getusserWiseSummaryCount query Result', { result })
  //       if (result && result[0].length > 0) {
  //         return doesUserWiseSummaryCountExists.resolve(result)
  //       } else {
  //         return doesUserWiseSummaryCountExists.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
  //       }
  //     })
  //     .catch(err => {
  //       __logger.error('dbData: getTemplateSummaryReportByTemplateId: ', err)
  //       doesUserWiseSummaryCountExists.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
  //     })
  //   return doesUserWiseSummaryCountExists.promise
  // }

  // getUserWiseSummaryCountBasedOncountryName (wabaPhoneNumber, countryName, limit, offset) {
  //   __logger.info('dbData: getUserWiseSummaryCountBasedOncountryName', countryName, wabaPhoneNumber, limit, offset)
  //   const doesUserWiseSummaryCountBasedOncountryNameExists = q.defer()
  //   __db.mysqlMis.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.getUserWiseSummaryCountBasedOncountryName(), [wabaPhoneNumber, countryName, limit, offset, wabaPhoneNumber, countryName])
  //     .then(result => {
  //       __logger.info('getUserWiseSummaryCountBasedOncountryName query Result', { result })
  //       if (result && result[0].length > 0) {
  //         return doesUserWiseSummaryCountBasedOncountryNameExists.resolve(result)
  //       } else {
  //         return doesUserWiseSummaryCountBasedOncountryNameExists.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
  //       }
  //     })
  //     .catch(err => {
  //       __logger.error('dbData: getUserWiseSummaryCountBasedOncountryName: ', err)
  //       doesUserWiseSummaryCountBasedOncountryNameExists.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
  //     })
  //   return doesUserWiseSummaryCountBasedOncountryNameExists.promise
  // }

  // getusserWiseSummaryCountBasedOnDate (wabaPhoneNumber, limit, offset, startDate, endDate) {
  //   __logger.info('dbData: getusserWiseSummaryCountBasedOnDate', wabaPhoneNumber, limit, offset, startDate, endDate)
  //   const getusserWiseSummaryCountBasedOnDate = q.defer()
  //   __db.mysqlMis.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.getusserWiseSummaryCountBasedOnDate(), [wabaPhoneNumber, startDate, endDate, limit, offset, wabaPhoneNumber, startDate, endDate])
  //     .then(result => {
  //       __logger.info('getusserWiseSummaryCount query Result', { result })
  //       if (result && result[0].length > 0) {
  //         return getusserWiseSummaryCountBasedOnDate.resolve(result)
  //       } else {
  //         return getusserWiseSummaryCountBasedOnDate.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
  //       }
  //     })
  //     .catch(err => {
  //       __logger.error('dbData: getTemplateSummaryReportByTemplateId: ', err)
  //       getusserWiseSummaryCountBasedOnDate.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
  //     })
  //   return getusserWiseSummaryCountBasedOnDate.promise
  // }

  getuserConversationReportCountBasedOncountryName (wabaPhoneNumber, countryName, startDate, endDate, limit, offset) {
    const doesUserConversationReportCountBasedOncountryNameExists = q.defer()
    const pineLine = [{
      $match: {
        wabaPhoneNumber: wabaPhoneNumber,
        summaryDate: { $gte: startDate, $lte: endDate },
        countryName: { $in: countryName }
      }
    },
    {
      $facet: {
        data: [
          { $skip: offset },
          { $limit: limit },
          { $sort: { summaryDate: 1 } }
        ],
        totalCount: [
          { $count: 'count' }
        ]
      }
    }
    ]
    __db.mongo.__custom_aggregate(__constants.DB_NAME, __constants.ENTITY_NAME.CONVERSATION_SUMMARY, pineLine)
      .then(data => {
        if (data && data[0] && data[0].totalCount.length > 0) {
          return doesUserConversationReportCountBasedOncountryNameExists.resolve(data)
        } else {
          return doesUserConversationReportCountBasedOncountryNameExists.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('dbData: getuserConversationReportCountBasedOncountryName: ', err)
        doesUserConversationReportCountBasedOncountryNameExists.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return doesUserConversationReportCountBasedOncountryNameExists.promise
  }

  getuserConversationReportCountBasedOnDate (wabaPhoneNumber, limit, offset, startDate, endDate) {
    const doesUserConversationReportCountBasedOnDateExists = q.defer()
    const pineLine = [{
      $match: {
        wabaPhoneNumber: wabaPhoneNumber,
        summaryDate: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $facet: {
        data: [
          { $skip: offset },
          { $limit: limit },
          { $sort: { summaryDate: 1 } }
        ],
        totalCount: [
          { $count: 'count' }
        ]
      }
    }
    ]
    __db.mongo.__custom_aggregate(__constants.DB_NAME, __constants.ENTITY_NAME.CONVERSATION_SUMMARY, pineLine)
      .then(data => {
        if (data && data[0] && data[0].totalCount.length > 0) {
          return doesUserConversationReportCountBasedOnDateExists.resolve(data)
        } else {
          return doesUserConversationReportCountBasedOnDateExists.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('dbData: getuserConversationReportCountBasedOnDate: ', err)
        doesUserConversationReportCountBasedOnDateExists.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return doesUserConversationReportCountBasedOnDateExists.promise
  }

  downloadCampaignSummary (wabaPhoneNumber, startDate, endDate) {
    __logger.info('dbData: downloadCampaignSummary', startDate, endDate, wabaPhoneNumber)

    const doesDownloadCampaignSummaryExists = q.defer()
    const pipeline = [{
      $match: {
        wabaPhoneNumber: wabaPhoneNumber,
        summaryDate: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $project: {
        'Campaign Name': '$campaignName',
        'Phone Number': '$wabaPhoneNumber',
        'Total Sent': '$totalSent',
        'Total Preprocess': '$totalPreprocess',
        'Total Inprocess': '$totalInprocess',
        'Total Resource Allocated': '$totalResourceAllocated',
        'Total Forwarded': '$totalForwarded',
        'Total Accepted': '$totalAccepted',
        'Total Delivered Message': '$deliveredMessage',
        'Total Failed': '$totalFailed',
        'Total Rejected': '$totalRejected',
        'Total Seen': '$totalSeen',
        'Delivery Percentage': '$delivereyPercentage',
        'Date (MM/DD/YYYY)': { $dateToString: { format: '%m/%d/%Y', date: { $dateFromString: { format: '%Y-%m-%d', dateString: '$summaryDate' } } } },
        _id: 0
      }
    },
    { $sort: { 'Date (MM/DD/YYYY)': 1 } }
    ]
    __db.mongo.__custom_aggregate(__constants.DB_NAME, __constants.ENTITY_NAME.CAMPAIGNAME_SUMMARY_REPORT, pipeline)
      .then(data => {
        if (data && data.length > 0) {
          return doesDownloadCampaignSummaryExists.resolve(data)
        } else {
          return doesDownloadCampaignSummaryExists.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('dbData: downloadCampaignSummary: ', err)
        doesDownloadCampaignSummaryExists.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return doesDownloadCampaignSummaryExists.promise
  }

  downloadTemplateSummary (wabaPhoneNumber, startDate, endDate) {
    __logger.info('dbData: downloadTemplateSummary', startDate, endDate, wabaPhoneNumber)

    const doesDownloadTemplateSummaryExists = q.defer()
    const pipeline = [{
      $match: {
        wabaPhoneNumber: wabaPhoneNumber,
        summaryDate: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $project: {
        'Template id': '$templateId',
        'Template Name': '$templateName',
        'Phone Number': '$wabaPhoneNumber',
        'Total Sent': '$totalMessageSent',
        'Total Preprocess': '$totalMessagePreProcess',
        'Total Inprocess': '$totalMessageInProcess',
        'Total Resource Allocated': '$totalMessageResourceAllocated',
        'Total Forwarded': '$totalMessageForwarded',
        'Total Accepted': '$totalMessageAccepted',
        'Total Delivered Message': '$totalMessageDelivered',
        'Total Failed': '$totalMessageFailed',
        'Total Rejected': '$totalMessageRejected',
        'Total Seen': '$totalMessageSeen',
        'Delivery Percentage': '$deliveredPercentage',
        'Date (MM/DD/YYYY)': { $dateToString: { format: '%m/%d/%Y', date: { $dateFromString: { format: '%Y-%m-%d', dateString: '$summaryDate' } } } },
        _id: 0
      }
    },
    { $sort: { 'Date (MM/DD/YYYY)': 1 } }
    ]
    __db.mongo.__custom_aggregate(__constants.DB_NAME, __constants.ENTITY_NAME.TEMEPLATE_SUMMARY, pipeline)
      .then(data => {
        if (data && data.length > 0) {
          return doesDownloadTemplateSummaryExists.resolve(data)
        } else {
          return doesDownloadTemplateSummaryExists.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('dbData: downloadTemplateSummary: ', err)
        doesDownloadTemplateSummaryExists.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return doesDownloadTemplateSummaryExists.promise
  }

  downloadUserConversationSummary (wabaPhoneNumber, startDate, endDate) {
    __logger.info('dbData: downloadUserConversationSummary', startDate, endDate, wabaPhoneNumber)
    const doesDownloadUserConversationSummaryExists = q.defer()
    const pipeline = [{
      $match: {
        wabaPhoneNumber: wabaPhoneNumber,
        summaryDate: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $project: {
        'Country Name': '$countryName',
        'Phone Number': '$wabaPhoneNumber',
        'User Initiated': '$userInitiated',
        'Business Initiated': '$businessInitiated',
        'Referral Conversion': '$referralConversion',
        'Not Applicable': '$notApplicable',
        'Total Count': '$totalcount',
        'Date (MM/DD/YYYY)': { $dateToString: { format: '%m/%d/%Y', date: { $dateFromString: { format: '%Y-%m-%d', dateString: '$summaryDate' } } } },
        _id: 0
      }
    },
    { $sort: { 'Date (MM/DD/YYYY)': 1 } }
    ]
    __db.mongo.__custom_aggregate(__constants.DB_NAME, __constants.ENTITY_NAME.CONVERSATION_SUMMARY, pipeline)
      .then(data => {
        if (data && data.length > 0) {
          return doesDownloadUserConversationSummaryExists.resolve(data)
        } else {
          return doesDownloadUserConversationSummaryExists.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: [] })
        }
      })
      .catch(err => {
        __logger.error('dbData: downloadUserConversationSummary: ', err)
        doesDownloadUserConversationSummaryExists.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return doesDownloadUserConversationSummaryExists.promise
  }

  getCampaignName (date) {
    const promises = q.defer()
    __logger.info('SCHEDULER::getCampaignName::Inside scheduler fuction get campaign name')

    var findParam = [{
      $match: {
        createdOn: { $gte: new Date(`${date}T00:00:00.000Z`), $lte: new Date(`${date}T23:59:59.999Z`) },
        campName: { $exists: true }
      }
    },
    {
      $group: {
        _id: { currentStatus: '$currentStatus', campaignName: '$campName', wabaPhoneNumber: '$wabaPhoneNumber' },
        date: { $first: '$createdOn' },
        sc: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: { wabaPhoneNumber: '$_id.wabaPhoneNumber', day: '$_id.Date', campaignName: '$_id.campaignName' },
        day: { $min: '$date' },
        totalMessageSent: { $sum: '$sc' },
        status: {
          $push: {
            name: '$_id.currentStatus',
            count: '$sc'
          }
        }
      }
    },
    { $sort: { total: -1 } }]
    __db.mongo.__custom_aggregate(__constants.DB_NAME, __constants.ENTITY_NAME.MESSAGES, findParam)
      .then(result => {
        if (result && result.length > 0) {
          return promises.resolve(result)
        } else {
          return promises.resolve(false)
          // return promises.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: 'SCHEDULER::getCampaignName::Inside scheduler fuction get campaign name' })
        }
      })
      .catch(err => {
        __logger.error('SCHEDULER::get campaign cron::get campaign name & total message cron ~getCampaignName  error: ', err)
        promises.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return promises.promise
  }

  updateCampaignCount (data) {
    const promises = q.defer()
    __logger.info('SCHEDULER :: updateCampaignCount :: updateCampaignCount():')
    __db.mongo.__campaignBulkInsert(__constants.DB_NAME, __constants.ENTITY_NAME.CAMPAIGNAME_SUMMARY_REPORT, data)
      .then(result => {
        if (result && result.ok === 1) {
          return promises.resolve(result)
        } else {
          return promises.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: 'SCHEDULER::updateCampaignCount::Inside scheduler fuction insert campaign records' })
        }
      })
      .catch(err => {
        __logger.error('dbData: updateCampaignCount():', err)
        promises.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return promises.promise
  }

  updateDownloadDlr (data) {
    const promises = q.defer()
    __logger.info('dbData: updateDownloadDlr', data)
    __db.mongo.__update(__constants.DB_NAME, __constants.ENTITY_NAME.DOWNLOAD_STATUS, { filename: data.filename, wabaPhoneNumber: data.wabaPhoneNumber, isActive: '1' }, { DownloadStatus: __constants.DOWNLOAD_STATUS.inProcess, updateOn: new Date() })
      .then(result => {
        if (result && result.result && result.result.ok === 1) {
          return promises.resolve(result)
        } else {
          return promises.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: 'updateDownloadDlr:: Record not updated' })
        }
      })
      .catch(err => {
        __logger.error('dbData: updateDownloadDlr():', err)
        promises.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return promises.promise
  }

  findDlrZipFile () {
    const promises = q.defer()
    __db.mongo.__find(__constants.DB_NAME, __constants.ENTITY_NAME.DOWNLOAD_STATUS, { isActive: '1', updateOn: { $lt: new Date(new Date().setDate(new Date().getDate() - 1)), $gte: new Date(new Date().setDate(new Date().getDate() - 2)) } }, { })
      .then(result => {
        if (result && result.length > 0) {
          return promises.resolve(result)
        } else {
          return promises.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: 'findDlrZipFile:: Record not updated' })
        }
      })
      .catch(err => {
        __logger.error('dbData: findDlrZipFile():', err)
        promises.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return promises.promise
  }

  deleteDlrrecord (data) {
    const promises = q.defer()
    __db.mongo.__removeBulkFile(__constants.DB_NAME, __constants.ENTITY_NAME.DOWNLOAD_STATUS, data)
      .then(result => {
        if (result && result.result && result.result.ok === 1) {
          return promises.resolve(result)
        } else {
          return promises.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: 'deleteDlrrecord:: Record not updated' })
        }
      })
      .catch(err => {
        __logger.error('dbData: deleteDlrrecord:  ', err)
        promises.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return promises.promise
  }
}

module.exports = MessageReportsServices
