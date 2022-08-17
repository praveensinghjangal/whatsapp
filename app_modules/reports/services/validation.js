const q = require('q')
const _ = require('lodash')
const Validator = require('jsonschema').Validator
const v = new Validator()
const __constants = require('../../../config/constants')
const TrimService = require('../../../lib/trimService/trim')
const trimInput = new TrimService()

class validate {
  deliveryReport (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/deliveryReport',
      type: 'object',
      required: true,
      properties: {
        consumerNumber: {
          type: 'string',
          required: false,
          minLength: 6,
          maxLength: 15,
          pattern: __constants.VALIDATOR.number
        },
        messageId: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 50
        },
        campaignName: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 50
        },
        startDate: {
          type: 'string',
          required: true,
          pattern: __constants.VALIDATOR.timeStamp
        },
        endDate: {
          type: 'string',
          required: true,
          pattern: __constants.VALIDATOR.timeStamp,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/deliveryReport')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      const regexPatternPreetyMessage = formatedErr[1].split(' "^')[0].replace('does not match pattern', '- invalid date format- use yyyy-mm-dd hh:MM:ss')
      formatedError.push(regexPatternPreetyMessage)
    })
    if (formatedError.length > 0) {
      isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      if (request.startDate > request.endDate) {
        formatedError.push('startDate can not be greater than endDate!')
      }
      if (formatedError.length > 0) {
        isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
      } else {
        trimInput.singleInputTrim(request)
        request.startDate = decodeURI(request.startDate)
        request.endDate = decodeURI(request.endDate)
        isvalid.resolve(request)
      }
    }
    return isvalid.promise
  }

  campaignSummaryReport (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/campaignSummaryReport',
      type: 'object',
      required: true,
      properties: {
        campaignName: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 50
        },
        startDate: {
          type: 'string',
          required: true,
          pattern: __constants.VALIDATOR.timeStamp
        },
        endDate: {
          type: 'string',
          required: true,
          pattern: __constants.VALIDATOR.timeStamp,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/campaignSummaryReport')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      const regexPatternPreetyMessage = formatedErr[1].split(' "^')[0].replace('does not match pattern', '- invalid date format- use yyyy-mm-dd hh:MM:ss')
      formatedError.push(regexPatternPreetyMessage)
    })
    if (formatedError.length > 0) {
      isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      if (request.startDate > request.endDate) {
        formatedError.push('startDate can not be greater than endDate!')
      }
      if (formatedError.length > 0) {
        isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
      } else {
        trimInput.singleInputTrim(request)
        request.startDate = decodeURI(request.startDate)
        request.endDate = decodeURI(request.endDate)
        isvalid.resolve(request)
      }
    }
    return isvalid.promise
  }

  templateSummaryReport (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/templateSummaryReport',
      type: 'object',
      required: true,
      properties: {
        templateId: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 50
        },
        templateName: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 50
        },
        startDate: {
          type: 'string',
          required: false,
          pattern: __constants.VALIDATOR.timeStamp
        },
        endDate: {
          type: 'string',
          required: false,
          pattern: __constants.VALIDATOR.timeStamp,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/templateSummaryReport')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      const regexPatternPreetyMessage = formatedErr[1].split(' "^')[0].replace('does not match pattern', '- invalid date format- use yyyy-mm-dd hh:MM:ss')
      formatedError.push(regexPatternPreetyMessage)
    })
    if (formatedError.length > 0) {
      isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      if (request.startDate > request.endDate) {
        formatedError.push('startDate can not be greater than endDate!')
      }
      if (formatedError.length > 0) {
        isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
      } else {
        trimInput.singleInputTrim(request)
        request.startDate = decodeURI(request.startDate)
        request.endDate = decodeURI(request.endDate)
        isvalid.resolve(request)
      }
    }
    return isvalid.promise
  }

  usserWiseSummaryReport (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/usserWiseSummaryReport',
      type: 'object',
      required: true,
      properties: {
        countryName: {
          type: 'string',
          required: false
        },
        limit: {
          type: 'string',
          required: false,
          pattern: __constants.VALIDATOR.number
        },
        page: {
          type: 'string',
          required: false,
          pattern: __constants.VALIDATOR.number
        }
      },
      oneOf: [
        {
          required:
            ['resourceId']
        },
        {
          required:
            ['systemId']
        }
      ],
      additionalProperties: false
    }
    const formatedError = []
    v.addSchema(schema, '/usserWiseSummaryReport')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      console.log('formatedErr', formatedErr)
      if (err.includes('instance is not any of')) {
        formatedError.push('Please provide atleast one field resourceId, systemId')
      } else if (err.includes('instance is not exactly one from [subschema 0],[subschema 1]')) {
        formatedError.push('Please provide either  resourceId or  systemId')
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
