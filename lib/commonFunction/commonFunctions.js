const q = require('q')
const HttpService = require('../../lib/http_service')
const __config = require('../../config')
const __constants = require('../../config/constants')

const setProfileStatus = (authTokenOfWhatsapp, userId, serviceProviderId, wabaProfileSetupStatusId) => {
    const sentForApproval = q.defer()
    const http = new HttpService(60000)
    const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: authTokenOfWhatsapp
    }
    const body = {
        userId: userId,
        wabaProfileSetupStatusId: wabaProfileSetupStatusId
    }
    // this.http.Put(profilePicBuffer, 'body', url, headers, false, data.serviceProviderId)
    http.Put(body, 'body', __config.base_url + __constants.INTERNAL_END_POINTS.setProfileStatus, headers, true)
        .then(data => {
            if (data && data && data.data.result) {
                sentForApproval.resolve(data.data.result)
            } else {
                sentForApproval.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: [data.msg] })
            }
        })
        .catch(err => {
            sentForApproval.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
        })
    return sentForApproval.promise
}

module.exports = {
    setProfileStatus
}