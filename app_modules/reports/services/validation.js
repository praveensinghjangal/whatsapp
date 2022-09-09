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
          minLength: 6,
          maxLength: 15,
          pattern: __constants.VALIDATOR.number
        },
        messageId: {
          type: 'string',
          minLength: 1,
          maxLength: 50
        },
        status: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'string',
            minLength: 1,
            maxLength: 50
          }
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
      }
    }
    const formatedError = []
    v.addSchema(schema, '/deliveryReport')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      if (err.includes('does not match pattern "^[0-9]+$"')) {
        var regexPatternPreetyPaginationMessage = formatedErr[1].split(' "^')[0].replace('does not match pattern', '- invalid number')
        formatedError.push(regexPatternPreetyPaginationMessage)
      } else if (err.includes('does not match pattern "^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$"')) {
        var regexPatternPreetyMessage = formatedErr[1].split(' "^')[0].replace('does not match pattern', '- invalid date format- use yyyy-mm-dd hh:MM:ss')
        formatedError.push(regexPatternPreetyMessage)
      } else {
        formatedError.push(formatedErr[formatedErr.length - 1])
      }
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
      }
    }
    const formatedError = []
    v.addSchema(schema, '/campaignSummaryReport')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      if (err.includes('does not match pattern "^[0-9]+$"')) {
        var regexPatternPreetyPaginationMessage = formatedErr[1].split(' "^')[0].replace('does not match pattern', '- invalid number')
        formatedError.push(regexPatternPreetyPaginationMessage)
      } else if (err.includes('does not match pattern "^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$"')) {
        var regexPatternPreetyMessage = formatedErr[1].split(' "^')[0].replace('does not match pattern', '- invalid date format- use yyyy-mm-dd hh:MM:ss')
        formatedError.push(regexPatternPreetyMessage)
      } else {
        formatedError.push(formatedErr[formatedErr.length - 1])
      }
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
          minLength: 1,
          maxLength: 50
        },
        templateName: {
          type: 'string',
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
      }
    }
    const formatedError = []
    v.addSchema(schema, '/templateSummaryReport')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      if (err.includes('does not match pattern "^[0-9]+$"')) {
        var regexPatternPreetyPaginationMessage = formatedErr[1].split(' "^')[0].replace('does not match pattern', '- invalid number')
        formatedError.push(regexPatternPreetyPaginationMessage)
      } else if (err.includes('does not match pattern "^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$"')) {
        var regexPatternPreetyMessage = formatedErr[1].split(' "^')[0].replace('does not match pattern', '- invalid date format- use yyyy-mm-dd hh:MM:ss')
        formatedError.push(regexPatternPreetyMessage)
      } else {
        formatedError.push(formatedErr[formatedErr.length - 1])
      }
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
          type: 'array',
          required: true,
          minItems: 1,
          items: {
            type: 'string',
            minLength: 1,
            maxLength: 50
          }
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

  userConversationReport (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/userConversationReport',
      type: 'object',
      required: true,
      properties: {
        countryName: {
          type: 'array',
          required: false,
          items: {
            type: 'string',
            required: false,
            maxLength: 50
          }
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
        },
        limit: {
          type: 'number',
          required: false,
          pattern: __constants.VALIDATOR.number
        },
        page: {
          type: 'number',
          required: false,
          pattern: __constants.VALIDATOR.number
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/userConversationReport')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      if (err.includes('does not match pattern "^[0-9]+$"')) {
        var regexPatternPreetyPaginationMessage = formatedErr[1].split(' "^')[0].replace('does not match pattern', '- invalid number')
        formatedError.push(regexPatternPreetyPaginationMessage)
      } else if (err.includes('does not match pattern "^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$"')) {
        var regexPatternPreetyMessage = formatedErr[1].split(' "^')[0].replace('does not match pattern', '- invalid date format- use yyyy-mm-dd hh:MM:ss')
        formatedError.push(regexPatternPreetyMessage)
      } else {
        formatedError.push(formatedErr[formatedErr.length - 1])
      }
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

  downloadDlr (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/downloadDlr',
      type: 'object',
      required: true,
      properties: {
        startDate: {
          type: 'string',
          required: true,
          pattern: __constants.VALIDATOR.timeStampSummary,
          minLength: 1
        },
        endDate: {
          type: 'string',
          required: true,
          pattern: __constants.VALIDATOR.timeStampSummary,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/downloadDlr')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      if (err.includes('^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])T(2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9].[0-9][0-9][0-9]$')) {
        var regexPatternPreetyPaginationMessage = formatedErr[1].split(' "^')[0].replace('does not match pattern', '- invalid date')
        formatedError.push(regexPatternPreetyPaginationMessage)
      // } else if (err.includes('does not match pattern "^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$"')) {
      //   var regexPatternPreetyMessage = formatedErr[1].split(' "^')[0].replace('does not match pattern', '- invalid date format- use yyyy-mm-dd hh:MM:ss')
      //   formatedError.push(regexPatternPreetyMessage)
      } else {
        formatedError.push(formatedErr[formatedErr.length - 1])
      }
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
}

module.exports = validate
