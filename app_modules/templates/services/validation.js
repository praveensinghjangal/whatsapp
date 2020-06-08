const q = require('q')
const _ = require('lodash')
const Validator = require('jsonschema').Validator
const v = new Validator()
const __constants = require('../../../config/constants')

class validate {
  checkWabaIdExistService (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/checkWabaIdExist',
      type: 'object',
      required: true,
      properties: {
        wabaInformationId: {
          type: 'string',
          required: true,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/checkWabaIdExist')
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

  checkWabaId (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/checkWabaId',
      type: 'object',
      required: true,
      additionalProperties: false,
      properties: {
        wabaInformationId: {
          type: 'string',
          required: true,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/checkWabaId')
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

  addUpdateTemplate (request) {
    const isvalid = q.defer()
    if (request && request.type) request.type = request.type.toLowerCase()
    const schema = {
      id: '/addUpdateTemplate',
      type: 'object',
      required: true,
      properties: {
        messageTemplateId: {
          type: 'string',
          required: false,
          minLength: 1
        },
        templateName: {
          type: 'string',
          required: true,
          minLength: 1
        },
        type: {
          type: 'string',
          required: false,
          minLength: 1,
          enum: _.map(__constants.TEMPLATE_TYPE, json => json.templateType.toLowerCase())
        },
        messageTemplateCategoryId: {
          type: 'string',
          required: false,
          minLength: 1
        },
        messageTemplateStatusId: {
          type: 'string',
          required: false,
          minLength: 1
        },
        messageTemplateLanguageId: {
          type: 'string',
          required: false,
          minLength: 1
        },
        bodyText: {
          type: 'string',
          required: false,
          minLength: 1
        },
        headerText: {
          type: 'string',
          required: false,
          minLength: 1
        },
        footerText: {
          type: 'string',
          required: false,
          minLength: 1
        },
        mediaType: {
          type: 'string',
          required: false,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/addUpdateTemplate')
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

  isTemplateComplete (request) {
    const isvalid = q.defer()
    if (request && request.type) request.type = request.type.toLowerCase()
    const schema = {
      id: '/isTemplateComplete',
      type: 'object',
      required: true,
      properties: {
        messageTemplateId: {
          type: 'string',
          required: true,
          minLength: 1
        },
        templateName: {
          type: 'string',
          required: true,
          minLength: 1
        },
        type: {
          type: 'string',
          required: true,
          minLength: 1,
          enum: _.map(__constants.TEMPLATE_TYPE, json => json.templateType.toLowerCase())
        },
        messageTemplateCategoryId: {
          type: 'string',
          required: true,
          minLength: 1
        },
        messageTemplateStatusId: {
          type: 'string',
          required: true,
          minLength: 1
        },
        messageTemplateLanguageId: {
          type: 'string',
          required: true,
          minLength: 1
        },
        bodyText: {
          type: 'string',
          required: true,
          minLength: 1
        },
        headerText: {
          type: 'string',
          required: true,
          minLength: 1
        },
        footerText: {
          type: 'string',
          required: false,
          minLength: 1
        },
        mediaType: {
          type: 'string',
          required: true,
          minLength: 1
        },
        wabaInformationId: {
          type: 'string',
          required: true,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/isTemplateComplete')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      formatedError.push(formatedErr[formatedErr.length - 1])
    })
    if (formatedError.length > 0) {
      isvalid.resolve(false)
    } else {
      isvalid.resolve(true)
    }
    return isvalid.promise
  }
}

module.exports = validate
