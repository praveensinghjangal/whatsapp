const q = require('q')
const _ = require('lodash')
const __db = require('../../../lib/db')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const StatusService = require('../../templates/services/status')

const callCompareAndUpdateStatusInBulk = (wipTicketList) => {
  let p = q()
  const thePromises = []
  const statusService = new StatusService()
  wipTicketList.forEach(singleUserTicketList => {
    p = p.then(() => statusService.compareAndUpdateStatus(singleUserTicketList.templateArray, singleUserTicketList.service_provider_id, singleUserTicketList.wabaNumber, singleUserTicketList.user_id, singleUserTicketList.maxTpsToProvider))
      .catch(err => {
        if (err && typeof err === 'object') err.valid = false
        return err
      })
    thePromises.push(p)
  })
  return q.all(thePromises)
}

const getWipTicketListPerUser = () => {
  const wipTicketList = q.defer()
  const query = `select  group_concat(mt.message_template_id separator ',') as "templateArray", wi.user_id, CONCAT(wi.phone_code,wi.phone_number) as "wabaNumber", wi.service_provider_id , wi.max_tps_to_provider as "maxTpsToProvider"
from message_template mt
join waba_information wi on wi.waba_information_id = mt.waba_information_id and wi.is_active = 1
where mt.is_active = 1 and wi.service_provider_id is not null and
(mt.first_localization_status in ('${__constants.TEMPLATE_STATUS.partiallyApproved.statusCode}','${__constants.TEMPLATE_STATUS.submitted.statusCode}','${__constants.TEMPLATE_STATUS.pending.statusCode}') or 
mt.second_localization_status in ('${__constants.TEMPLATE_STATUS.partiallyApproved.statusCode}','${__constants.TEMPLATE_STATUS.submitted.statusCode}','${__constants.TEMPLATE_STATUS.pending.statusCode}'))
GROUP By wi.user_id `
  __logger.info('SCHEDULER::udateTicketStatus::Inside scheduler fuction to update status')
  __db.mysql.query(__constants.HW_MYSQL_NAME, query, [])
    .then(result => {
      if (result && result.length > 0) {
        _.each(result, singleRow => { singleRow.templateArray = singleRow.templateArray.split(',') })
        __logger.info('SCHEDULER::udateTicketStatus::db dataaaaaaaa', result)
        return wipTicketList.resolve(result)
      } else {
        return wipTicketList.reject({ type: __constants.RESPONSE_MESSAGES.CATEGORY_MAPPING_NOT_FOUND, err: {} })
      }
    })
    .catch(err => {
      __logger.error('SCHEDULER::udateTicketStatus::getWipTicketListPerUser error: ', err)
      wipTicketList.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
  return wipTicketList.promise
}

module.exports = () => {
  const statusUpdated = q.defer()
  getWipTicketListPerUser()
    .then(wipTicketList => callCompareAndUpdateStatusInBulk(wipTicketList))
    .then(result => {
      __logger.info('SCHEDULER::udateTicketStatus::After bulk processing', result)
      const invalidReq = _.filter(result, { valid: false })
      if (invalidReq.length > 0) {
        return statusUpdated.reject({ type: __constants.RESPONSE_MESSAGES.ALL_STATUS_NOT_UPDATED, err: invalidReq })
      } else {
        return statusUpdated.resolve(true)
      }
    })
    .catch(err => {
      __logger.error('SCHEDULER::udateTicketStatus::error: ', err)
      statusUpdated.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
  return statusUpdated.promise
}
