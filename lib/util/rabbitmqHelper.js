const __constants = require('../../config/constants')

module.exports = ((qname, userId, phoneNumber) => {
    console.log('qname, userId, phoneNumber', qname, userId, phoneNumber)
    let checkQueue = __constants.MQ[qname + '_' + userId + '_' + phoneNumber]
    if (checkQueue) {
        return __constants.MQ[qname + '_' + userId + '_' + phoneNumber]
    } else {
        __constants.MQ[qname + '_' + userId + '_' + phoneNumber] = JSON.parse(JSON.stringify(__constants.MQ[qname]))
        __constants.MQ[qname + '_' + userId + '_' + phoneNumber].q_name = __constants.MQ[qname].q_name + '_' + userId + '_' + phoneNumber
        return __constants.MQ[qname + '_' + userId + '_' + phoneNumber]
    }
})