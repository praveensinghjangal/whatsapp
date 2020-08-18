const q = require('q')
const _ = require('lodash')
const Validator = require('jsonschema').Validator
const v = new Validator()
const __constants = require('../../../config/constants')

class validate {
  flowManager (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/flowManager',
      type: 'object',
      required: true,
      properties: {
        messageId: {
          type: 'string',
          required: true,
          minLength: 1
        },
        from: {
          type: 'string',
          required: true,
          minLength: 1,
          pattern: '^[0-9]+$'
        },
        to: {
          type: 'string',
          required: true,
          minLength: 1,
          pattern: '^[0-9]+$'
        },
        content: {
          type: 'object',
          required: true,
          minLength: 1,
          properties: {
            contentType: {
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
            }
          ]
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/flowManager')
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

  addUpdateFlow (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/addUpdateFlow',
      type: 'object',
      required: true,
      properties: {
        auotMessageFlowId: {
          type: 'string',
          required: false,
          minLength: 1
        },
        identifierText: {
          type: 'string',
          required: true,
          minLength: 1
        },
        event: {
          type: 'string',
          required: true,
          minLength: 1,
          enum: _.keys(__constants.FLOW_MESSAGE_DB_EVENTS_TO_CODE_EVENTS)
        },
        eventData: {
          type: 'object',
          required: true,
          properties: {
            url: {
              type: 'string',
              required: true,
              minLength: 1
            },
            requiredKeys: {
              type: 'array',
              required: true,
              minItems: 1,
              items: {
                type: 'string'
              }
            }
          }
        },
        flowTopic: {
          type: 'string',
          required: true,
          minLength: 1
        },
        parentIdentifierText: {
          type: 'string',
          required: true,
          minLength: 1
        },
        identifierDisplayName: {
          type: 'string',
          required: true,
          minLength: 1
        }
      }
    }
    if (request && request.auotMessageFlowId) {
      schema.properties.identifierText.required = false
      schema.properties.event.required = false
      schema.properties.eventData.required = false
      schema.properties.eventData.properties.url.required = false
      schema.properties.eventData.properties.requiredKeys.required = false
      schema.properties.flowTopic.required = false
      schema.properties.parentIdentifierText.required = false
      schema.properties.identifierDisplayName.required = false
    }
    const formatedError = []
    v.addSchema(schema, '/addUpdateFlow')
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

  checkWabaNumberExist (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/checkWabaNumberExist',
      type: 'object',
      required: true,
      properties: {
        wabaNumber: {
          type: 'string',
          required: true,
          minLength: 10,
          maxLength: 25,
          pattern: __constants.VALIDATOR.number
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/checkWabaNumberExist')
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
