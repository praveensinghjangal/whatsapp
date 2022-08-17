const e164 = require('e164')
const csc = require('country-state-city').default

module.exports = number => {
    const countryNumDetails = e164.lookup(number)
    const countryDetails = countryNumDetails && countryNumDetails.code ? csc.getCountryByCode(countryNumDetails.code.toUpperCase()) : {}
    const phoneCode = number.includes('+') ? '+' + countryDetails.phonecode : countryDetails.phonecode
    const phoneNumber = number.substring(phoneCode.length, number.length)
    const countryName = countryNumDetails.name || null
    console.log('phoneSplittedData ==============>', phoneCode, phoneNumber)
    return { phoneNumber, phoneCode, countryName }
}