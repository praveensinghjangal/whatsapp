const q = require('q')
const _ = require('lodash')
const Validator = require('jsonschema').Validator
const v = new Validator()
const __constants = require('../../../config/constants')
const TrimService = require('../../../lib/trimService/trim')
const __logger = require('../../../lib/logger')

const trimInput = new TrimService()

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
          isChatBot: {
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
              campName: {
                type: 'string',
                required: false,
                minLength: 1,
                maxLength: 100
              },
              contact: {
                type: 'array',
                required: false,
                minItems: 1,
                maxItems: 5,
                items: {
                  type: 'object',
                  required: true,
                  properties: {
                    addresses: {
                      type: 'array',
                      required: false,
                      minItems: 1,
                      maxItems: 5,
                      items: {
                        type: 'object',
                        required: false,
                        properties: {
                          type: {
                            type: 'string',
                            required: false,
                            minLength: 3,
                            maxLength: 10,
                            pattern: __constants.VALIDATOR.textWithSpace
                          },
                          street: {
                            type: 'string',
                            required: false,
                            minLength: 3,
                            maxLength: 100,
                            pattern: __constants.VALIDATOR.alphanumericWithSpecialChar
                          },
                          city: {
                            type: 'string',
                            required: false,
                            minLength: 3,
                            maxLength: 100,
                            pattern: __constants.VALIDATOR.alphanumericWithMinSpecialChar
                          },
                          state: {
                            type: 'string',
                            required: false,
                            minLength: 3,
                            maxLength: 20,
                            pattern: __constants.VALIDATOR.alphanumericWithSpecialChar
                          },
                          country: {
                            type: 'string',
                            required: false,
                            minLength: 3,
                            maxLength: 60,
                            pattern: __constants.VALIDATOR.textWithSpace
                          },
                          countryCode: {
                            type: 'string',
                            required: false,
                            minLength: 2,
                            maxLength: 10,
                            pattern: __constants.VALIDATOR.text
                          },
                          zip: {
                            type: 'string',
                            required: false,
                            minLength: 6,
                            maxLength: 7,
                            pattern: __constants.VALIDATOR.number
                          }
                        }
                      }
                    },
                    birthday: {
                      type: 'string',
                      required: true,
                      pattern: __constants.VALIDATOR.dateFormat
                    },
                    emails: {
                      type: 'array',
                      required: false,
                      items: {
                        type: 'object',
                        required: false,
                        properties: {
                          email: {
                            type: 'string',
                            required: false,
                            minLength: 8,
                            maxLength: 100,
                            pattern: __constants.VALIDATOR.email
                          },
                          email_type: {
                            type: 'string',
                            required: false,
                            minLength: 2,
                            maxLength: 10,
                            pattern: __constants.VALIDATOR.textWithSpace
                          }
                        }
                      }
                    },
                    name: {
                      type: 'object',
                      required: true,
                      minLength: 1,
                      properties: {
                        firstName: {
                          type: 'string',
                          minLength: 3,
                          maxLength: 20,
                          pattern: __constants.VALIDATOR.textWithSpace
                        },
                        lastName: {
                          type: 'string',
                          minLength: 3,
                          maxLength: 20,
                          pattern: __constants.VALIDATOR.textWithSpace
                        },
                        middleName: {
                          type: 'string',
                          minLength: 3,
                          maxLength: 20,
                          pattern: __constants.VALIDATOR.textWithSpace
                        },
                        suffix: {
                          type: 'string',
                          minLength: 2,
                          maxLength: 5,
                          pattern: __constants.VALIDATOR.text
                        },
                        prefix: {
                          type: 'string',
                          minLength: 2,
                          maxLength: 5,
                          pattern: __constants.VALIDATOR.text
                        },
                        formattedName: {
                          type: 'string',
                          minLength: 3,
                          maxLength: 50,
                          required: true,
                          pattern: __constants.VALIDATOR.textWithSpace
                        }
                      },
                      anyOf: [
                        {
                          required: ['firstName']
                        },
                        {
                          required: ['lastName']
                        },
                        {
                          required: ['middleName']
                        },
                        {
                          required: ['prefix']
                        },
                        {
                          required: ['suffix']
                        }
                      ]
                    },
                    org: {
                      type: 'object',
                      required: false,
                      properties: {
                        company: {
                          type: 'string',
                          minLength: 2,
                          maxLength: 100,
                          pattern: __constants.VALIDATOR.alphanumericWithSpecialChar
                        },
                        department: {
                          type: 'string',
                          minLength: 2,
                          maxLength: 50,
                          pattern: __constants.VALIDATOR.alphanumericWithMinSpecialChar
                        },
                        title: {
                          type: 'string',
                          minLength: 2,
                          maxLength: 20,
                          pattern: __constants.VALIDATOR.alphanumericWithMinSpecialChar
                        }
                      }
                    },
                    phones: {
                      type: 'array',
                      required: false,
                      items: {
                        type: 'object',
                        required: false,
                        properties: {
                          phone: {
                            type: 'string',
                            minLength: 7,
                            maxLength: 15,
                            pattern: __constants.VALIDATOR.phoneNumberWithPhoneCode
                          },
                          type: {
                            type: 'string',
                            minLength: 2,
                            maxLength: 20,
                            pattern: __constants.VALIDATOR.textWithSpace
                          },
                          wa_id: {
                            type: 'string',
                            minLength: 7,
                            maxLength: 15,
                            pattern: __constants.VALIDATOR.phoneNumberWithPhoneCode
                          }
                        }
                      }
                    },
                    urls: {
                      type: 'array',
                      required: false,
                      items: {
                        type: 'object',
                        required: false,
                        properties: {
                          url: {
                            type: 'string',
                            minLength: 7,
                            maxLength: 200,
                            pattern: __constants.VALIDATOR.url
                          },
                          type: {
                            type: 'string',
                            minLength: 2,
                            maxLength: 10,
                            pattern: __constants.VALIDATOR.textWithSpace
                          }
                        }
                      }
                    }
                  }
                }
              },
              interactive: {
                type: 'object',
                required: false,
                properties: {
                  type: {
                    type: 'string',
                    required: false
                  },
                  header: {
                    type: 'object',
                    required: false,
                    properties: {
                      type: {
                        type: 'string',
                        required: false
                      },
                      text: {
                        type: 'string',
                        required: false,
                        maxLength: 60
                      }
                    }
                  },
                  body: {
                    type: 'object',
                    required: false,
                    properties: {
                      text: {
                        type: 'string',
                        required: false
                      }
                    }
                  },
                  footer: {
                    type: 'object',
                    required: false,
                    properties: {
                      text: {
                        type: 'string',
                        required: false,
                        maxLength: 60
                      }
                    }
                  },
                  action: {
                    type: 'object',
                    properties: {
                      buttons: {
                        type: 'array',
                        required: false,
                        items: {
                          type: 'object',
                          required: true,
                          properties: {
                            type: {
                              type: 'string',
                              required: true
                            },
                            reply: {
                              type: 'object',
                              required: true,
                              properties: {
                                id: {
                                  type: 'string',
                                  required: true
                                },
                                title: {
                                  type: 'string',
                                  required: true
                                }
                              }

                            }
                          }
                        }

                      },
                      button: {
                        type: 'string',
                        required: false,
                        maxLength: 20
                      },
                      sections: {
                        type: 'array',
                        required: false,
                        items: {
                          type: 'object',
                          required: true,
                          properties: {
                            title: {
                              type: 'string',
                              required: false,
                              maxLength: 24
                            },
                            rows: {
                              type: 'array',
                              required: true,
                              items: {
                                type: 'object',
                                required: true,
                                properties: {
                                  id: {
                                    type: 'string',
                                    required: true
                                  },
                                  title: {
                                    type: 'string',
                                    required: true,
                                    maxLength: 24
                                  },
                                  description: {
                                    type: 'string',
                                    maxLength: 72
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              contentType: {
                type: 'string',
                required: true,
                minLength: 1,
                enum: ['text', 'media', 'template', 'location', 'interactive', 'contact']
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
                    required: ['mediaId']
                  },
                  {
                    required: ['url']
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
                                minLength: 1
                                // pattern: __constants.VALIDATOR.noTabLinebreakSpace
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
              },
              {
                properties: {
                  contentType: { const: 'interactive' }
                },
                required: ['interactive']
              },
              {
                properties: {
                  contentType: { const: 'contact' }
                },
                required: ['contact']
              }
            ]
          },
          isCampaign: {
            type: 'boolean',
            required: false,
            default: false
          }
        },
        oneOf: [
          {
            required: [
              'isChatBot'
            ]
          },
          {
            required: [
              'isCampaign'
            ]
          },
          {
            not: {
              anyOf: [{
                required: ['isChatBot']
              }, {
                required: ['isCampaign']
              }]
            }
          }
        ],
        additionalProperties: false
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
        __logger.error('validadtion: formatedError:', formatedErr[formatedErr.length - 1])
        if (formatedErr[formatedErr.length - 1] && formatedErr[formatedErr.length - 1].includes('[subschema 0],[subschema 1],[subschema 2],[subschema 3],[subschema 4]')) {
          formatedError.push('contact should be an array, it should consist name object, with atleast one [firstName, middleName, lastName, prefix, suffix]')
        } else if (formatedErr[formatedErr.length - 1] && formatedErr[formatedErr.length - 1].includes('[subschema 0],[subschema 1],[subschema 2]')) {
          formatedError.push('content should be an object, it should consist of atleast one [ text, media, location]')
        } else if (formatedErr[formatedErr.length - 1] && formatedErr[formatedErr.length - 1].includes('instance[1] is not exactly one from [subschema 0],[subschema 1]')) {
          formatedError.push('Either isCampaign or isChatBot or both should should not be present')
        } else if (formatedErr[formatedErr.length - 1] && formatedErr[formatedErr.length - 1].includes('[subschema 0],[subschema 1]')) {
          formatedError.push('Media should contain atleast one from these both keys:- url or mediaId and caption is optional')
        } else if (formatedErr[formatedErr.length - 1] && formatedErr[formatedErr.length - 1].includes('birthday does not match')) {
          formatedError.push('birthday value should be in YYYY-MM-DD format eg: 1970-01-01')
        } else if (formatedErr[formatedErr.length - 1] && formatedErr[formatedErr.length - 1].includes('does not match pattern') && formatedErr[formatedErr.length - 1].includes('^[a-zA-Z\\t\\\\s]*$')) {
          formatedError.push(formatedErr[formatedErr.length - 1].split(' ')[0] + ' field should not contain special characters')
        } else if (formatedErr[formatedErr.length - 1] && formatedErr[formatedErr.length - 1].includes('does not match pattern')) {
          formatedError.push(formatedErr[formatedErr.length - 1].split(' ')[0] + ' field should contain special characters -() only')
        } else {
          formatedError.push(formatedErr[formatedErr.length - 1])
        }
      }
    })

    // check validation for similar fromNumber
    const fromNumber = request[0].whatsapp.from
    const fromNumberIsValid = request.every((obj) => obj.whatsapp.from === fromNumber)
    if (!fromNumberIsValid) {
      formatedError.push('From number should be same across the entire request body')
    }

    // check validation for similar value of isCampaign
    const isCampaign = request[0].isCampaign
    const isCampaignIsValid = request.every((obj) => obj.isCampaign === isCampaign)
    if (!isCampaignIsValid) {
      formatedError.push('isCampaign value should be same across the entire request body')
    }

    // check validation for similar value of isChatBot
    const isChatBot = request[0].isChatBot
    const isChatBotIsValid = request.every((obj) => obj.isChatBot === isChatBot)
    if (!isChatBotIsValid) {
      formatedError.push('isChatBot value should be same across the entire request body')
    }

    // all json's contentType should be same
    const contentType = request[0].whatsapp.contentType
    const contentTypeIsValid = request.every((obj) => obj.whatsapp.contentType === contentType)
    if (!contentTypeIsValid) {
      formatedError.push('contentType value should be same across the entire request body')
    }

    // all templates should be of same template
    if (contentTypeIsValid && request[0] && request[0].whatsapp && request[0].whatsapp.contentType === 'template') {
      const templateId = request[0].whatsapp.template.templateId
      const templateIdIsValid = request.every((obj) => obj.whatsapp.template.templateId === templateId)
      if (!templateIdIsValid) {
        formatedError.push('templateId value should be same across the entire request body')
      }
    }

    // all contacts's birthday date format should be same
    if ('contact' in request[0].whatsapp) {
      const birthdayIsValid = request.every((obj) => {
        return obj.whatsapp.contact.every(d => {
          return __constants.VALIDATOR.dateFormat.test(d.birthday)
        })
      })
      if (!birthdayIsValid) {
        formatedError.push('birthday value should be in YYYY-MM-DD format eg: 1970-01-01')
      }
    }

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
        },
        errorMsg: {
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
          minLength: 6,
          maxLength: 15,
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
