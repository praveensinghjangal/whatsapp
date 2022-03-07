const q = require('q')
const _ = require('lodash')
const Validator = require('jsonschema').Validator
const v = new Validator()
const __constants = require('../../../config/constants')
const TrimService = require('../../../lib/trimService/trim')
const trimInput = new TrimService()

class validate {
  addUpdateOptinAndTemplate (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/addUpdateOptinAndTemplate',
      type: 'object',
      required: true,
      properties: {
        optinText: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 20
        },
        templateId: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 50
        },
        chatDefaultMessage: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 499
        },
        chatDefaultMessageCta: {
          type: 'array',
          required: false,
          maxLength: 3
        },
        serviceFulfillmentMessage: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 499
        },
        serviceFulfillmentMessageCta: {
          type: 'array',
          required: false,
          maxLength: 3
        },
        continuationTransactionMessage: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 499
        },
        continuationTransactionMessageCta: {
          type: 'array',
          required: false,
          maxLength: 2,
          items: {
            type: 'string',
            enum: ['yes', 'no']
          }
        },
        sessionTimeoutMins: {
          type: 'number',
          required: false
        },
        optoutText: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 20
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/addUpdateOptinAndTemplate')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      formatedError.push(formatedErr[formatedErr.length - 1])
    })
    if (request && request.continuationTransactionMessageCta && Array.isArray(request.continuationTransactionMessageCta)) {
      if (request.continuationTransactionMessageCta.includes('yes') && !request.continuationTransactionMessageCta.includes('no')) formatedError.push("please enter both enumm vales i.e 'yes' and 'no'")
      if (request.continuationTransactionMessageCta.includes('no') && !request.continuationTransactionMessageCta.includes('yes')) formatedError.push("please enter both enumm vales i.e 'yes' and 'no'")
    }
    if (formatedError.length > 0) {
      isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      trimInput.singleInputTrim(request)
      isvalid.resolve(request)
    }
    return isvalid.promise
  }

  templateFlowApproval (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/templateFlowApproval',
      type: 'object',
      required: true,
      properties: {
        userId: {
          type: 'string',
          required: true,
          minLength: 1
        },
        type: {
          type: 'string',
          required: true,
          minLength: 1,
          enum: __constants.TEMPLATE_FLOW_APPROVAL
        },
        evaluation: {
          type: 'string',
          required: true,
          minLength: 1
        },
        id: {
          type: 'string',
          required: true,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/templateFlowApproval')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      formatedError.push(formatedErr[formatedErr.length - 1])
    })
    if (formatedError.length > 0) {
      isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      trimInput.singleInputTrim(request)
      isvalid.resolve(request)
    }
    return isvalid.promise
  }

  templateFlowList (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/templateFlowList',
      type: 'object',
      required: true,
      properties: {
        type: {
          type: 'string',
          required: true,
          minLength: 1,
          enum: __constants.TEMPLATE_FLOW_APPROVAL
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/templateFlowList')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      formatedError.push(formatedErr[formatedErr.length - 1])
    })
    if (formatedError.length > 0) {
      isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      trimInput.singleInputTrim(request)
      isvalid.resolve(request)
    }
    return isvalid.promise
  }

  templateFlowInfo (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/templateFlowList',
      type: 'object',
      required: true,
      properties: {
        type: {
          type: 'string',
          required: true,
          minLength: 1,
          enum: __constants.TEMPLATE_FLOW_APPROVAL
        },
        templateId: {
          type: 'string',
          required: true,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/templateFlowList')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      formatedError.push(formatedErr[formatedErr.length - 1])
    })
    if (formatedError.length > 0) {
      isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      trimInput.singleInputTrim(request)
      isvalid.resolve(request)
    }
    return isvalid.promise
  }
}

module.exports = validate
