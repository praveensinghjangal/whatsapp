const q = require('q')
const _ = require('lodash')
const __db = require('../../../lib/db')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const Validator = require('jsonschema').Validator
const v = new Validator()
const addAudienceAndOptin = require('./audienceAndOptin')
const RedisService = require('../../../lib/redis_service/redisService')
const TrimService = require('../../../lib/trimService/trim')
const trimInput = new TrimService()

const validateInput = input => {
  const isvalid = q.defer()
  const schema = {
    id: '/saveIncomingMessagePayload',
    type: 'object',
    required: true,
    properties: {
      vivaMessageId: {
        type: 'string',
        required: true,
        minLength: 1
      },
      serviceProviderMessageId: {
        type: 'string',
        required: true,
        minLength: 1
      },
      payload: {
        type: 'object',
        required: true,
        minProperties: 1
      },
      fromNumber: {
        type: 'string',
        required: true,
        minLength: 1
      }
    }
  }
  const formatedError = []
  v.addSchema(schema, '/saveIncomingMessagePayload')
  const error = _.map(v.validate(input, schema).errors, 'stack')
  _.each(error, function (err) {
    const formatedErr = err.split('.')
    formatedError.push(formatedErr[formatedErr.length - 1])
  })
  if (formatedError.length > 0) {
    isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
  } else {
    trimInput.singleInputTrim(input)
    .then(data => isvalid.resolve(data))
  }
  return isvalid.promise
}

module.exports = (vivaMessageId, serviceProviderMessageId, payload, fromNumber) => {
  const payloadStored = q.defer()
  const query = `insert into incoming_message_payload(viva_message_id,service_provider_message_id,service_provider_id,payload,from_number)
  values (?,?,?,?,?)`
  __logger.info('Inside function to store incoming message in incoming_message_payload table', vivaMessageId, serviceProviderMessageId)
  let redisData = {}
  const redisService = new RedisService()
  validateInput({ vivaMessageId, serviceProviderMessageId, payload, fromNumber })
    .then(valres => redisService.getWabaDataByPhoneNumber(payload.to))
    .then(data => {
      __logger.info(' then 2', { data })
      redisData = data
      return addAudienceAndOptin(payload, data)
    })
    .then(data => {
      __logger.info(' then 3', { data })
      return __db.mysql.query(__constants.HW_MYSQL_NAME, query, [vivaMessageId, serviceProviderMessageId, redisData.serviceProviderId, JSON.stringify(payload), fromNumber])
    })
    .then(result => {
      __logger.info(' then 34', { result })
      if (result && result.affectedRows && result.affectedRows > 0) {
        payloadStored.resolve(true)
      } else {
        payloadStored.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
      }
    })
    .catch(err => {
      __logger.error('error: ', err)
      payloadStored.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
    })
  return payloadStored.promise
}
