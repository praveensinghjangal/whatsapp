const q = require('q')
const _ = require('lodash')
const Validator = require('jsonschema').Validator
const v = new Validator()
const __constants = require('../../../config/constants')
const TrimService = require('../../../lib/trimService/trim')
const trimInput = new TrimService()

class validate {
  login (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/loginAPi',
      type: 'object',
      required: true,
      properties: {
        email: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 50,
          pattern: __constants.VALIDATOR.email
        },
        password: {
          type: 'string',
          required: true,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/loginAPi')
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

  signup (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/signupAPi',
      type: 'object',
      required: true,
      properties: {
        email: {
          type: 'string',
          required: true,
          unique: true,
          minLength: 1,
          maxLength: 50,
          pattern: __constants.VALIDATOR.email
        },
        password: {
          type: 'string',
          required: true,
          minLength: 1,
          trim: true,
          pattern: __constants.VALIDATOR.password
        },
        tncAccepted: {
          type: 'boolean',
          required: true
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/signupAPi')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      if (formatedErr[1].includes('password')) {
        formatedError.push('Please provide password with atleast 1 Uppercase letter, 1 special character and 2 numbers')
      } else if (formatedErr[1].includes('email')) {
        formatedError.push('Please provide valid email address')
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

  signupService (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/signupService',
      type: 'object',
      required: true,
      properties: {
        email: {
          type: 'string',
          required: true,
          unique: true,
          minLength: 1,
          maxLength: 50,
          pattern: __constants.VALIDATOR.email
        },
        password: {
          type: 'string',
          required: true,
          minLength: 1
        },
        tncAccepted: {
          type: 'boolean',
          required: true
        },
        source: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 20
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/signupService')
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

  checkUserIdService (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/checkUserIdService',
      type: 'object',
      required: true,
      properties: {
        userId: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 50
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/checkUserIdService')
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

  // Account Profile Validation Schema

  accountProfile (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/accountProfileApi',
      type: 'object',
      required: true,
      properties: {
        city: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 60
        },
        state: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 60
        },
        country: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 60
        },
        addressLine1: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 250
        },
        addressLine2: {
          type: 'string',
          required: false,
          maxLength: 250
        },
        contactNumber: {
          type: 'string',
          required: false,
          minLength: 10,
          maxLength: 10,
          pattern: __constants.VALIDATOR.number
        },
        phoneCode: {
          type: 'string',
          required: false,
          minLength: 2,
          maxLength: 2,
          pattern: __constants.VALIDATOR.number
        },
        postalCode: {
          type: 'string',
          required: false,
          minLength: 6,
          maxLength: 6,
          pattern: __constants.VALIDATOR.number

        },
        firstName: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 30
        },
        lastName: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 30
        },
        accountManagerName: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 200
        },
        accountTypeId: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 50
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/accountProfileApi')
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

  // Business Profile Validation Schema

  businessProfile (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/businessProfileApi',
      type: 'object',
      required: true,
      properties: {
        billingName: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 80
        },
        city: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 60
        },
        state: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 60
        },
        country: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 60
        },
        addressLine1: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 250
        },
        addressLine2: {
          type: 'string',
          required: false,
          maxLength: 250
        },
        contactNumber: {
          type: 'string',
          required: false,
          minLength: 10,
          maxLength: 10,
          pattern: __constants.VALIDATOR.number
        },
        phoneCode: {
          type: 'string',
          required: false,
          minLength: 2,
          maxLength: 2,
          pattern: __constants.VALIDATOR.number
        },
        postalCode: {
          type: 'string',
          required: false,
          minLength: 6,
          maxLength: 6,
          pattern: __constants.VALIDATOR.number
        },
        gstOrTaxNo: {
          type: 'string',
          required: false,
          minLength: 5,
          maxLength: 30,
          pattern: __constants.VALIDATOR.gst
        },
        panCard: {
          type: 'string',
          required: false,
          minLength: 10,
          maxLength: 20,
          pattern: __constants.VALIDATOR.pan
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/businessProfileApi')
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

  authorize (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/authorize',
      type: 'object',
      required: true,
      properties: {
        apiKey: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 500
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/authorize')
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

  forgotPassword (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/forgotPassword',
      type: 'object',
      required: true,
      properties: {
        email: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 50,
          pattern: __constants.VALIDATOR.email
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/forgotPassword')
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

  changePassword (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/changePassword',
      type: 'object',
      required: true,
      properties: {
        newPassword: {
          type: 'string',
          required: true,
          minLength: 1
        },
        token: {
          type: 'string',
          required: true,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/changePassword')
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

  resetPassword (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/resetPassword',
      type: 'object',
      required: true,
      properties: {
        oldPassword: {
          type: 'string',
          required: true,
          minLength: 1
        },
        newPassword: {
          type: 'string',
          required: true,
          minLength: 1,
          trim: true,
          pattern: __constants.VALIDATOR.password
        },
        confirmNewPassword: {
          type: 'string',
          required: true,
          minLength: 1,
          trim: true,
          pattern: __constants.VALIDATOR.password
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/resetPassword')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      if (formatedErr[1].includes('newPassword')) {
        formatedError.push('Please provide newPassword with atleast 1 Uppercase letter, 1 special character and 2 numbers')
      } else if (formatedErr[1].includes('confirmNewPassword')) {
        formatedError.push('Please provide confirmNewPassword with atleast 1 Uppercase letter, 1 special character and 2 numbers')
      } else {
        formatedError.push(formatedErr[formatedErr.length - 1])
      }
    })
    if (request.newPassword && request.confirmNewPassword && request.newPassword !== request.confirmNewPassword) {
      formatedError.push('newPassword & confirmNewPassword does not match')
    }
    if (formatedError.length > 0) {
      isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      trimInput.singleInputTrim(request)
      isvalid.resolve(request)
    }
    return isvalid.promise
  }

  checkUserAccountManager (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/checkUserAccountManager',
      type: 'object',
      required: true,
      properties: {
        accountManagerName: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 200
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/checkUserAccountManager')
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

  checkAgreementStatusId (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/checkAgreementStatus',
      type: 'object',
      required: true,
      properties: {
        agreementStatus: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 50
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/checkAgreementStatus')
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

  checkAgreementId (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/getAgreementInfoById',
      type: 'object',
      required: true,
      properties: {
        agreementId: {
          type: 'string',
          required: true,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/getAgreementInfoById')
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

  checkAgreementInput (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/checkAgreementInput',
      type: 'object',
      required: true,
      properties: {
        agreementStatus: {
          type: 'string',
          required: true,
          minLength: 1,
          enum: __constants.AGREEMENT_EVALUATION_RESPONSE
        },
        userId: {
          type: 'string',
          required: true,
          minLength: 1
        },
        rejectionReason: {
          type: [null, 'string'],
          required: request.agreementStatus === __constants.AGREEMENT_EVALUATION_RESPONSE[1],
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/checkAgreementInput')
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

  validateAgreementStatus (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/validateAgreementStatus',
      type: 'object',
      required: true,
      properties: {
        agreementStatusId: {
          type: 'string',
          required: true,
          minLength: 1
        },
        userId: {
          type: 'string',
          required: true,
          minLength: 1
        },
        rejectionReason: {
          type: [null, 'string'],
          required: request.agreementStatusId === __constants.AGREEMENT_STATUS.rejected.statusCode,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/validateAgreementStatus')
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

  checkAccountConfigService (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/checkAccountConfigService',
      type: 'object',
      required: true,
      properties: {
        tps: {
          type: 'number',
          required: true,
          minLength: 1
        }
      }
    }
    const formatedError = []
    v.addSchema(schema, '/checkAccountConfigService')
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

  getAgreementListValidator (request) {
    const isvalid = q.defer()
    const schema = {
      id: '/getAgreementListValidator',
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
        agreementStatusId: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 50
        },
        searchText: {
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 50
        }
      }
    }
    if (request && request.searchText) {
      schema.properties.searchText.required = true
    }

    const formatedError = []
    v.addSchema(schema, '/getAgreementListValidator')
    const error = _.map(v.validate(request, schema).errors, 'stack')
    _.each(error, function (err) {
      const formatedErr = err.split('.')
      const patternError = formatedErr && formatedErr[1] && formatedErr[1].includes('pattern')
      const date = patternError && formatedErr[1].includes('startDate') ? 'startDate' : 'endDate'

      if (patternError && (formatedErr[1].includes('startDate') || formatedErr[1].includes('endDate'))) {
        formatedErr[1] = date + ' -invalid date format- use yyyy-mm-dd hh:MM:ss'
      }

      if (patternError && formatedErr[1].includes('searchText')) {
        formatedErr[1] = 'searchText -invalid format- please enter valid user name'
      }
      formatedError.push(formatedErr[formatedErr.length - 1])
    })
    if (formatedError.length > 0) {
      isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
    } else {
      trimInput.singleInputTrim(request)
        .then(data => isvalid.resolve(data))
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
