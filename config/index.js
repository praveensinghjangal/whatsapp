const __constants = require('./constants')
const appName = __constants.APP_NAME
const dbName = __constants.DB_NAME

module.exports = {
  env: process.env.NODE_ENV,
  app_name: appName,
  db_name: dbName,
  api_prefix: appName,
  port: process.env.PORT,
  base_url: process.env.BASE_URL ? process.env.BASE_URL : 'http://localhost:' + process.env.PORT,
  socket_io_port: process.env.SOCKET_IO_PORT,
  archive_db_name: process.env.ARCHIVE_DB_NAME,
  authConfig: {
    apiAuthAlias: process.env.AUTH_CONFIG_API_AUTH_ALIAS,
    secretKey: process.env.AUTH_CONFIG_SECRET_KEY,
    cipherAlgorithm: process.env.AUTH_CONFIG_CIPHER_ALGORITHM,
    inactiveTimeFrame: +process.env.AUTH_CONFIG_API_AUTH_INACTIVE_TIME_FRAME,
    forceExpireTimeFrame: +process.env.AUTH_CONFIG_API_AUTH_FORCE_EXPIREY_TIME_FRAME,
    apiAccessKey: process.env.AUTH_CONFIG_API_AUTH_API_ACCESS_KEY,
    serverDocAccessKey: process.env.AUTH_CONFIG_API_AUTH_SERVER_DOC_ACCESS_KEY
  },
  logging: {
    log_file: process.env.LOGGING_LOG_PATH + appName,
    console: process.env.LOGGING_CONSOLE === 'true',
    only_console: process.env.LOGGING_ONLY_CONSOLE === 'true',
    level: process.env.LOGGING_LEVEL,
    datePattern: process.env.LOGGING_DATE_PATTERN,
    maxsize: +process.env.LOGGING_MAX_SIZE,
    colorize: process.env.LOGGING_COLORIZE === 'true',
    mongo: {
      host: process.env.LOGGING_MONGO_HOST,
      db: dbName + 'Logs',
      port: +process.env.LOGGING_MONGO_PORT,
      username: process.env.LOGGING_MONGO_USER_NAME,
      password: process.env.LOGGING_MONGO_PASSWORD,
      enabled: process.env.LOGGING_MONGO_ENABLED
    },
    log_path: process.env.LOGGING_LOG_PATH
  },
  elasticsearch: {
    init: process.env.ELASTIC_SEARCH_INIT === 'true',
    use_auth: process.env.ELASTIC_SEARCH_USER_AUTH === 'true',
    options: {
      host: process.env.ELASTIC_SEARCH_OPTIONS_HOST,
      protocol: process.env.ELASTIC_SEARCH_OPTIONS_PROTOCOL,
      username: process.env.ELASTIC_SEARCH_OPTIONS_USER_NAME,
      password: process.env.ELASTIC_SEARCH_OPTIONS_PASSWORD,
      apiVersion: process.env.ELASTIC_SEARCH_OPTIONS_API_VERSION,
      port: +process.env.ELASTIC_SEARCH_OPTIONS_PORT
    }
  },
  mongo: {
    init: process.env.MONGO_INIT === 'true',
    host: process.env.MONGO_HOST,
    options: {
      db_name: process.env.MONGO_OPTIONS_DB_NAME,
      authSource: process.env.MONGO_OPTIONS_AUTH_SOURCE,
      authMechanism: process.env.MONGO_OPTIONS_AUTH_MECHANISM,
      user: process.env.MONGO_OPTIONS_USER,
      pass: process.env.MONGO_OPTIONS_PASS
    },
    name: process.env.MONGO_NAME,
    uri: 'mongodb://' + process.env.MONGO_OPTIONS_USER + ':' + process.env.MONGO_OPTIONS_PASS + '@' + process.env.MONGO_HOST + '/' + (process.env.MONGO_OPTIONS_DB_NAME || dbName) + '?authSource=' + process.env.MONGO_OPTIONS_AUTH_SOURCE
  },
  dynamodb: {
    init: process.env.DYNAMO_DB_INIT === 'true',
    apiVersion: '',
    region: '',
    accessKeyId: '',
    secretAccessKey: '',
    delay_connection_callback: 1000
  },
  aws: {
    apiVersion: process.env.AWS_API_VERSION,
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  aws_s3: {
    bucket_config: {
      bucketName: process.env.AWS_S3_BUCKET_CONFIG_NAME,
      apiVersion: process.env.AWS_S3_BUCKET_CONFIG_API_VERSION,
      region: process.env.AWS_S3_BUCKET_CONFIG__REGION,
      accessKeyId: process.env.AWS_S3_BUCKET_CONFIG_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_S3_BUCKET_CONFIG_SECRET_ACCESS_KEY
    }
  },
  rabbitmq: {
    init: process.env.RABBITMQ_INIT === 'true',
    amqp_url: process.env.RABBITMQ_AMQP_URL,
    reconnect_interval: 5000,
    delay_connection_callback: 1000,
    use_auth: process.env.RABBITMQ_USE_AUTH === 'true',
    host: process.env.RABBITMQ_HOST,
    virtual_host: process.env.RABBITMQ_VIRTUAL_HOST,
    port: process.env.RABBITMQ_PORT,
    user: process.env.RABBITMQ_USER,
    pass: process.env.RABBITMQ_PASS,
    truncate_message_log_length: 30
  },
  app_settings: {
    interval: {
      fetch_rabbitmq: 3 * 1000,
      exit_application: 3 * 1000,
      fetch_camp: 1 * 60 * 1000,
      check_archive: 1 * 60 * 1000
    },
    file_upload: {
      default_path: process.env.APP_SETTINGS_FILE_UPLOAD_DEFAULT_PATH,
      json_upload_path: process.env.APP_SETTINGS_FILE_UPLOAD_JSON_PATH,
      max_file_size: 500 * 1024 * 1024, // bytes*kbs*mbs,
      min_file_size: 50 * 1024 * 1024 // bytes*kbs*mbs
    }
  },
  provider_config: {
    [process.env.SERVICE_PROVIDER_ID_TYNTEC]: {
      name: 'tyntec',
      queueName: process.env.SERVICE_PROVIDER_QUEUE_TYNTEC_OUTGOING,
      servicProviderId: process.env.SERVICE_PROVIDER_ID_TYNTEC
    },
    [process.env.SERVICE_PROVIDER_ID_DEMO]: {
      name: 'demo',
      queueName: process.env.SERVICE_PROVIDER_QUEUE_DEMO,
      servicProviderId: process.env.SERVICE_PROVIDER_ID_DEMO
    }
  },
  service_provider_id: {
    tyntec: process.env.SERVICE_PROVIDER_ID_TYNTEC,
    demo: process.env.SERVICE_PROVIDER_ID_DEMO
  },
  helo_whatsapp_mysql: {
    init: process.env.HW_MYSQL_INIT === 'true',
    name: __constants.HW_MYSQL_NAME,
    is_slave: process.env.HW_MYSQL_IS_SLAVE === 'true',
    options: {
      connection_limit: +process.env.HW_MYSQL_OPTIONS_CONNECTION_LIMIT,
      host: process.env.HW_MYSQL_OPTIONS_HOST,
      user: process.env.HW_MYSQL_OPTIONS_USER,
      password: process.env.HW_MYSQL_OPTIONS_PASSWORD,
      database: process.env.HW_MYSQL_OPTIONS_DATABASE,
      acquireTimeout: 0,
      port: +process.env.HW_MYSQL_OPTIONS_PORT,
      timezone: 'utc'
    }
  },
  postgresql: {
    init: process.env.PSQL_INIT === 'true',
    name: process.env.PSQL_NAME,
    options: {
      host: process.env.PSQL_OPTIONS_HOST,
      port: +process.env.PSQL_OPTIONS_PORT,
      database: process.env.PSQL_OPTIONS_DATABASE,
      user: process.env.PSQL_OPTIONS_USER,
      password: process.env.PSQL_OPTIONS_PASSWORD,
      max: +process.env.PSQL_OPTIONS_MAX_CONNECTIONS,
      idleTimeoutMillis: 30000
    }
  },
  redis_local: {
    init: process.env.REDIS_INIT === 'true',
    host: process.env.REDIS_HOST,
    no_ready_check: process.env.REDIS_NO_READY_CHECK === 'true',
    auth_pass: process.env.REDIS_AUTH_PASS,
    port: process.env.REDIS_PORT,
    uri: 'redis://' + process.env.REDIS_HOST + ':' + process.env.REDIS_PORT + '/' + process.env.REDIS_DB // not used
  },
  integration: {
    messengerPeople: {
      authBaseUrl: 'https://auth.messengerpeople.dev',
      baseUrl: 'https://api.messengerpeople.dev',
      endpoint: {
        token: '/token',
        sendMessage: '/messages'
      },
      clientData: {
        clientId: 'api_docs',
        clientSecret: '',
        grantType: 'client_credentials',
        scope: 'messages:send'
      }
    },
    tyntec: {
      baseUrl: process.env.TYNTEC_BASE_URL
    }
  },
  authentication: {
    jwtSecretKey: process.env.AUTHENTICATION_JWT_SECRET_KEY,
    google: {
      allow: process.env.AUTHENTICATION_GOOGLE_ALLOW === 'true',
      clientID: process.env.AUTHENTICATION_GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTHENTICATION_GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.AUTHENTICATION_GOOGLE_CALLBACK_URL,
      authorizationURL: process.env.AUTHENTICATION_GOOGLE_AUTHORIZATION_URL,
      tokenURL: process.env.AUTHENTICATION_GOOGLE_TOKEN_URL
    },
    facebook: {
      allow: process.env.AUTHENTICATION_FACEBOOK_ALLOW === 'true',
      clientID: process.env.AUTHENTICATION_FACEBOOK_CLIENT_ID,
      clientSecret: process.env.AUTHENTICATION_FACEBOOK_CLIENT_SECRET,
      callbackURL: process.env.AUTHENTICATION_FACEBOOK_CALLBACK_URL,
      profileFields: process.env.AUTHENTICATION_FACEBOOK_PROFILE_FIELDS.split(','),
      authorizationURL: process.env.AUTHENTICATION_FACEBOOK_AUTHORIZATION_URL,
      tokenURL: process.env.AUTHENTICATION_FACEBOOK_TOKEN_URL,
      scopeSeparator: ','
    },
    internal: {
      allow: process.env.AUTHENTICATION_INTERNAL_ALLOW === 'true'
    },
    strategy: {
      google: {
        name: 'google',
        options: {
          scope: process.env.AUTHENTICATION_STRATEGY_GOOGLE_OPTIONS_SCOPE.split(',')
        }
      },
      facebook: {
        name: 'facebook',
        options: {
          scope: process.env.AUTHENTICATION_STRATEGY_FACEBOOK_OPTIONS_SCOPE
        }
      },
      jwt: {
        name: 'jwt',
        options: {
          session: process.env.AUTHENTICATION_STRATEGY_GOOGLE_OPTIONS_SESSION === 'true'
        }
      }
    }
  },
  emailProvider: {
    sendEmail: process.env.EMAIL_PROVIDER_SEND_EMAIL === 'true',
    service: process.env.EMAIL_PROVIDER_SERVICE,
    host: process.env.EMAIL_PROVIDER_HOST,
    port: +process.env.EMAIL_PROVIDER_PORT,
    auth: {
      user: process.env.EMAIL_PROVIDER_AUTH_USER,
      password: process.env.EMAIL_PROVIDER_AUTH_PASSWORD
    },
    tls: process.env.EMAIL_PROVIDER_TLS === 'true',
    debug: process.env.EMAIL_PROVIDER_DEBUG === 'true',
    fromEmail: process.env.EMAIL_PROVIDER_FROM_EMAIL,
    subject: {
      emailVerification: process.env.EMAIL_PROVIDER_SUBJECT_EMAIL_VERIFICATION,
      passwordReset: process.env.EMAIL_PROVIDER_SUBJECT_PASSWORD_RESET,
      templateStatusSubject: process.env.EMAIL_TEMPLATE_STATUS_SUBJECT
    }
  },
  webcpSmsProvider: {
    sendSms: process.env.WEBCP_SMS_PROVIDER_SEND_SMS === 'true',
    apiUrl: process.env.WEBCP_SMS_PROVIDER_API_URL,
    username: process.env.WEBCP_SMS_PROVIDER_USERNAME,
    password: process.env.WEBCP_SMS_PROVIDER_PASSWORD,
    senderId: process.env.WEBCP_SMS_PROVIDER_SENDER_ID,
    cdmaHeader: process.env.WEBCP_SMS_PROVIDER_CDMA_HEADER
  },
  mockWebHook: {
    authorization: process.env.MOCK_WEBHOOK_AUTH,
    receiverNumber: process.env.MOCK_WEBHOOK_RECEIVER_NUMBER.split(','),
    senderNumber: process.env.MOCK_WEBHOOK_SENDER_NUMBER
  },
  internalApiCallToken: process.env.INTERNAL_AUTH_TOKEN,
  optinSource: {
    message: process.env.OPTIN_MESSAGE_SOURCE,
    direct: process.env.OPTIN_DIRECT_SOURCE
  },
  authTokens: process.env.AUTH_TOKENS.split(',') || [],
  chatAppUrl: process.env.CHAT_APP_URL,
  chatAppToken: process.env.CHAT_APP_TOKEN,
  adminPannelBaseUrl: process.env.ADMIN_PANNEL_BASE_URL,
  schedulers: {
    updateTemplateStatus: {
      time: process.env.SCHEDULERS_UPDATE_TEMPLATE_STATUS_TIME,
      timeZone: process.env.SCHEDULERS_UPDATE_TEMPLATE_STATUS_TIMEZONE
    }
  }
}
