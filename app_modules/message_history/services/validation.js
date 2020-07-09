const q = require('q')
const _ = require('lodash')
const Validator = require('jsonschema').Validator
const v = new Validator()
const __constants = require('../../../config/constants')

class validate {
  checkMessageIdExistService (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/checkMessageIdExist',
      type: 'object',
      required: true,
      properties: {
        messageId: {
          type: 'string',
          required: true,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/checkMessageIdExist')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      formatedError.push(formatedErr[formatedErr.length - 1])
    })
    if (formatedError.length > 0) {
      isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      isvalid.resolve(request)
    }
    return isvalid.promise
  }

  addMessageHistory (request) {
    const isvalid = q.defer()

    const schema = {
      id: '/addMessageHistoryData',
      type: 'object',
      required: true,
      properties: {
        messageId: {
          type: 'string',
          required: true,
          minLength: 1
        },
        serviceProviderId: {
          type: 'string',
          required: true,
          minLength: 1
        },
        deliveryChannel: {
          type: 'string',
          required: false,
          minLength: 1
        },
        statusTime: {
          type: 'string',
          required: true,
          minLength: 1
        },
        state: {
          type: 'string',
          required: true,
          minLength: 1
        },
        endConsumerNumber: {
          type: 'string',
          required: false,
          minLength: 1
        },
        businessNumber: {
          type: 'string',
          required: false,
          minLength: 1
        }

      }
    }

    const formatedError = []
    v.addSchema(schema, '/addMessageHistoryData')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      formatedError.push(formatedErr[formatedErr.length - 1])
    })
    if (formatedError.length > 0) {
      isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      isvalid.resolve(request)
    }
    return isvalid.promise
  }
}

module.exports = validate
