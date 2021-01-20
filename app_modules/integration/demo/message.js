const q = require('q')
const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')

class Message {
  constructor (maxConcurrent, userId) {
    this.http = ''
  }

  sendMessage (payload) {
    __logger.info('Inside getMedia Demo provider')
    const deferred = q.defer()
    deferred.resolve({ success: true, message: 'message sent', data: {} })
    return deferred.promise
  }

  getMedia (wabaNumber, mediaId) {
    __logger.info('Inside getMedia Demo provider')
    const deferred = q.defer()
    deferred.resolve({ ...__constants.RESPONSE_MESSAGES.SUCCESS, data: { rows: [{ messageId: 'c8bb7560-b6aa-45ce-aca8-cec4877e8f50', time: '2021-01-11T11:37:58.000Z', to: '918080800808', from: '919860245659', contentType: 'text', senderName: 'Arjun Bhole', message: '😇' }, { messageId: '03f6e7eb-f9dc-45b9-801c-e296d9c02168', time: '2021-01-11T11:10:11.000Z', to: '918080800808', from: '919664786977', contentType: 'text', senderName: 'Mohammed Vasim Ali', message: 'Ndndd\nDhdjd\nDhdjdn\nJsjsjsjss' }, { messageId: '80640de0-4234-46a2-bc70-29bca5b298d9', time: '2021-01-11T11:09:52.000Z', to: '918080800808', from: '919664786977', contentType: 'text', senderName: 'Mohammed Vasim Ali', message: 'Production db' }, { messageId: '1c113f88-15fb-4bcf-9e5c-b14ab6af6adc', time: '2021-01-11T11:09:26.000Z', to: '918080800808', from: '919664786977', contentType: 'text', senderName: 'Mohammed Vasim Ali', message: 'Vasim' }, { messageId: '503fe8cb-5ac8-4d98-9ea1-c8385d3bf256', time: '2021-01-11T11:09:25.000Z', to: '918080800808', from: '919664786977', contentType: 'text', senderName: 'Mohammed Vasim Ali', message: 'Hiiee' }, { messageId: '059d5a7f-2d7d-4998-a950-7ecdb9fed110', time: '2021-01-11T10:54:18.000Z', to: '918080800808', from: '919860245659', contentType: 'text', senderName: 'Arjun Bhole', message: 'Hello' }, { messageId: '9d289881-490e-4219-8e29-563f2452f6af', time: '2021-01-11T10:49:52.000Z', to: '918080800808', from: '919860245659', contentType: 'media', senderName: 'Arjun Bhole', mediaId: '46d193ab-a676-44eb-9aa6-3350f9fadd9f', mediaType: 'image' }, { messageId: 'e2878b7b-cecc-4d48-9759-86cb1981d01b', time: '2021-01-11T10:35:21.000Z', to: '918080800808', from: '919860245659', contentType: 'text', senderName: 'Arjun Bhole', message: '👍🏻' }, { messageId: 'b62284ea-6b03-4383-abd7-42c05a0724ff', time: '2021-01-11T10:23:43.000Z', to: '918080800808', from: '917666545750', contentType: 'text', senderName: 'Danish', message: 'Gg' }, { messageId: '55ca6399-709a-4416-bb54-99a26c831c43', time: '2021-01-11T10:23:27.000Z', to: '918080800808', from: '917666545750', contentType: 'text', senderName: 'Danish', message: 'Hey' }], pagination: { totalPage: 1, currentPage: 1 } }, error: null })
    return deferred.promise
  }
}

module.exports = Message
