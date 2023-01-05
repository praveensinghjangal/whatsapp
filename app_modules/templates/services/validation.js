const q = require('q')
const _ = require('lodash')
const Validator = require('jsonschema').Validator
const v = new Validator()
const __constants = require('../../../config/constants')
const TrimService = require('../../../lib/trimService/trim')
const __logger = require('../../../lib/logger')
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
          minLength: 1,
          maxLength: 50
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
          minLength: 1,
          maxLength: 50
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
          minLength: 1,
          maxLength: 50
        },
        templateName: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 100
        },
        type: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 75,
          enum: _.map(__constants.TEMPLATE_TYPE, json => json.templateType.toLowerCase())
        },
        messageTemplateCategoryId: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 50
        },
        messageTemplateStatusId: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 50
        },
        messageTemplateLanguageId: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 50
        },
        bodyText: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 1000
        },
        bodyTextVarExample: {
          type: 'array',
          required: !!(request.bodyText && (request.bodyText.match(/{{\d{1,3}}}/g) || []).length),
          minItems: request.bodyText ? (request.bodyText.match(/{{\d{1,3}}}/g) || []).length : 0,
          maxItems: request.bodyText ? (request.bodyText.match(/{{\d{1,3}}}/g) || []).length : 200,
          items: {
            type: 'string'
          }
        },
        headerText: {
          type: 'string',
          required: request.headerType === __constants.TEMPLATE_HEADER_TYPE[3].templateHeaderType.toLocaleLowerCase(),
          minLength: 1,
          maxLength: 500
        },
        headerTextVarExample: {
          type: 'array',
          required: !!(request.headerText && (request.headerText.match(/{{\d{1,3}}}/g) || []).length),
          minItems: 1,
          maxItems: 1,
          items: {
            type: 'string'
          }
        },
        footerText: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 500
        },
        mediaType: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 100
        },
        secondLanguageRequired: {
          type: 'boolean',
          required: false,
          minLength: 1
        },
        secondMessageTemplateLanguageId: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 50
        },
        secondLanguageBodyText: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 1024
        },
        secondLanguageBodyTextVarExample: {
          type: 'array',
          required: !!(request.secondLanguageBodyText && (request.secondLanguageBodyText.match(/{{\d{1,3}}}/g) || []).length),
          minItems: request.secondLanguageBodyText ? (request.secondLanguageBodyText.match(/{{\d{1,3}}}/g) || []).length : 0,
          maxItems: request.secondLanguageBodyText ? (request.secondLanguageBodyText.match(/{{\d{1,3}}}/g) || []).length : 200,
          items: {
            type: 'string'
          }
        },
        headerType: {
          type: typeof request.headerType === 'string' ? 'string' : null,
          required: false,
          minLength: 1,
          enum: _.map(__constants.TEMPLATE_HEADER_TYPE, json => json.templateHeaderType ? json.templateHeaderType.toLowerCase() : json.templateHeaderType),
          maxLength: 100
        },
        mediaExampleUrl: {
          type: 'string',
          required: request.headerType && request.headerType !== __constants.TEMPLATE_HEADER_TYPE[3].templateHeaderType.toLocaleLowerCase(),
          pattern: __constants.VALIDATOR.url,
          maxLength: 2083
        },
        secondLanguageHeaderText: {
          type: 'string',
          required: request.headerType === __constants.TEMPLATE_HEADER_TYPE[3].templateHeaderType.toLocaleLowerCase() && request.secondLanguageRequired === true,
          maxLength: 500
        },
        secondLanguageHeaderTextVarExample: {
          type: 'array',
          required: !!(request.secondLanguageHeaderText && (request.secondLanguageHeaderText.match(/{{\d{1,3}}}/g) || []).length),
          minItems: 1,
          maxItems: 1,
          items: {
            type: 'string'
          }
        },
        buttonType: {
          type: typeof request.buttonType === 'string' ? 'string' : null,
          required: !!(request.buttonData && request.buttonData !== {}),
          minLength: request.buttonType ? 1 : 0,
          enum: _.map(__constants.TEMPLATE_BUTTON_TYPE, json => json.buttonType ? json.buttonType.toLowerCase() : json.buttonType),
          maxLength: 100
        },
        buttonData: {
          type: 'object',
          required: !!(request.buttonType),
          additionalProperties: false,
          properties: {
            quickReply: {
              type: 'array',
              required: request.buttonType,
              minItems: 1,
              maxItems: 3,
              items: {
                type: 'string'
              }
            },
            secondLanguageQuickReply: {
              type: 'array',
              required: request.buttonType,
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
              minLength: 6,
              maxLength: 15,
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
              pattern: __constants.VALIDATOR.url,
              maxLength: 2083
            },
            secondLanguageWebsiteButtontext: {
              type: 'string',
              required: false,
              minLength: 1
            },
            secondLanguagePhoneButtonText: {
              type: 'string',
              required: false,
              minLength: 1
            },
            websiteTextVarExample: {
              type: 'array',
              required: !!(request.buttonData && request.buttonData.webAddress && (request.buttonData.webAddress.match(/{{\d{1}}}/g) || []).length),
              minItems: 1,
              maxItems: 1,
              items: {
                type: 'string',
                minLength: 2,
                maxLength: 50
              }
            },
            websiteButtonType: {
              type: 'string',
              required: false,
              minItems: 1,
              maxItems: 1,
              enum: ['static', 'dynamic']
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
      if (formatedErr[formatedErr.length - 1] === '[^\\\\s]{2,})/"') {
        formatedError.push('please provide valid url for mediaExampleUrl')
      } else {
        formatedError.push(formatedErr[formatedErr.length - 1])
      }
    })
    request.headerTextVarExample = request.headerTextVarExample ? request.headerTextVarExample : []
    request.secondLanguageHeaderTextVarExample = request.secondLanguageHeaderTextVarExample ? request.secondLanguageHeaderTextVarExample : []
    request.bodyTextVarExample = request.bodyTextVarExample ? request.bodyTextVarExample : []
    request.secondLanguageBodyTextVarExample = request.secondLanguageBodyTextVarExample ? request.secondLanguageBodyTextVarExample : []
    if (request.secondLanguageRequired && request.headerType === __constants.TEMPLATE_HEADER_TYPE[3].templateHeaderType.toLocaleLowerCase() && (schema.properties.headerTextVarExample.required || schema.properties.secondLanguageHeaderTextVarExample.required) && request.headerTextVarExample.length !== request.secondLanguageHeaderTextVarExample.length) formatedError.push('variable count in headerText doesnot match with variable count in secondLanguageHeaderText')
    if (request.secondLanguageRequired && request.headerType === __constants.TEMPLATE_HEADER_TYPE[3].templateHeaderType.toLocaleLowerCase() && (schema.properties.bodyTextVarExample.required || schema.properties.secondLanguageBodyTextVarExample.required) && request.bodyTextVarExample.length !== request.secondLanguageBodyTextVarExample.length) formatedError.push('variable count in bodyText doesnot match with variable count in secondLanguageBodyText')
    if (request.headerType === __constants.TEMPLATE_HEADER_TYPE[3].templateHeaderType.toLocaleLowerCase() && schema.properties.headerText.required && request.headerText && (request.headerText.match(/{{\d{1,3}}}/g) || []).length > 1) formatedError.push('headerText text can contain only one variable')
    if (request.headerType === __constants.TEMPLATE_HEADER_TYPE[3].templateHeaderType.toLocaleLowerCase() && schema.properties.secondLanguageHeaderText.required && request.secondLanguageHeaderText && (request.secondLanguageHeaderText.match(/{{\d{1,3}}}/g) || []).length > 1) formatedError.push('secondLanguageHeaderText text can contain only one variable')
    if (request.bodyTextVarExample.length > 0) {
      const textVariablesArr = request.bodyText.match(/{{\d{1,3}}}/g)
      const varNotInSequence = _.find(textVariablesArr, (singleVar, i) => singleVar !== '{{' + (i + 1) + '}}')
      if (varNotInSequence) formatedError.push('variables inside bodyText are not in sequence or they do not start with {{1}}')
    }
    if (request.secondLanguageBodyTextVarExample.length > 0) {
      const textVariablesArr = request.secondLanguageBodyText.match(/{{\d{1,3}}}/g)
      const varNotInSequence = _.find(textVariablesArr, (singleVar, i) => singleVar !== '{{' + (i + 1) + '}}')
      if (varNotInSequence) formatedError.push('variables inside secondLanguageBodyText are not in sequence or they do not start with {{1}}')
    }
    if (request.headerTextVarExample.length > 0) {
      const textVariablesArr = request.headerText.match(/{{\d{1,3}}}/g)
      if (!textVariablesArr || !textVariablesArr[0] || textVariablesArr[0] !== '{{1}}') formatedError.push('variables inside headerText does not start with {{1}}')
    }
    if (request.secondLanguageHeaderTextVarExample.length > 0) {
      const textVariablesArr = request.secondLanguageHeaderText.match(/{{\d{1,3}}}/g)
      if (!textVariablesArr || !textVariablesArr[0] || textVariablesArr[0] !== '{{1}}') formatedError.push('variables inside secondLanguageHeaderText does not start with {{1}}')
    }
    if (request.buttonData && request.buttonData.websiteTextVarExample && (request.buttonData.websiteTextVarExample.length > 0)) {
      const textVariablesArr = request.buttonData.webAddress.match(/{{\d{1}}}/g)
      if (!textVariablesArr || !textVariablesArr[0] || textVariablesArr[0] !== '{{1}}') formatedError.push('variables inside webAddress does not start with {{1}}')
    }
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
    const headereTypeEnum = _.map(__constants.TEMPLATE_HEADER_TYPE, json => json.templateHeaderType ? json.templateHeaderType.toLowerCase() : json.templateHeaderType)
    const buttonTypeEnum = _.map(__constants.TEMPLATE_BUTTON_TYPE, json => json.buttonType ? json.buttonType.toLowerCase() : json.buttonType)
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
          minLength: 1,
          maxLength: 50
        },
        templateName: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 100
        },
        type: {
          type: 'string',
          required: true,
          minLength: 1,
          enum: _.map(__constants.TEMPLATE_TYPE, json => json.templateType.toLowerCase()),
          maxLength: 75
        },
        messageTemplateCategoryId: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 50
        },
        messageTemplateStatusId: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 50
        },
        messageTemplateLanguageId: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 50
        },
        bodyText: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 1000
        },
        headerText: {
          type: [null, 'string'],
          required: false,
          maxLength: 500
        },
        footerText: {
          type: [null, 'string'],
          required: false,
          maxLength: 500
        },
        mediaType: {
          type: [null, 'string'],
          required: false,
          maxLength: 100
        },
        wabaInformationId: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 50
        },
        secondLanguageRequired: {
          type: 'boolean',
          required: true,
          minLength: 1
        },
        secondMessageTemplateLanguageId: {
          type: ['string', null],
          required: false,
          maxLength: 50
        },
        secondLanguageBodyText: {
          type: [null, 'string'],
          required: false,
          maxLength: 1024
        },
        headerType: {
          type: [null, 'string'],
          required: false,
          enum: headereTypeEnum
        },
        secondLanguageHeaderText: {
          type: [null, 'string'],
          required: false,
          maxLength: 500
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
              minLength: 6,
              maxLength: 15,
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
    __logger.info('errrrrrrrrrrrrrrrrrrrrr', formatedError)
    if (formatedError.length > 0) {
      isvalid.resolve(false)
    } else {
      isvalid.resolve(true)
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
          minLength: 1,
          maxLength: 50
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

  validateAndUpdateStatusService (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/validateAndUpdateStatusService',
      type: 'object',
      required: true,
      additionalProperties: false,
      properties: {
        templateId: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 50
        },
        firstLocalizationNewStatusId: {
          type: 'string',
          required: !request.secondLocalizationNewStatusId,
          minLength: 1,
          maxLength: 50
        },
        firstLocalizationOldStatusId: {
          type: 'string',
          required: !request.secondLocalizationNewStatusId,
          minLength: 1,
          maxLength: 50
        },
        firstLocalizationRejectionReason: {
          type: [null, 'string'],
          required: false,
          minLength: 1
        },
        secondLocalizationNewStatusId: {
          type: 'string',
          required: !request.firstLocalizationNewStatusId,
          minLength: 1,
          maxLength: 50
        },
        secondLocalizationOldStatusId: {
          type: 'string',
          required: !request.firstLocalizationNewStatusId,
          minLength: 1,
          maxLength: 50
        },
        secondLocalizationRejectionReason: {
          type: [null, 'string'],
          required: false,
          minLength: 1,
          maxLength: 100
        }
      }
    }
    if (!request.firstLocalizationNewStatusId && request.secondLocalizationNewStatusId) {
      schema.properties.firstLocalizationNewStatusId.type = [null, undefined]
      schema.properties.firstLocalizationOldStatusId.type = [null, undefined]
      schema.properties.firstLocalizationRejectionReason.type = [null, undefined]
      delete schema.properties.secondLocalizationNewStatusId.minLength
      delete schema.properties.secondLocalizationOldStatusId.minLength
      delete schema.properties.secondLocalizationRejectionReason.minLength
    }
    if (!request.secondLocalizationNewStatusId && request.firstLocalizationNewStatusId) {
      schema.properties.secondLocalizationNewStatusId.type = [null, undefined]
      schema.properties.secondLocalizationOldStatusId.type = [null, undefined]
      schema.properties.secondLocalizationRejectionReason.type = [null, undefined]
      delete schema.properties.firstLocalizationNewStatusId.minLength
      delete schema.properties.firstLocalizationOldStatusId.minLength
      delete schema.properties.firstLocalizationRejectionReason.minLength
    }

    if (request.secondLocalizationNewStatusId && request.firstLocalizationNewStatusId) {
      delete schema.properties.firstLocalizationNewStatusId.minLength
      delete schema.properties.firstLocalizationOldStatusId.minLength
      delete schema.properties.firstLocalizationRejectionReason.minLength
      delete schema.properties.secondLocalizationNewStatusId.minLength
      delete schema.properties.secondLocalizationOldStatusId.minLength
      delete schema.properties.secondLocalizationRejectionReason.minLength
    }

    const formatedError = []
    v.addSchema(schema, '/validateAndUpdateStatusService')
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

  compareAndUpdateStatusService (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/compareAndUpdateStatusService',
      type: 'object',
      required: true,
      additionalProperties: false,
      properties: {
        templateIdArr: {
          type: 'array',
          required: true,
          minItems: 1,
          items: {
            type: 'string'
          }
        },
        serviceProviderId: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 50
        },
        userId: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 50
        },
        wabaNumber: {
          type: 'string',
          required: true,
          minLength: 6,
          maxLength: 15,
          pattern: __constants.VALIDATOR.number
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/compareAndUpdateStatusService')
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

  getTemplateList (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/getTemplateList',
      type: 'object',
      required: true,
      additionalProperties: false,
      properties: {
        templateStatusId: {
          type: 'string',
          required: true,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/getTemplateList')
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

  templateApproval (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/templateApproval',
      type: 'object',
      required: true,
      properties: {
        userId: {
          type: 'string',
          required: true,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/templateApproval')
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

  getAllTemplateWithStatusValidator (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/getAllTemplateWithStatusValidator',
      type: 'object',
      required: true,
      properties: {
        startDate: {
          type: 'string',
          required: true,
          pattern: __constants.VALIDATOR.timeStamp,
          minLength: 1
        },
        endDate: {
          type: 'string',
          required: true,
          pattern: __constants.VALIDATOR.timeStamp,
          minLength: 1
        },
        statusId: {
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
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/getAllTemplateWithStatusValidator')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      const patternError = formatedErr && formatedErr[1] && formatedErr[1].includes('pattern')
      const date = patternError && formatedErr[1].includes('startDate') ? 'startDate' : 'endDate'
      if (patternError && (formatedErr[1].includes('startDate') || formatedErr[1].includes('endDate'))) {
        formatedErr[1] = date + ' -invalid date format- use yyyy-mm-dd hh:MM:ss'
      }
      formatedError.push(formatedErr[formatedErr.length - 1])
    })
    if (formatedError.length > 0) {
      isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      if (request.startDate === request.endDate) {
        formatedError.push('startDate cannot be equal to endDate!')
      }
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
