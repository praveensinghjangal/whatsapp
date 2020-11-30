const __util = require('../../../lib/util')
const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const csc = require('country-state-city').default

/**
 * @namespace -Places-Controller-
 * @description All the Places API related function are placed here (API’s related to country ,state, city detail).
 */

/**
 * @memberof -Places-Controller-
 * @name Countries
 * @path {GET} /places/countries
 * @description Bussiness Logic :- This API returns list of countries (Get countries list)
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/places/getcountrieslist|Countries}
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @response {array} metadata.data - Array of all the countries with its details
 * @code {200} if the msg is success than return List of all countries.
 * @author Arjun Bhole 27th May, 2020
 * *** Last-Updated :- Danish Galiyara 30th November,2020 ***
 */

const getAllCountries = (req, res) => {
  __logger.info('Inside Get All countries')
  try {
    const countries = []
    countries.push(csc.getAllCountries()[100])
    if (countries && countries.length > 0) {
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: countries })
    } else {
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: [] })
    }
  } catch (err) {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: {} })
  }
}

/**
 * @memberof -Places-Controller-
 * @name States
 * @path {GET} /places/countries/{countryId}/states
 * @description Bussiness Logic :- This API returns list of states (Get states list by country ID)
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 *  <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/places/GetstateslistbycountryID|States}
 * @param {string} [countryId=101] - Id of country returned by /places/countries API.
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @response {array} metadata.data - Array of all the states with it's respective countryId
 * @code {200} if the msg is success than return List of all states with country ID.
 * @author Arjun Bhole 27th May, 2020
 * *** Last-Updated :- Danish Galiyara 30th November,2020 ***
 */

//  Get the list of states in country by the country id provided
const getStatesOfCountry = (req, res) => {
  __logger.info('Inside Get All States By Country Id', req.params)
  try {
    if (req.params && req.params.countryId) {
      const states = csc.getStatesOfCountry(req.params.countryId)
      if (states && states.length > 0) {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: states })
      } else {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: [] })
      }
    } else {
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: [] })
    }
  } catch (err) {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: {} })
  }
}

/**
 * @memberof -Places-Controller-
 * @name Cities
 * @path {GET} /places/states/{stateId}/cities
 * @description Bussiness Logic :- This API returns list of cities (Get cities by state ID)
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
  <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/places/getcitiesbystateID|Cities}
 * @param {string} [stateId=101] - Id of state returned by /places/countries/states API
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @response {array} metadata.data - Array of all the cities with it's respective state_id.
 * @code {200} if the msg is success than return List of all cities with state_id.
 * @author Arjun Bhole 27th May, 2020
 * *** Last-Updated :- Danish Galiyara 30th November,2020 ***
 */

//  Get the list of cities in states by the states id provided
const getCitiesOfState = (req, res) => {
  __logger.info('Inside Get All States By Country Id', req.params)
  try {
    if (req.params && req.params.stateId) {
      const states = csc.getCitiesOfState(req.params.stateId)

      if (states && states.length > 0) {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: states })
      } else {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: [] })
      }
    } else {
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: [] })
    }
  } catch (err) {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: {} })
  }
}

module.exports = { getAllCountries, getStatesOfCountry, getCitiesOfState }
