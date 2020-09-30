const q = require('q')
const _ = require('lodash')
const Validator = require('jsonschema').Validator
const v = new Validator()
const __constants = require('../../../config/constants')
const TrimService = require('../../../lib/trimService/trim')
const trimInput = new TrimService()

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
      trimInput.singleInputTrim(request)
        .then(data => isvalid.resolve(data))
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
      trimInput.singleInputTrim(request)
        .then(data => isvalid.resolve(data))
    }
    return isvalid.promise
  }

  addUpdateTemplate (request) {
    const isvalid = q.defer()
    if (request && request.type) request.type = request.type.toLowerCase()
    if (request && request.headerType) request.headerType = request.headerType.toLowerCase()
    if (request && request.buttonType) request.buttonType = request.buttonType.toLowerCase()
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
        },
        secondLanguageRequired: {
          type: 'boolean',
          required: false,
          minLength: 1
        },
        secondMessageTemplateLanguageId: {
          type: 'string',
          required: false,
          minLength: 1
        },
        secondLanguageBodyText: {
          type: 'string',
          required: false,
          minLength: 1
        },
        headerType: {
          type: 'string',
          required: false,
          minLength: 1,
          enum: _.map(__constants.TEMPLATE_HEADER_TYPE, json => json.templateHeaderType.toLowerCase())
        },
        buttonType: {
          type: 'string',
          required: false,
          minLength: 1,
          enum: _.map(__constants.TEMPLATE_BUTTON_TYPE, json => json.buttonType.toLowerCase())
        },
        buttonData: {
          type: 'object',
          required: false,
          additionalProperties: false,
          properties: {
            quickReply: {
              type: 'array',
              required: false,
              minItems: 1,
              maxItems: 3,
              items: {
                type: 'string'
              }
            },
            phoneButtonText: {
              type: 'string',
              required: false,
              minLength: 1
            },
            phoneNumber: {
              type: 'string',
              required: false,
              minLength: 10,
              maxLength: 10,
              pattern: __constants.VALIDATOR.number

            },
            websiteButtontext: {
              type: 'string',
              required: false,
              minLength: 1
            },
            webAddress: {
              type: 'string',
              required: false,
              minLength: 1
            }
          }
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
      trimInput.singleInputTrim(request)
        .then(data => isvalid.resolve(data))
    }
    return isvalid.promise
  }

  isTemplateComplete (request) {
    const isvalid = q.defer()
    const headereTypeEnum = _.map(__constants.TEMPLATE_HEADER_TYPE, json => json.templateHeaderType.toLowerCase())
    const buttonTypeEnum = _.map(__constants.TEMPLATE_BUTTON_TYPE, json => json.buttonType.toLowerCase())
    headereTypeEnum.push(null)
    buttonTypeEnum.push(null)
    if (request && request.type) request.type = request.type.toLowerCase()
    if (request && request.headerType) request.headerType = request.headerType.toLowerCase()
    if (request && request.buttonType) request.buttonType = request.buttonType.toLowerCase()
    if (request && request.buttonData) request.buttonData = JSON.parse(request.buttonData)
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
          type: [null, 'string'],
          required: false
        },
        footerText: {
          type: [null, 'string'],
          required: false
        },
        mediaType: {
          type: [null, 'string'],
          required: false
        },
        wabaInformationId: {
          type: 'string',
          required: true,
          minLength: 1
        },
        secondLanguageRequired: {
          type: 'boolean',
          required: true,
          minLength: 1
        },
        secondMessageTemplateLanguageId: {
          type: ['string', null],
          required: false
        },
        secondLanguageBodyText: {
          type: [null, 'string'],
          required: false
        },
        headerType: {
          type: [null, 'string'],
          required: false,
          enum: headereTypeEnum
        },
        buttonType: {
          type: [null, 'string'],
          required: false,
          minLength: 1,
          enum: buttonTypeEnum
        },
        buttonData: {
          type: [null, 'object'],
          required: false,
          additionalProperties: false,
          properties: {
            quickReply: {
              type: 'array',
              required: false,
              minItems: 1,
              maxItems: 3,
              items: {
                type: 'string'
              }
            },
            phoneButtonText: {
              type: 'string',
              required: false,
              minLength: 1
            },
            phoneNumber: {
              type: 'string',
              required: false,
              minLength: 10,
              maxLength: 10,
              pattern: __constants.VALIDATOR.number

            },
            websiteButtontext: {
              type: 'string',
              required: false,
              minLength: 1
            },
            webAddress: {
              type: 'string',
              required: false,
              minLength: 1
            }
          }
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
    console.log('errrrrrrrrrrrrrrrrrrrrr', formatedError)
    if (formatedError.length > 0) {
      isvalid.resolve(false)
    } else {
      isvalid.resolve(true)
    }
    return isvalid.promise
  }

  checkTemplateInfoStatus (request) {
    // console.log('Request', request)
    const isvalid = q.defer()
    if (request && request.type) request.type = request.type.toLowerCase()
    if (request && request.headerType) request.headerType = request.headerType.toLowerCase()
    if (request && request.buttonType) request.buttonType = request.buttonType.toLowerCase()
    const schema = {
      id: '/checkTemplateInfoStatus',
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
          minLength: 1
        },
        categoryName: {
          type: 'string',
          required: true,
          minLength: 1
        },
        statusName: {
          type: 'string',
          required: true,
          minLength: 1
        },
        languageName: {
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
          required: true,
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
        },
        secondLanguageRequired: {
          type: 'boolean',
          required: true,
          minLength: 1
        },
        secondLanguageName: {
          type: 'string',
          required: true,
          minLength: 1
        },
        secondLanguageBodyText: {
          type: 'string',
          required: true,
          minLength: 1
        },
        headerType: {
          type: 'string',
          required: true,
          minLength: 1,
          enum: _.map(__constants.TEMPLATE_HEADER_TYPE, json => json.templateHeaderType.toLowerCase())
        },
        buttonType: {
          type: 'string',
          required: true,
          minLength: 1,
          enum: _.map(__constants.TEMPLATE_BUTTON_TYPE, json => json.buttonType.toLowerCase())
        },
        buttonData: {
          type: 'object',
          required: true,
          properties: {
            quickReply: {
              type: 'array',
              required: true,
              minItems: 1,
              maxItems: 3,
              items: {
                type: 'string'
              }
            },
            phoneButtonText: {
              type: 'string',
              required: true,
              minLength: 1
            },
            phoneNumber: {
              type: 'string',
              required: true,
              minLength: 10,
              maxLength: 10,
              pattern: __constants.VALIDATOR.number

            },
            websiteButtontext: {
              type: 'string',
              required: true,
              minLength: 1
            },
            webAddress: {
              type: 'string',
              required: true,
              minLength: 1
            }
          }
        }
      }
    }

    if (request.type === 'standard') {
      delete schema.properties.headerText
      delete schema.properties.footerText
      delete schema.properties.mediaType
    }
    if (request.type === 'media message template') {
      delete schema.properties.bodyText
    }
    if (request && request.buttonType === __constants.TEMPLATE_BUTTON_TYPE[0].buttonType.toLocaleLowerCase()) {
      delete schema.properties.buttonData.properties.quickReply
    }
    if (request && request.buttonType === __constants.TEMPLATE_BUTTON_TYPE[1].buttonType.toLocaleLowerCase()) {
      delete schema.properties.buttonData.properties.phoneButtonText
      delete schema.properties.buttonData.properties.phoneNumber
      delete schema.properties.buttonData.properties.websiteButtontext
      delete schema.properties.buttonData.properties.webAddress
    }
    const formatedError = []
    v.addSchema(schema, '/checkTemplateInfoStatus')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      formatedError.push(formatedErr[formatedErr.length - 1])
    })
    if (formatedError.length > 0) {
      isvalid.resolve({ complete: false, err: formatedError })
    } else {
      trimInput.bulkInputTrim(request)
      isvalid.resolve({ complete: true })
    }
    return isvalid.promise
  }

  checkMessageTemplateId (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/checkMessageTemplateId',
      type: 'object',
      required: true,
      additionalProperties: false,
      properties: {
        templateId: {
          type: 'string',
          required: true,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/checkMessageTemplateId')
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
}

module.exports = validate
