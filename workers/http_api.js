/**
 *
 * @author deepak.ambekar [1/14/2019].
 */
const express = require('express')
const http = require('http')
const timeout = require('connect-timeout')
const bodyParser = require('body-parser')
const cors = require('cors')
const addRequestId = require('express-request-id')()
const path = require('path')
const favicon = require('serve-favicon')
const socketio = require('socket.io')
const __db = require('../lib/db')
const __logger = require('../lib/logger')
const __util = require('../lib/util')
const __config = require('../config')
const __define = require('../config/define')
const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const helmet = require('helmet')

class httpApiWorker {
  constructor () {
    this.app = {}
    // console.log("welcome http_api");
  }

  authExtractor (req) {
    let token = null
    if (req && req.headers) {
      try {
        if ('authorization' in req.headers) {
          token = req.headers.authorization
        } else {
          token = null
        }
        // token = original_token.split(' ')[1]
      } catch (e) {
        token = null
      }
    }
    return token
  };

  cookieExtractor (req) {
    let token = null
    if (req && req.cookies) {
      try {
        token = req.cookies.jwt
      } catch (e) {
        token = null
      }
    }
    return token
  };

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
    // vm.app.use(favicon(path.join(__dirname, '../public', 'favicon.ico')));

    vm.app.use(addRequestId)
    // vm.app.use(timeout(__config.default_server_response_timeout, {respond: false}));
    vm.app.use((req, res, next) => {
      if (!req.timedout) {
        next()
      } else {
        __logger.error('haltOnTimedout, request timedout', { req_uuid: req.id })
        __util.send(res, {
          type: __define.RESPONSE_MESSAGES.SERVER_TIMEOUT,
          data: { message: 'request from client timedout' }
        })
      }
      req.on('timeout', (time, next) => {
        __logger.error('haltOnTimedout, server response timedout', { req_uuid: req.id })
        __util.send(res, {
          type: __define.RESPONSE_MESSAGES.SERVER_TIMEOUT,
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

    var jwtOptions = {}
    // jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeader();
    // jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();

    /* Commenting as of now start */
    // jwtOptions.jwtFromRequest = ExtractJwt.fromExtractors([this.cookieExtractor, this.authExtractor])
    // jwtOptions.secretOrKey = __config.jwt_secret_key

    // var strategy = new JwtStrategy(jwtOptions, (jwt_payload, next) => {
    //   var user = { user_id: jwt_payload.user_id, username: jwt_payload.username, company_id: jwt_payload.company_id }
    //   if (user) {
    //     next(null, user)
    //   } else {
    //     next(null, false)
    //   }
    // })

    // passport.use(strategy)
    // passport.serializeUser((user, done) => {
    //   done(null, user)
    // })
    // passport.deserializeUser((user, done) => {
    //   done(null, user)
    // })
    // vm.app.use(passport.initialize())
    // vm.app.use(passport.session())
    /* Commenting as of now end */

    require('./../routes')(vm.app)

    vm.app.use((req, res, next) => {
      var err = new Error('Not Found')
      __util.send(res, {
        type: __define.RESPONSE_MESSAGES.NOT_FOUND,
        data: { message: 'not found' }
      })
      next(res)
    })

    vm.app.server = http.createServer(vm.app)
    const io = socketio.listen(vm.app.server)
    vm.app.server.listen(__config.port)
    io.sockets.on('connection', (socket) => {
      socket.on('disconnect', () => {
      })
    })
    __logger.info('SERVER SWAGGER API-DOC URL: ' + __config.base_url + '/' + __config.api_prefix + '/api' + '/docs/server/' + __config.authConfig.serverDocAccessKey)
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

class worker extends httpApiWorker {
  start () {
    console.log((new Date()).toLocaleString() + '   >> Worker PID:', process.pid)
    // call initialization function of extended worker class
    super.startServer()
    // const express_server = new http_api();
    // express_server.startServer();
  }
}

module.exports.worker = new worker()
