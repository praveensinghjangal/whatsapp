const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const __db = require('../../lib/db')
const UniqueId = require('../../lib/util/uniqueIdGenerator')
const saveIncomingMessagePayloadService = require('../../app_modules/integration/service/saveIncomingMessagePayload')
const RedirectService = require('../../app_modules/integration/service/redirectService')
const q = require('q')
const moment = require('moment')

const sendToFacebookIncomingQueue = (message, queueObj) => {
  const messageRouted = q.defer()
  queueObj.sendToQueue(__constants.MQ.fbIncoming, JSON.stringify(message))
    .then(queueResponse => messageRouted.resolve('done!'))
    .catch(err => messageRouted.reject(err))
  return messageRouted.promise
}

const setTheMappingOfMessageData = (messageDataFromFacebook) => {
  const messageData = {
    to: messageDataFromFacebook.wabaNumber,
    from: messageDataFromFacebook.messages[0].from,
    event: __constants.FACEBOOK_MESSAGE_EVENTS.moMessage,
    channel: __constants.DELIVERY_CHANNEL.whatsapp,
    whatsapp: {
      senderName: messageDataFromFacebook.contacts[0].profile.name || null
    },
    messageId: messageDataFromFacebook.messages[0].id || null,
    timestamp: moment.utc(+(messageDataFromFacebook.messages[0].timestamp + '000')).format('YYYY-MM-DDTHH:mm:ss'),
    receivedAt: moment.utc(+(messageDataFromFacebook.messages[0].timestamp + '000')).format('YYYY-MM-DDTHH:mm:ss')
  }
  if (messageDataFromFacebook.messages[0].text) {
    // text & url
    messageData.content = {
      text: messageDataFromFacebook.messages[0].text.body || null,
      contentType: __constants.FACEBOOK_CONTENT_TYPE.text
    }
  } else if (messageDataFromFacebook.messages[0].image || messageDataFromFacebook.messages[0].voice || messageDataFromFacebook.messages[0].video || messageDataFromFacebook.messages[0].sticker) {
    // image, voice, video, sticker
    messageData.content = {
      content: {
        media: {
          url: '',
          type: messageDataFromFacebook.messages[0].type || null,
          mediaId: messageDataFromFacebook.messages[0][messageDataFromFacebook.messages[0].type].id || null
        },
        contentType: __constants.FACEBOOK_CONTENT_TYPE.media
      }
    }
  } else if (messageDataFromFacebook.messages[0].document) {
    // document
    messageData.content = {
      content: {
        media: {
          url: '',
          type: messageDataFromFacebook.messages[0].type || null,
          caption: messageDataFromFacebook.messages[0].document.caption || null,
          mediaId: messageDataFromFacebook.messages[0].document.id || null
        },
        contentType: __constants.FACEBOOK_CONTENT_TYPE.media
      }
    }
  } else if (messageDataFromFacebook.messages[0].contacts) {
    // contacts
    if (messageDataFromFacebook.messages[0].contacts.phones && messageDataFromFacebook.messages[0].contacts.phones.length) {
      messageDataFromFacebook.messages[0].contacts.phones = messageDataFromFacebook.messages[0].contacts.phones.map(phoneObj => {
        return {
          type: phoneObj.type,
          waId: phoneObj.wa_id,
          phone: phoneObj.phone
        }
      })
    }
    messageData.content = {
      content: {
        contacts: [
          {
            ims: messageDataFromFacebook.messages[0].contacts.ims || null,
            org: messageDataFromFacebook.messages[0].contacts.org || null,
            name: {
              lastName: messageDataFromFacebook.messages[0].contacts.name.last_name || null,
              firstName: messageDataFromFacebook.messages[0].contacts.name.first_name || null,
              middleName: '',
              formattedName: messageDataFromFacebook.messages[0].contacts.name.formatted_name || null
            },
            urls: messageDataFromFacebook.messages[0].contacts.urls || null,
            emails: messageDataFromFacebook.messages[0].contacts.emails || null,
            phones: messageDataFromFacebook.messages[0].contacts.phones || null,
            addresses: messageDataFromFacebook.messages[0].contacts.addresses || null
          }
        ],
        contentType: __constants.FACEBOOK_CONTENT_TYPE.contacts
      }
    }
  } else if (messageDataFromFacebook.messages[0].location) {
    // location
    messageData.content = {
      content: {
        location: {
          latitude: messageDataFromFacebook.messages[0].location.latitude || null,
          longitude: messageDataFromFacebook.messages[0].location.longitude || null
        },
        contentType: __constants.FACEBOOK_CONTENT_TYPE.location
      }
    }
  }
  messageData.retryCount = messageDataFromFacebook.retryCount ? messageDataFromFacebook.retryCount : 0
  return messageData
}

