const q = require('q')
const _ = require('lodash')
const Validator = require('jsonschema').Validator
const v = new Validator()
const __constants = require('../../../../config/constants')
const TrimService = require('../../../../lib/trimService/trim')
const trimInput = new TrimService()
class validate {
  addMasterData (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/addMasterData',
      type: 'object',
      required: true,
      properties: {
        platformName: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 50
        },
        businessId: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 100
        },
        systemUserId: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 100
        },
        systemUserToken: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 1000
        },
        creditLineId: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 100
        }
      },
      additionalProperties: false
    }
    const formatedError = []
    v.addSchema(schema, '/addMasterData')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      formatedError.push(formatedErr[formatedErr.length - 1])
    })
    if (formatedError.length > 0) {
      isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      trimInput.singleInputTrim(request)
        .then(data => isvalid.resolve(data))
    }
    return isvalid.promise
  }

  updateMasterData (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/updateMasterData',
      type: 'object',
      required: true,
      properties: {
        masterdDataId: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 50
        },
        platformName: {
          type: 'string',
          minLength: 1,
          maxLength: 50
        },
        businessId: {
          type: 'string',
          minLength: 1,
          maxLength: 100
        },
        systemUserId: {
          type: 'string',
          minLength: 1,
          maxLength: 100
        },
        systemUserToken: {
          type: 'string',
          minLength: 1,
          maxLength: 1000
        },
        creditLineId: {
          type: 'string',
          minLength: 1,
          maxLength: 100
        }
      },
      anyOf: [
        {
          required:
          ['platformName']
        },
        {
          required:
          ['businessId']
        },
        {
          required:
          ['systemUserId']
        },
        {
          required:
          ['systemUserToken']
        },
        {
          required:
          ['creditLineId']
        }
      ],
      additionalProperties: false
    }
    const formatedError = []
    v.addSchema(schema, '/updateMasterData')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      if (err.includes('instance is not any of')) {
        formatedError.push('Please provide atleast one field ')
      } else {
        formatedError.push(formatedErr[formatedErr.length - 1])
      }
    })
    if (formatedError.length > 0) {
      isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      trimInput.singleInputTrim(request)
        .then(data => isvalid.resolve(data))
    }
    return isvalid.promise
  }
}
module.exports = validate
