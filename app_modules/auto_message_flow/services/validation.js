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
