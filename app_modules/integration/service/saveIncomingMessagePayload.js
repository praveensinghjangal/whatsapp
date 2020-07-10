const q = require('q')
const _ = require('lodash')
const __db = require('../../../lib/db')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const Validator = require('jsonschema').Validator
const __config = require('../../../config')
const request = require('request')
const v = new Validator()

const validateInput = input => {
  const isvalid = q.defer()
  const schema = {
    id: '/saveIncomingMessagePayload',
    type: 'object',
    required: true,
    properties: {
      vivaMessageId: {
        type: 'string',
        required: true,
        minLength: 1
      },
      serviceProviderMessageId: {
        type: 'string',
        required: true,
        minLength: 1
      },
      payload: {
        type: 'object',
        required: true,
        minProperties: 1
      },
      fromNumber: {
        type: 'string',
        required: true,
        minLength: 1
      }
    }
  }
  const formatedError = []
  v.addSchema(schema, '/saveIncomingMessagePayload')
  const error = _.map(v.validate(input, schema).errors, 'stack')
  _.each(error, function (err) {
    const formatedErr = err.split('.')
    formatedError.push(formatedErr[formatedErr.length - 1])
  })
  if (formatedError.length > 0) {
    isvalid.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: formatedError })
  } else {
    isvalid.resolve(input)
  }
  return isvalid.promise
}

function postDatatoAudienceTable (inputData) {
  const audienceData = q.defer()

  const url = __config.base_url + '/helowhatsapp/api/audience/'
  // __logger.info('Url>>>>>>>>>>>>>>>>>>>>>>>>', typeof url)
  console.log('..........................', inputData)

  const audienceDataToBePosted = {
    phoneNumber: inputData,
    channel: 'whatsapp'

  }
  const options = {
    url,
    body: audienceDataToBePosted,
    headers: { Authorization: __config.tyntec.authorization },
    json: true
  }
  // Calling another api for sending messages
  request.post(options, (err, httpResponse, body) => {
    if (err) {
      // __logger.info('err>>>>>>>>>>>>>>>>>>>>>>>>', err)
      audienceData.reject(err)
    } else {
      console.log('Body', body)
      audienceData.resolve(inputData)
    }
  })
  return audienceData.promise
}

module.exports = (vivaMessageId, serviceProviderMessageId, payload, fromNumber) => {
  const payloadStored = q.defer()
  const query = `insert into incoming_message_payload(viva_message_id,service_provider_message_id,service_provider_id,payload,from_number)
  values (?,?,?,?,?)`
  __logger.info('Inside function to store incoming message in incoming_message_payload table', vivaMessageId, serviceProviderMessageId)
  validateInput({ vivaMessageId, serviceProviderMessageId, payload, fromNumber })
    .then(valres => __db.redis.get(payload.to))
    .then(data => {
      postDatatoAudienceTable(fromNumber)
      console.log('dataatatatat', data, typeof data)
      if (data) {
        data = JSON.parse(data)
        return __db.mysql.query(__constants.HW_MYSQL_NAME, query, [vivaMessageId, serviceProviderMessageId, data.serviceProviderId, payload, fromNumber])
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.WABA_ID_NOT_EXISTS, err: {}, data: {} })
      }
    })
    .then(result => {
      if (result && result.affectedRows && result.affectedRows > 0) {
        payloadStored.resolve(true)
      } else {
        payloadStored.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
      }
    })
    .catch(err => {
      __logger.error('error: ', err)
      payloadStored.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
    })
  return payloadStored.promise
}
