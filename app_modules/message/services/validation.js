const q = require('q')
const _ = require('lodash')
const Validator = require('jsonschema').Validator
const v = new Validator()
const __constants = require('../../../config/constants')
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
      isvalid.resolve(request)
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
          channels: {
            type: 'array',
            required: true,
            minItems: 1,
            items: {
              type: 'string',
              enum: ['whatsapp']
            }
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
              contentType: {
                type: 'string',
                required: true,
                minLength: 1,
                enum: ['text', 'media', 'template', 'location']
              },
              text: {
                type: 'string',
                required: false,
                minLength: 1
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
                    enum: ['image', 'document', 'video']
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
                                minLength: 1
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
                                    enum: ['image', 'document', 'video']
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
      additionalProperties: false,
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
      isvalid.resolve(request)
    }
    return isvalid.promise
  }
}

module.exports = validate
