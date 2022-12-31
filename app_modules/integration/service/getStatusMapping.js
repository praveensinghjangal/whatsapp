const q = require('q')
const _ = require('lodash')
const __db = require('../../../lib/db')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const Validator = require('jsonschema').Validator
const v = new Validator()
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const TrimService = require('../../../lib/trimService/trim')
const trimInput = new TrimService()

const validateInput = input => {
  const isvalid = q.defer()
  const schema = {
    id: '/getStatusMapping',
    type: 'object',
    required: true,
    properties: {
      serviceProviderStatus: {
        type: 'string',
        required: true,
        minLength: 1
      },
      serviceProviderId: {
        type: 'string',
        required: true,
        minLength: 1
      }
    }
  }
  const formatedError = []
  v.addSchema(schema, '/getStatusMapping')
  const error = _.map(v.validate(input, schema).errors, 'stack')
  _.each(error, function (err) {
    const formatedErr = err.split('.')
    formatedError.push(formatedErr[formatedErr.length - 1])
  })
  if (formatedError.length > 0) {
    __logger.error('getStatusMapping: validatingInput(): formatedError:', formatedError)
    isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
  } else {
    trimInput.singleInputTrim(input)
      .then(data => isvalid.resolve(data))
  }
  return isvalid.promise
}

const setDataInRedis = (serviceProviderStatus, serviceProviderId) => {
  __logger.info('Inside function to set platform Status', { serviceProviderStatus, serviceProviderId })
  const dataSet = q.defer()
  let statusData = {}
  const query = `select message_template_status_id as messageTemplateStatusId, service_provider_status as "serviceProviderStatus"
  from message_template_status_to_service_provider_template_status
  where is_active = 1 and lower(service_provider_status) = ? and service_provider_id = ?`
  __db.mysql.query(__constants.HW_MYSQL_NAME, query, [serviceProviderStatus.toLowerCase(), serviceProviderId])
    .then(result => {
      __logger.info('getStatusMapping: setDataInRedis(): ', result)
      if (result && result.length > 0) {
        statusData = result[0]
        return result[0]
      } else {
        __logger.error('getStatusMapping: setDataInRedis(): Error result not found', result)
        rejectionHandler({ type: __constants.RESPONSE_MESSAGES.STATUS_MAPPING_NOT_FOUND, err: {} })
      }
    })
    .then(data => {
      return __db.redis.setex(serviceProviderStatus.toLowerCase() + '_' + serviceProviderId, JSON.stringify(data), __constants.REDIS_TTL.templateData)
    })
    .then(result => dataSet.resolve(statusData))
    .catch(err => {
      __logger.error('getStatusMapping: setDataInRedis(): Error while setting redis data', err)
      dataSet.reject(err)
    })
  return dataSet.promise
}

const getStatusMappingDataFromRedis = redisKey => {
  const statusMappingData = q.defer()
  __db.redis.get(redisKey)
    .then(data => {
      if (data) {
        statusMappingData.resolve({ exists: true, data: JSON.parse(data) })
      } else {
        statusMappingData.resolve({ exists: false, data: {} })
      }
    })
    .catch(err => {
      __logger.error('getStatusMapping: getStatusMappingDataFromRedis(): catch:', err)
      statusMappingData.reject(err)
    })
  return statusMappingData.promise
}

module.exports = (serviceProviderStatus, serviceProviderId) => {
  const platformStatus = q.defer()
  __logger.info('getStatusMapping:', serviceProviderStatus, serviceProviderId)
  validateInput({ serviceProviderStatus, serviceProviderId })
    .then(validData => getStatusMappingDataFromRedis(serviceProviderStatus.toLowerCase() + '_' + serviceProviderId))
    .then(redisData => {
      if (redisData.exists) {
        return redisData.data
      } else {
        return setDataInRedis(serviceProviderStatus, serviceProviderId)
      }
    })
    .then(redisData => platformStatus.resolve(redisData))
    .catch(err => {
      __logger.error('getStatusMapping: validatingInput: catch:', serviceProviderStatus, serviceProviderId)
      platformStatus.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
  return platformStatus.promise
}
