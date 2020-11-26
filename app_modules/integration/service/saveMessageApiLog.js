const q = require('q')
const _ = require('lodash')
const __db = require('../../../lib/db')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const Validator = require('jsonschema').Validator
const v = new Validator()
const TrimService = require('../../../lib/trimService/trim')
const trimInput = new TrimService()

const validateInput = input => {
  const isvalid = q.defer()
  const schema = {
    id: '/saveMessageApiLog',
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
      serviceProviderId: {
        type: 'string',
        required: true,
        minLength: 1
      },
      apiName: {
        type: 'string',
        required: true,
        minLength: 1
      },
      request: {
        type: 'object',
        required: true,
        minProperties: 1
      },
      response: {
        type: 'object',
        required: true,
        minProperties: 1
      },
      toPhoneNo: {
        type: 'string',
        required: true,
        minLength: 1
      }
    }
  }
  const formatedError = []
  v.addSchema(schema, '/saveMessageApiLog')
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

module.exports = (vivaMessageId, serviceProviderMessageId, serviceProviderId, apiName, request, response, toPhoneNo) => {
  const historyStored = q.defer()
  const query = `insert into service_provider_message_api_log(viva_message_id,service_provider_message_id,service_provider_id,api_name,request,response,to_number)
  values (?,?,?,?,?,?,?)`
  __logger.info('saveeeeeeeeeeeeeeeeee', vivaMessageId, serviceProviderMessageId, serviceProviderId, apiName, request, response, toPhoneNo)
  __logger.info('Inside function to store api log in apilog table', vivaMessageId, serviceProviderMessageId)
  validateInput({ vivaMessageId, serviceProviderMessageId, serviceProviderId, apiName, request, response, toPhoneNo })
    .then(validData => __db.mysql.query(__constants.HW_MYSQL_NAME, query, [vivaMessageId, serviceProviderMessageId, serviceProviderId, apiName, JSON.stringify(request), JSON.stringify(response), toPhoneNo]))
    .then(result => {
      __logger.info('result then 2', { result })
      if (result && result.affectedRows && result.affectedRows > 0) {
        historyStored.resolve(true)
      } else {
        historyStored.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
      }
    })
    .catch(err => {
      __logger.error('error: ', err)
      historyStored.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
    })
  return historyStored.promise
}
