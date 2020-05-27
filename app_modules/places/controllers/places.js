const __util = require('../../../lib/util')
const __logger = require('../../../lib/logger')
const __define = require('../../../config/define')
const csc = require('country-state-city').default

// Get list of all countries
const getAllCountries = (req, res) => {
  __logger.info('Inside Get All countries')

  try {
    const countries = csc.getAllCountries()

    if (countries && countries.length > 0) {
      return __util.send(res, { type: __define.RESPONSE_MESSAGES.SUCCESS, data: countries })
    } else {
      return __util.send(res, { type: __define.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
    }
  } catch (err) {
    return __util.send(res, { type: __define.RESPONSE_MESSAGES.SERVER_ERROR, err: {} })
  }
}

//  Get the list of states in country by the country id provided
const getStatesOfCountry = (req, res) => {
//   __logger.info('Inside Get All States By Country Id', req.query)
  __logger.info('Inside Get All States By Country Id', req.params)

  try {
    if (req.params && req.params.countryId) {
      const states = csc.getStatesOfCountry(req.params.countryId)

      if (states && states.length > 0) {
        return __util.send(res, { type: __define.RESPONSE_MESSAGES.SUCCESS, data: states })
      } else {
        return __util.send(res, { type: __define.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
      }
    } else {
      return __util.send(res, { type: __define.RESPONSE_MESSAGES.INVALID_REQUEST, data: {} })
    }
  } catch (err) {
    return __util.send(res, { type: __define.RESPONSE_MESSAGES.SERVER_ERROR, err: {} })
  }
}

//  Get the list of cities in states by the states id provided
const getCitiesOfState = (req, res) => {
  //   __logger.info('Inside Get All Cities By State Id', req.query)
  __logger.info('Inside Get All States By Country Id', req.params)

  try {
    if (req.params && req.params.stateId) {
      const states = csc.getCitiesOfState(req.params.stateId)

      if (states && states.length > 0) {
        return __util.send(res, { type: __define.RESPONSE_MESSAGES.SUCCESS, data: states })
      } else {
        return __util.send(res, { type: __define.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
      }
    } else {
      return __util.send(res, { type: __define.RESPONSE_MESSAGES.INVALID_REQUEST, data: {} })
    }
  } catch (err) {
    return __util.send(res, { type: __define.RESPONSE_MESSAGES.SERVER_ERROR, err: {} })
  }
}

module.exports = { getAllCountries, getStatesOfCountry, getCitiesOfState }
