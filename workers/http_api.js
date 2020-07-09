/**
 *
 * @author deepak.ambekar [1/14/2019].
 */
const express = require('express')
const http = require('http')
const bodyParser = require('body-parser')
const cors = require('cors')
const addRequestId = require('express-request-id')()
const path = require('path')
const socketio = require('socket.io')
const __db = require('../lib/db')
const __logger = require('../lib/logger')
const __util = require('../lib/util')
const __config = require('../config')
const __constants = require('../config/constants')
const helmet = require('helmet')
const authMiddleware = require('../middlewares/authentication')

class httpApiWorker {
  constructor () {
    this.app = {}
    // console.log("welcome http_api");
  }

  async startServer () {
    var vm = this
    await __db.init().then((result) => {
      console.log(result)
      vm.runExpressServer()
    }).catch((error) => {
      console.log(error)
      process.exit(1)
    })
  }

  runExpressServer () {
    var vm = this
    vm.app = express()
    vm.app.use(helmet({
      noCache: true
    }))
    const sixtyDaysInSeconds = 5184000
    vm.app.use(helmet.hsts({
      maxAge: sixtyDaysInSeconds
    }))
    vm.app.use(helmet.frameguard({ action: 'deny' }))
    // vm.app.use(helmet.featurePolicy({
    //     features: {
    //         fullscreen: ["'self'"],
    //         vibrate: ["'none'"],
    //         payment: ['none'],
    //         syncXhr: ["'none'"]
    //     }
    // }))
    // vm.app.use(helmet.noCache())
    // vm.app.disable('x-powered-by');
    // vm.app.disable(helmet.frameguard());
    // vm.app.disable(helmet.xssFilter());
    // view engine setup
    vm.app.set('views', path.join(__dirname, 'views'))
    vm.app.set('view engine', 'pug')
    vm.app.use(addRequestId)
    vm.app.use((req, res, next) => {
      if (!req.timedout) {
        next()
      } else {
        __logger.error('haltOnTimedout, request timedout', { req_uuid: req.id })
        __util.send(res, {
          type: __constants.RESPONSE_MESSAGES.SERVER_TIMEOUT,
          data: { message: 'request from client timedout' }
        })
      }
      req.on('timeout', (time, next) => {
        __logger.error('haltOnTimedout, server response timedout', { req_uuid: req.id })
        __util.send(res, {
          type: __constants.RESPONSE_MESSAGES.SERVER_TIMEOUT,
          data: { message: 'server timed out after ' + time + ' milliseconds' }
        })
      })
    })
    vm.app.use(bodyParser.json({ limit: '100mb' })) // to support JSON-encoded bodies
    vm.app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
      extended: true,
      limit: '100mb'
    }))
    vm.app.use(cors(
      { exposedHeaders: ['Content-disposition'] }
    ))

    authMiddleware.initialize(vm.app)
    require('./../routes')(vm.app)

    vm.app.use((req, res, next) => {
      var err = new Error('Not Found')
      __util.send(res, {
        type: __constants.RESPONSE_MESSAGES.NOT_FOUND,
        data: { message: 'not found' },
        err: err
      })
      next(res)
    })

    vm.app.server = http.createServer(vm.app)
    const io = socketio.listen(vm.app.server)
    vm.app.server.listen(__config.port)
    vm.app.server.timeout = __constants.SERVER_TIMEOUT
    io.sockets.on('connection', (socket) => {
      socket.on('disconnect', () => {
      })
    })
    __logger.info('SERVER SWAGGER API-DOC URL: ' + __config.base_url + '/' + __config.api_prefix + '/api' + '/internal-docs/' + __config.authConfig.serverDocAccessKey + '  ')
    const stopGraceFully = () => {
      vm.stopExpressServer()
      __db.close().then((result) => {
        console.log('success', result)
      }).catch((error) => {
        console.log('error', error)
        process.exit(0)
      })
    }
    process.on('SIGINT', stopGraceFully)
    process.on('SIGTERM', stopGraceFully)
    process.on('uncaughtException', (err) => {
      console.log(' ##### SERVER CRASH ##### \n', err, '\n ########## END ##########')
    })
  }

  stopExpressServer () {
    this.app.server.close()
  }
}

class Worker extends httpApiWorker {
  start () {
    console.log((new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    // call initialization function of extended worker class
    super.startServer()
    // const express_server = new http_api();
    // express_server.startServer();
  }
}

module.exports.worker = new Worker()
