const e164 = require('e164')
const csc = require('country-state-city').default
const __logger = require('../../lib/logger')

module.exports = number => {
    const countryNumDetails = e164.lookup(number)
    const countryDetails = countryNumDetails && countryNumDetails.code ? csc.getCountryByCode(countryNumDetails.code.toUpperCase()) : {}
    const phoneCode = number.includes('+') ? '+' + countryDetails.phonecode : countryDetails.phonecode
    const phoneNumber = number.substring(phoneCode.length, number.length)
    const countryName = countryDetails.name || 'unknown'
    __logger.info('phoneCodeAndPhoneSeprator: Country Data:', { countryName, phoneCode, phoneNumber })
    return { phoneNumber, phoneCode, countryName }
}