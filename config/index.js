const _ = require('lodash')

const appName = 'helowhatsapp' // remember to rename this variable with new name(without spaces), it will also act as default mongodb database name and logging file name
const dbName = 'helowhatsapp' // change if you want to have different database name than the application name.
let all = {
  env: process.env.NODE_ENV,
  app_name: appName,
  db_name: dbName,
  api_prefix: appName, // added to work with apache and passenger, acts as in general api prefix as well
  base_url: 'http://localhost',
  port: process.env.PORT,
  socket_io_port: 40010,
  default_server_response_timeout: 20 * 60 * 1000, // min*60*1000 requests received will be timedout if not responded within the specified time
  archive_db_name: 'archive',
  authConfig: {
    apiAuthAlias: '/client',
    secretKey: '6de5661ab3c401bcb266dff913',
    cipherAlgorithm: 'aes-256-ctr',
    inactiveTimeFrame: 12 * 60, // min
    forceExpireTimeFrame: 24 * 60, // min
    apiAccessKey: 'hDcbcQxAuGphBBvcMepR',
    serverDocAccessKey: '7ae9f9a2674c42329142b63ee20fd865'
  },
  logging: {
    log_file: '/var/log/' + appName + '/',
    console: true,
    only_console: false,
    level: 'silly', // [silly,debug,verbose,info,warn,error]
    datePattern: 'yyyy-MM-dd', // log rotation
    maxsize: 104857600, // log rotates after specified size of file in bytes
    colorize: 'true',
    mongo: {
      host: 'localhost',
      db: dbName + 'Logs',
      port: 27017,
      username: '',
      password: '',
      enabled: false
    }
  },
  postgresql: {
    init: true,
    options: {
      host: 'localhost',
      port: 5432,
      // database: 'helo_whatsapp',
      database: 'whatsapp_business',
      user: 'postgres',
      password: 'mysecretpassword',
      max_connection: 10,
      idleTimeoutMillis: 30000
    }
    // options: {
    //   host: 'localhost',
    //   user: 'postgres',
    //   database: 'test',
    //   password: 'deepak',
    //   port: 5432,
    //   max_connection: 10
    // }
  },
  elasticsearch: {
    init: false,
    use_auth: false,
    options: {
      host: '10.40.12.205',
      protocol: 'http',
      username: '',
      password: '',
      apiVersion: '5.4',
      // log: 'trace',
      port: 9200
    }
  },
  mongo: {
    init: false,
    host: 'localhost:27017',
    use_auth: true,
    options: {
      db_name: 'db_name',
      authSource: 'admin',
      authMechanism: 'DEFAULT',
      user: '',
      pass: ''
    }
  },
  dynamodb: {
    init: false,
    apiVersion: '2012-08-10',
    region: 'ap-south-1',
    accessKeyId: '',
    secretAccessKey: '',
    delay_connection_callback: 1000
  },
  aws: {
    apiVersion: '2016-11-15',
    region: 'us-west-2',
    accessKeyId: '',
    secretAccessKey: ''
  },
  aws_s3: {
    bucket_config: {
      bucketName: 'bucket_name',
      apiVersion: '2016-11-15',
      region: 'us-west-2',
      accessKeyId: '',
      secretAccessKey: ''
    }
  },
  rabbitmq: {
    init: false,
    amqp_url: 'amqp://localhost:5672/test?heartbeat=30',
    reconnect_interval: 5000,
    delay_connection_callback: 1000,
    use_auth: false,
    host: 'localhost',
    virtual_host: 'virtual_host_name',
    port: '15682',
    user: '',
    pass: '',
    truncate_message_log_length: 30
  },
  redis: {
    init: false,
    user_auth: false,
    host: 'localhost',
    db: '0',
    port: 6379,
    user: '',
    pass: ''
  },
  mysql_aliase_name: {
    init: false,
    // name should be same as object name.
    name: 'mysql_aliase_name',
    is_slave: false,
    options: {
      connection_limit: 50,
      host: 'localhost',
      user: '',
      password: '',
      database: 'db_name',
      acquireTimeout: 0 // set 0 for default timeout
    }
  },
  app_settings: {
    interval: {
      fetch_rabbitmq: 3 * 1000,
      exit_application: 3 * 1000,
      fetch_camp: 1 * 60 * 1000,
      check_archive: 1 * 60 * 1000
    },
    file_upload: {
      default_path: '/var/helouploads',
      json_upload_path: '/var/helouploads/json',
      max_file_size: 500 * 1024 * 1024, // bytes*kbs*mbs
      min_file_size: 50 * 1024 * 1024 // bytes*kbs*mbs
    }
  },
  provider_id_to_provider_name_mapping: {
    1: 'messengerPeople',
    111: 'demo'
  }
}
all = _.merge(all, require('./' + process.env.NODE_ENV + '.js') || {})

all.port = process.env.HTTP_API_PORT ? parseInt(process.env.HTTP_API_PORT) : all.port

all.logging.log_path = all.logging.log_file
all.logging.log_file += appName

all.mongo.uri = 'mongodb://' + all.mongo.host + '/' + (all.mongo.options.db_name || dbName)
if (all.mongo.use_auth) {
  all.mongo.uri = 'mongodb://' + all.mongo.options.user + ':' + all.mongo.options.pass + '@' + all.mongo.host + '/' + (all.mongo.options.db_name || dbName) + '?authSource=' + all.mongo.options.authSource
}
all.redis.uri = 'redis://' + all.redis.host + ':' + all.redis.port + '/' + all.redis.db
if (all.redis.use_auth) {
  all.redis.uri = 'redis://' + all.redis.user + ':' + all.redis.pass + '@' + all.redis.host + ':' + all.redis.port + '/' + all.redis.db
}
all.redis_local.uri = 'redis://' + all.redis_local.host + ':' + all.redis_local.port + '/' + all.redis_local.db
if (all.redis_local.use_auth) {
  all.redis_local.uri = 'redis://' + all.redis_local.user + ':' + all.redis_local.pass + '@' + all.redis_local.host + ':' + all.redis_local.port + '/' + all.redis_local.db
}

// if (all.rabbitmq_vb.init && all.rabbitmq_vb.use_auth) {
//     all.rabbitmq_vb.amqp_url = "amqp://" + all.rabbitmq_vb.user + ":" + all.rabbitmq_vb.pass + "@" + all.rabbitmq_vb.host + ":" + all.rabbitmq_vb.port + "/" + all.rabbitmq_vb.virtual_host + "?heartbeat=30";
// }

all.logging.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : all.logging.level

all.base_url = process.env.APP_DOMAIN ? 'http://' + process.env.APP_DOMAIN : 'http://localhost:' + all.port

module.exports = all