class FacebookConsumer {
  startServer () {
    const queue = __constants.MQ.fbIncoming.q_name
    __db.init()
      .then(result => {
        const rmqObject = __db.rabbitmqHeloWhatsapp.fetchFromQueue()
        __logger.info('facebook incoming message QueueConsumer::Waiting for message...')
        __logger.info('facebook insoming queue consumer started')
        rmqObject.channel[queue].consume(queue, mqData => {
          try {
            const messageDataFromFacebook = JSON.parse(mqData.content.toString())
            // __logger.info('incoming!!!!!!!!!!!!!!!!!!', messageData)
            // change the mapping
            const messageData = setTheMappingOfMessageData(messageDataFromFacebook)
            const uniqueId = new UniqueId()
            const redirectService = new RedirectService()
            messageData.vivaMessageId = uniqueId.uuid()
            const retryCount = messageData.retryCount || 0
            // __logger.info('Alteredddddddddddddddddddddddd------', messageData, retryCount)
            __logger.info('facebook incoming message QueueConsumer:: messageData received:', messageData)
            saveIncomingMessagePayloadService(messageData.vivaMessageId, messageData.messageId, messageData, messageData.from)
              .then(payloadSaved => {
                messageData.messageId = messageData.vivaMessageId
                delete messageData.vivaMessageId
                delete messageData.retryCount
                return redirectService.webhookPost(messageData.to, messageData)
              })
              .then(response => rmqObject.channel[queue].ack(mqData))
              .catch(err => {
                __logger.error('ppperrrrrrrrrr', err, retryCount)
                // __logger.info('condition --->', err.type, __constants.RESPONSE_MESSAGES.NOT_REDIRECTED, err.type === __constants.RESPONSE_MESSAGES.NOT_REDIRECTED)
                if (err && err.type === __constants.RESPONSE_MESSAGES.NOT_REDIRECTED) {
                  // __logger.info('time to check retry count', retryCount, __constants.INCOMING_MESSAGE_RETRY.tyntec, retryCount < __constants.INCOMING_MESSAGE_RETRY.tyntec)
                  if (retryCount < __constants.INCOMING_MESSAGE_RETRY.facebook) {
                    const oldObj = JSON.parse(mqData.content.toString())
                    oldObj.retryCount = retryCount + 1
                    // __logger.info('requeing --->', oldObj)
                    sendToFacebookIncomingQueue(oldObj, rmqObject)
                  }
                }
                rmqObject.channel[queue].ack(mqData)
              })
          } catch (err) {
            __logger.error('facebook incoming message QueueConsumer::error while parsing: ', err.toString())
            console.log('errror-------', err)
            rmqObject.channel[queue].ack(mqData)
          }
        }, { noAck: false })
      })
      .catch(err => {
        __logger.error('facebook incoming message QueueConsumer::error: ', err)
        process.exit(1)
      })

    this.stop_gracefully = function () {
      __logger.info('stopping all resources gracefully')
      __db.close(function () {
        process.exit(0)
      })
    }
    process.on('SIGINT', this.stop_gracefully)
    process.on('SIGTERM', this.stop_gracefully)
  }
}

class Worker extends FacebookConsumer {
  start () {
    __logger.info((new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    super.startServer()
  }
}

module.exports.worker = new Worker()
