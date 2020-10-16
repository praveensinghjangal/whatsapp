const q = require('q')
const _ = require('lodash')
const __db = require('../../../lib/db')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const Validator = require('jsonschema').Validator
const v = new Validator()

const validateInput = input => {
  const isvalid = q.defer()
  const schema = {
    id: '/saveApiLog',
    type: 'object',
    required: true,
    properties: {
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
      }
    }
  }
  const formatedError = []
  v.addSchema(schema, '/saveApiLog')
  const error = _.map(v.validate(input, schema).errors, 'stack')
  _.each(error, function (err) {
    const formatedErr = err.split('.')
    formatedError.push(formatedErr[formatedErr.length - 1])
  })
  if (formatedError.length > 0) {
    isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
  } else {
    isvalid.resolve(input)
  }
  return isvalid.promise
}

module.exports = (serviceProviderId, apiName, request, response = { actualResponse: 'null or undefined' }) => {
  __logger.info('ssssss', apiName.includes('chat-api/v2/messages'))
  const historyStored = q.defer()
  if (apiName.includes('chat-api/v2/messages') === false) {
    const query = `insert into service_provider_api_log(service_provider_id,api_name,request,response)
    values (?,?,?,?)`
    __logger.info('Inside function to store api log in apilog table', serviceProviderId)
    validateInput({ serviceProviderId, apiName, request, response })
      .then(validData => __db.mysql.query(__constants.HW_MYSQL_NAME, query, [serviceProviderId, apiName, JSON.stringify(request), JSON.stringify(response)]))
      .then(result => {
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
}
