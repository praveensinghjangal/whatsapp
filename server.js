const _ = require('lodash')

// process.env.BLUEBIRD_W_FORGOTTEN_RETURN = 0;

// LOAD ENV FILE START ==================================================
if (process.env.NODE_ENV === 'development') require('dotenv').config({ path: process.env.PWD + '/config/.env' })
// LOAD ENV FILE END ====================================================

const SERVER_SCRIPTS = {
  http_api: './workers/http_api.js',
  processQueueConsumer: './workers/message_consumers/processMessage.js',
  mockQueueConsumer: './workers/message_consumers/mockQueueConsumer.js',
  tyntecOutGoingQueueConsumer: './workers/message_consumers/tyntecOutGoingQueueConsumer.js',
  tyntecIncoming: './workers/message_consumers/tyntecIncoming.js',
  tyntecMessageStatus: './workers/message_consumers/tyntecMessageStatus.js',
  facebookMessageStatus: './workers/message_consumers/facebookMessageStatus.js',
  retrySendingPayload: './workers/message_consumers/retrySendingPayload.js',
  fetchAndUpdateTemplateStatus: './workers/schedulers/fetchAndUpdateTemplateStatus.js'
}
const WORKER_TYPE = process.env.WORKER_TYPE || null
if (_.isEmpty(WORKER_TYPE) && _.isEmpty(SERVER_SCRIPTS[WORKER_TYPE])) {
  console.log('no such WORKER_TYPE, possible values - ' + JSON.stringify(Object.keys(SERVER_SCRIPTS)))
  process.exit(1)
}
console.log('Loaded config environment : ' + process.env.NODE_ENV)
console.log('Loaded worker type : ' + WORKER_TYPE)

require(SERVER_SCRIPTS[WORKER_TYPE]).worker.start()
