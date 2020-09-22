const csc = require('country-state-city').default
const _ = require('lodash')

module.exports = (country, state, city) => {
  let countryId = _.find(csc.getAllCountries(), ctry => ctry.name.toLowerCase() === (country ? country.toLowerCase() : ''))
  countryId = countryId ? countryId.id : '0'
  let stateId = _.find(csc.getStatesOfCountry(countryId), st => st.name.toLowerCase() === (state ? state.toLowerCase() : ''))
  stateId = stateId ? stateId.id : '0'
  let cityId = _.find(csc.getCitiesOfState(stateId), ct => ct.name.toLowerCase() === (city ? city.toLowerCase() : ''))
  cityId = cityId ? cityId.id : '0'
  return { countryId, stateId, cityId }
}
