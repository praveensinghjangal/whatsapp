const express = require('express')
const http = require('http')
const bodyParser = require('body-parser')
const cors = require('cors')
const addRequestId = require('express-request-id')()
const path = require('path')
// const socketio = require('socket.io')
const __db = require('../lib/db')
const __logger = require('../lib/logger')
const __util = require('../lib/util')
const __config = require('../config')
const __constants = require('../config/constants')
const helmet = require('helmet')
const authMiddleware = require('../middlewares/auth/authentication')
var cluster = require('cluster')
var numCPUs = __config.clusterNumber || 0

class httpApiWorker {
  constructor () {
    this.app = {}
  }

  async startServer () {
    var vm = this
    await __db.init().then((result) => {
      __logger.info(result)
      vm.runExpressServer()
    }).catch((err) => {
      __logger.error('http_api: startServer(): ', err)
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
    /* vm.app.use(helmet.featurePolicy({
        features: {
            fullscreen: ["'self'"],
            vibrate: ["'none'"],
            payment: ['none'],
            syncXhr: ["'none'"]
        }
    }))
    vm.app.use(helmet.noCache())
    vm.app.disable('x-powered-by');
    vm.app.disable(helmet.frameguard());
    vm.app.disable(helmet.xssFilter()); */
    // view engine setup
    vm.app.set('views', path.join(__dirname, 'views'))
    vm.app.set('view engine', 'pug')
    vm.app.use(addRequestId)
    vm.app.use((req, res, next) => {
      if (!req.timedout) {
        next()
      } else {
        __logger.error('http_api: haltOnTimedout, request timedout', { req_uuid: req.id })
        __util.send(res, {
          type: __constants.RESPONSE_MESSAGES.SERVER_TIMEOUT,
          data: { message: 'request from client timedout' }
        })
      }
      req.on('timeout', (time, next) => {
        __logger.error('http_api: haltOnTimedout, server response timedout', { req_uuid: req.id })
        __util.send(res, {
          type: __constants.RESPONSE_MESSAGES.SERVER_TIMEOUT,
          data: { message: 'server timed out after ' + time + ' milliseconds' }
        })
      })
    })
    vm.app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
      extended: true,
      limit: '50mb'
    }))
    vm.app.use(cors(
      { exposedHeaders: ['Content-disposition'] }
    ))
    vm.app.use((req, res, next) => {
      bodyParser.json({ limit: '50mb' })(req, res, err => {
        if (err) {
          __logger.error('http_api: bodyParser limit cross', err)
          return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: {}, data: {} })
        }
        next()
      })
    })
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
    if (cluster.isMaster && numCPUs > 0) {
      for (var i = 0; i < numCPUs; i++) {
        cluster.fork()
      }
    } else {
      vm.app.server = http.createServer(vm.app)
      vm.app.server.listen(__config.port)
      vm.app.server.timeout = __constants.SERVER_TIMEOUT
    }
    // const io = socketio.listen(vm.app.server)
    // io.sockets.on('connection', (socket) => {
    //   socket.on('disconnect', () => {
    //   })
    // })
    __logger.info('SERVER SWAGGER API-DOC URL: ' + __config.base_url + '/' + __config.api_prefix + '/api' + '/internal-docs/' + __config.authConfig.serverDocAccessKey + '  ')
    const stopGraceFully = () => {
      vm.stopExpressServer()
      __db.close().then((result) => {
        __logger.info('success', result)
      }).catch((err) => {
        __logger.error('http_api: stopGraceFully(): ', err.stack)
        process.exit(0)
      })
    }
    process.on('SIGINT', stopGraceFully)
    process.on('SIGTERM', stopGraceFully)
    process.on('uncaughtException', (err) => {
      __logger.info(' ##### SERVER CRASH ##### \n', err, '\n ########## END ##########')
    })
  }

  stopExpressServer () {
    this.app.server.close()
  }
}

class Worker extends httpApiWorker {
  start () {
    __logger.info((new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    // call initialization function of extended worker class
    super.startServer()
    // const express_server = new http_api();
    // express_server.startServer();
  }
}

module.exports.worker = new Worker()
