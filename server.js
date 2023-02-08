const _ = require('lodash')

// process.env.BLUEBIRD_W_FORGOTTEN_RETURN = 0;

// LOAD ENV FILE START ==================================================
if (process.env.NODE_ENV === 'development') require('dotenv').config({ path: process.env.PWD + '/config/.env' })
// LOAD ENV FILE END ====================================================

const SERVER_SCRIPTS = {
  http_api: './workers/http_api.js',
  preProcessQueueConsumer: './workers/message_consumers/preProcessMessage.js',
  processQueueConsumer: './workers/message_consumers/processMessage.js',
  mockQueueConsumer: './workers/message_consumers/mockQueueConsumer.js',
  tyntecOutGoingQueueConsumer: './workers/message_consumers/tyntecOutGoingQueueConsumer.js',
  tyntecIncoming: './workers/message_consumers/tyntecIncoming.js',
  tyntecMessageStatus: './workers/message_consumers/tyntecMessageStatus.js',
  facebookOutGoingQueueConsumer: './workers/message_consumers/facebookOutGoingQueueConsumer.js',
  facebookIncoming: './workers/message_consumers/facebookIncoming.js',
  facebookMessageStatus: './workers/message_consumers/facebookMessageStatus.js',
  retrySendingPayload: './workers/message_consumers/retrySendingPayload.js',
  fetchAndUpdateTemplateStatus: './workers/schedulers/fetchAndUpdateTemplateStatus.js',
  redisPubSubMechanism: './workers/redisPubSubMechanism.js',
  sendToWebhook: './workers/webhook/sendDlr.js',
  processCountScheduler: './workers/schedulers/processCounts',
  misScheduler: './workers/schedulers/mis',
  misSchedulerConversation: './workers/schedulers/misOfConversation',
  templateReports: './workers/schedulers/templateReports.js',
  campaignReports: './workers/schedulers/campaignReports.js',
  userWiseCoversationReports: './workers/schedulers/userWiseCoversationReports.js',
  audienceWebhook: './workers/message_consumers/audienceWebhook.js',
  demoWorker: './workers/embedded_signup_consumers/dummy_consumer.js',
  wabaSetUpConsumer: './workers/embedded_signup_consumers/wabaSetUpConsumer.js',
  bussinessDetailsConsumer: './workers/embedded_signup_consumers/bussinessDetailsConsumer.js',
  spawningContainerConsumer: './workers/embedded_signup_consumers/spawningContainerConsumer.js',
  wabaContainerBindingConsumer: './workers/embedded_signup_consumers/wabaContainerBindingConsumer.js',
  embeddedSingupErrorConsumer: './workers/embedded_signup_consumers/embeddedSingupErrorConsumer.js',
  twoFaConsumer: './workers/embedded_signup_consumers/twoFaConsumer.js',
  sendOptinExcelStreams: './workers/send_optin_excel_streams/sendOptinExcelStreams.js',
  facebookErrorQueuesConsumer: './workers/message_consumers/facebookErrorConsumer.js',
  reportsDownloadConsumer: './workers/reports_download/dlrReports.js',
  dlrZipFileDelete: './workers/reports_download/dlrDeleteCron.js',
  dailyWorker: './workers/schedulers/dailyWorker.js',
  monthlyMailConversation: './workers/schedulers/monthMailConversation.js',
  wabizUrlConfig: './workers/schedulers/wabizCron.js'
}
const WORKER_TYPE = process.env.WORKER_TYPE || null
if (_.isEmpty(WORKER_TYPE) && _.isEmpty(SERVER_SCRIPTS[WORKER_TYPE])) {
  console.log('no such WORKER_TYPE, possible values - ' + JSON.stringify(Object.keys(SERVER_SCRIPTS)))
  process.exit(1)
}
console.log('Loaded config environment : ' + process.env.NODE_ENV)
console.log('Loaded worker type : ' + WORKER_TYPE)

require(SERVER_SCRIPTS[WORKER_TYPE]).worker.start()
