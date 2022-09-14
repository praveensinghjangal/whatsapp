const e164 = require('e164')
const csc = require('country-state-city').default

module.exports = number => {
    const countryNumDetails = e164.lookup(number)
    const countryDetails = countryNumDetails && countryNumDetails.code ? csc.getCountryByCode(countryNumDetails.code.toUpperCase()) : {}
    const phoneCode = number.includes('+') ? '+' + countryDetails.phonecode : countryDetails.phonecode
    const phoneNumber = number.substring(phoneCode.length, number.length)
    const countryName = countryDetails.name || 'unknown'
    console.log('countryDetails =====================================>', countryName)
    console.log('111111111111111111111111111111111 phoneSplittedData ==============>', phoneCode, phoneNumber, countryName)
    return { phoneNumber, phoneCode , countryName}
}