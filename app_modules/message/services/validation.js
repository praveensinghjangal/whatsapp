const q = require('q')
const _ = require('lodash')
const Validator = require('jsonschema').Validator
const v = new Validator()
const __constants = require('../../../config/constants')
const TrimService = require('../../../lib/trimService/trim')
const __logger = require('../../../lib/logger')

const trimInput = new TrimService()
// "payload": {
//     "text": "This is an example response"
// }
class validate {
  sendMessage (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/sendMessage',
      type: 'object',
      required: true,
      properties: {
        senderNumber: {
          type: 'string',
          required: true,
          minLength: 1
        },
        receiverNumber: {
          type: 'string',
          required: true,
          minLength: 1
        },
        payload: {
          type: 'object',
          required: true,
          minLength: 1,
          properties: {
            text: {
              type: 'string',
              required: true,
              minLength: 1
            }
          }
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/sendMessage')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      formatedError.push(formatedErr[formatedErr.length - 1])
    })
    if (formatedError.length > 0) {
      isvalid.reject({ statusCode: 'VE001', message: 'invalid input', error: formatedError })
    } else {
      trimInput.singleInputTrim(request)
        .then(data => isvalid.resolve(data))
    }
    return isvalid.promise
  }

  sendMessageToQueue (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/sendMessageToQueue',
      type: 'array',
      required: true,
      minItems: 1,
      maxItems: 500,
      items: {
        type: 'object',
        required: true,
        properties: {
          to: {
            type: 'string',
            required: true,
            minLength: 1
          },
          isOptin: {
            type: 'boolean',
            required: false
          },
          sendAfterMessageId: {
            type: 'string',
            required: false
          },
          channels: {
            type: 'array',
            required: true,
            minItems: 1,
            items: {
              type: 'string',
              enum: ['whatsapp']
            }
          },
          countryCode: {
            type: 'string',
            required: true,
            enum: __constants.COUNTRY_LIST_ALPHA_TWO
          },
          whatsapp: {
            type: 'object',
            required: true,
            minLength: 1,
            properties: {
              from: {
                type: 'string',
                required: true,
                minLength: 1
              },
              customOne: {
                type: 'string',
                required: false,
                minLength: 1,
                maxLength: 50
              },
              customTwo: {
                type: 'string',
                required: false,
                minLength: 1,
                maxLength: 50
              },
              customThree: {
                type: 'string',
                required: false,
                minLength: 1,
                maxLength: 50
              },
              customFour: {
                type: 'string',
                required: false,
                minLength: 1,
                maxLength: 50
              },
              contentType: {
                type: 'string',
                required: true,
                minLength: 1,
                enum: ['text', 'media', 'template', 'location']
              },
              text: {
                type: 'string',
                required: false,
                minLength: 1,
                maxLength: 4096
              },
              media: {
                type: 'object',
                required: false,
                minLength: 1,
                properties: {
                  type: {
                    type: 'string',
                    required: true,
                    minLength: 1,
                    enum: ['image', 'document', 'video', 'sticker', 'audio']
                  },
                  url: {
                    type: 'string',
                    minLength: 1
                  },
                  mediaId: {
                    type: 'string',
                    minLength: 1
                  },
                  caption: {
                    type: 'string',
                    required: false,
                    minLength: 1,
                    maxLength: 4096
                  },
                  filename: {
                    type: 'string',
                    required: false,
                    minLength: 1
                  }
                },
                anyOf: [
                  {
                    required:
                    ['mediaId']
                  },
                  {
                    required:
                    ['url']
                  }
                ]
              },
              location: {
                type: 'object',
                required: false,
                minLength: 1,
                properties: {
                  longitude: {
                    type: 'number',
                    required: true,
                    minLength: 1
                  },
                  latitude: {
                    type: 'number',
                    required: true,
                    minLength: 1
                  },
                  name: {
                    type: 'string',
                    required: false
                  },
                  address: {
                    type: 'string',
                    required: false
                  }
                }
              },
              template: {
                type: 'object',
                required: false,
                minLength: 1,
                properties: {
                  templateId: {
                    type: 'string',
                    required: true,
                    minLength: 1
                  },
                  language: {
                    type: 'object',
                    required: true,
                    minLength: 1,
                    properties: {
                      policy: {
                        type: 'string',
                        required: true,
                        minLength: 1,
                        enum: ['deterministic']
                      },
                      code: {
                        type: 'string',
                        required: true,
                        minLength: 1
                      }
                    }
                  },
                  components: {
                    type: 'array',
                    required: false,
                    minItems: 1,
                    items: {
                      type: 'object',
                      required: true,
                      properties: {
                        type: {
                          type: 'string',
                          required: true,
                          minLength: 1,
                          enum: ['header', 'body', 'footer']
                        },
                        parameters: {
                          type: 'array',
                          required: false,
                          items: {
                            type: 'object',
                            required: true,
                            properties: {
                              type: {
                                type: 'string',
                                required: true,
                                minLength: 1,
                                enum: ['text', 'media', 'location']
                              },
                              text: {
                                type: 'string',
                                required: false,
                                minLength: 1,
                                pattern: __constants.VALIDATOR.noTabLinebreakSpace
                              },
                              media: {
                                type: 'object',
                                required: false,
                                minLength: 1,
                                properties: {
                                  type: {
                                    type: 'string',
                                    required: true,
                                    minLength: 1,
                                    enum: ['image', 'document', 'video', 'sticker', 'audio']
                                  },
                                  url: {
                                    type: 'string',
                                    required: true,
                                    minLength: 1
                                  },
                                  caption: {
                                    type: 'string',
                                    required: false,
                                    minLength: 1
                                  },
                                  filename: {
                                    type: 'string',
                                    required: false,
                                    minLength: 1
                                  }
                                }
                              },
                              location: {
                                type: 'object',
                                required: false,
                                minLength: 1,
                                properties: {
                                  longitude: {
                                    type: 'number',
                                    required: true,
                                    minLength: 1
                                  },
                                  latitude: {
                                    type: 'number',
                                    required: true,
                                    minLength: 1
                                  }
                                }
                              }
                            },
                            anyOf: [
                              {
                                properties: {
                                  type: { const: 'text' }
                                },
                                required: ['text']
                              },
                              {
                                properties: {
                                  type: { const: 'media' }
                                },
                                required: ['media']
                              }, {
                                properties: {
                                  type: { const: 'location' }
                                },
                                required: ['location']
                              }
                            ]
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            anyOf: [
              {
                properties: {
                  contentType: { const: 'text' }
                },
                required: ['text']
              },
              {
                properties: {
                  contentType: { const: 'media' }
                },
                required: ['media']
              }, {
                properties: {
                  contentType: { const: 'location' }
                },
                required: ['location']
              }, {
                properties: {
                  contentType: { const: 'template' }
                },
                required: ['template']
              }
            ]
          }
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/sendMessageToQueue')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      if (err.split('"/^(?:(.)(?!\\\\s\\\\s\\\\s\\\\s)(?!\\\\n)(?!\\\\t))*$/g"').length > 1) {
        const formatedErr = 'Template variable parameter of text cannot contain new line, tab or more than 3 spaces'
        formatedError.push(formatedErr)
      } else {
        const formatedErr = err.split('.')
        if (formatedErr[formatedErr.length - 1] && formatedErr[formatedErr.length - 1].includes('[subschema 0],[subschema 1],[subschema 2]')) {
          formatedError.push('content should be an object, it should consist of atleast one [ text, media, location]')
        } else if (formatedErr[formatedErr.length - 1] && formatedErr[formatedErr.length - 1].includes('[subschema 0],[subschema 1]')) {
          formatedError.push('Media should contain atleast one from these both keys:- url or mediaId and caption is optional')
        } else { formatedError.push(formatedErr[formatedErr.length - 1]) }
      }
    })
    if (formatedError.length > 0) {
      isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      trimInput.bulkInputTrim(request)
      isvalid.resolve(request)
    }
    return isvalid.promise
  }

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
    require('./../../../lib/util/invalidMessageIdWithDateHandler')(formatedError, request)
    v.addSchema(schema, '/checkMessageIdExist')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      formatedError.push(formatedErr[formatedErr.length - 1])
    })
    if (formatedError.length > 0) {
      isvalid.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: formatedError })
    } else {
      trimInput.singleInputTrim(request)
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
      additionalProperties: true,
      anyOf: [
        {
          required:
          ['messageId']
        },
        {
          required:
          ['serviceProviderMessageId']
        }
      ],
      properties: {
        messageId: {
          type: 'string',
          minLength: 1
        },
        serviceProviderMessageId: {
          type: 'string',
          minLength: 1
        },
        serviceProviderId: {
          type: 'string',
          required: false
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
        errors: {
          type: 'array',
          required: false
        },
        endConsumerNumber: {
          type: 'string',
          required: false
        },
        businessNumber: {
          type: 'string',
          required: false
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
      trimInput.singleInputTrim(request)
      isvalid.resolve(request)
    }
    return isvalid.promise
  }

  checkstartDateAndendDate (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/checkstartDateAndendDate',
      type: 'object',
      required: true,
      properties: {
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
    v.addSchema(schema, '/checkstartDateAndendDate')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      const regexPatternPreetyMessage = formatedErr[1].split(' "^')[0].replace('does not match pattern', '- invalid date format- use yyyy-mm-dd hh:MM:ss')
      formatedError.push(regexPatternPreetyMessage)
    })
    if (formatedError.length > 0) {
      __logger.info('Catched', formatedError)
      isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      if (request.startDate === request.endDate) {
        formatedError.push('startDate cannot be equal to endDate!')
      }
      if (request.startDate > request.endDate) {
        formatedError.push('startDate can not be greater than endDate!')
      }
      if (formatedError.length > 0) {
        __logger.info('Catched', formatedError)
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

  transactionValidator (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/transactionValidator',
      type: 'object',
      required: true,
      properties: {
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
        transactionType: {
          type: 'string',
          required: true,
          enum: __constants.MESSAGE_TRANSACTION_TYPE
        }

      }
    }
    const formatedError = []
    v.addSchema(schema, '/transactionValidator')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      const regexPatternPreetyMessage = formatedErr[1].split(' "^')[0].replace('does not match pattern', '- invalid date format- use yyyy-mm-dd hh:MM:ss')
      formatedError.push(regexPatternPreetyMessage)
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

  checkMediaIdExist (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/checkMediaIdExist',
      type: 'object',
      required: true,
      properties: {
        mediaId: {
          type: 'string',
          required: true,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/checkMediaIdExist')
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

  outgoingTransactionValidatorByFilters (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/outgoingTransactionValidator',
      type: 'object',
      required: true,
      properties: {
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
        endUserNumber: {
          type: 'string',
          required: false,
          minLength: 10,
          maxLength: 12,
          pattern: __constants.VALIDATOR.number
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/outgoingTransactionValidator')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      const regexPatternPreetyMessage = formatedErr[1].split(' "^')[0].replace('does not match pattern', '- invalid date format- use yyyy-mm-dd hh:MM:ss')
      formatedError.push(regexPatternPreetyMessage)
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

  addConversationLog (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/addConversationLog',
      type: 'object',
      required: true,
      additionalProperties: false,
      properties: {
        conversationId: {
          type: 'string',
          minLength: 1,
          required: true

        },
        from: {
          type: 'string',
          minLength: 1,
          required: true,
          pattern: __constants.VALIDATOR.phoneNumberWithPhoneCode
        },
        to: {
          type: 'string',
          required: true,
          pattern: __constants.VALIDATOR.phoneNumberWithPhoneCode
        },
        expiresOn: {
          type: 'string',
          required: true,
          minLength: 1,
          pattern: __constants.VALIDATOR.timeStamp
        },
        type: {
          type: 'string',
          required: true,
          minLength: 1,
          enum: __constants.CONVERSATION_BILLING_CATEGORY
        }

      }
    }

    const formatedError = []
    v.addSchema(schema, '/addConversationLog')
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

  getMediaByPhoneNumber (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/getMediaByPhoneNumber',
      type: 'object',
      required: true,
      properties: {
        mediaId: {
          type: 'string',
          required: true,
          minLength: 1
        },
        phoneNumber: {
          type: 'string',
          required: true,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/getMediaByPhoneNumber')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      formatedError.push(formatedErr[formatedErr.length - 1])
    })
    if (formatedError.length > 0) {
      isvalid.reject({
        type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST,
        err: formatedError
      })
    } else {
      trimInput.singleInputTrim(request)
      isvalid.resolve(request)
    }
    return isvalid.promise
  }
}

module.exports = validate
