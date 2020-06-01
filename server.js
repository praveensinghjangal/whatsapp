/**
 *
 * @author deepak.ambekar [1/14/2019].
 */

const _ = require('lodash')
// process.env.BLUEBIRD_W_FORGOTTEN_RETURN = 0;

// LOAD ENV FILE START ==================================================
if (process.env.NODE_ENV === 'development') require('dotenv').config({ path: process.env.PWD + '/config/.env' })
// LOAD ENV FILE END ====================================================

const SERVER_SCRIPTS = {
  http_api: './workers/http_api.js'
  // 'download_worker': "./workers/download_worker.js"
}
const WORKER_TYPE = process.env.WORKER_TYPE || null
if (_.isEmpty(WORKER_TYPE) && _.isEmpty(SERVER_SCRIPTS[WORKER_TYPE])) {
  console.log('no such WORKER_TYPE, possible values - ' + JSON.stringify(Object.keys(SERVER_SCRIPTS)))
  process.exit(1)
}
console.log('Loaded config environment : ' + process.env.NODE_ENV)
console.log('Loaded worker type : ' + WORKER_TYPE)

require(SERVER_SCRIPTS[WORKER_TYPE]).worker.start()
