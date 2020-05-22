module.exports = {
  logging: {
    level: 'silly',
    log_file: '/var/log/'
  },
  mysql_user_db: {
    init: true,
    // name should be same as object name.
    name: 'mysql_user_db',
    is_slave: false,
    options: {
      connection_limit: 50,
      host: '10.40.13.246',
      user: 'rahul',
      password: 'ChahJ0ox5emi',
      database: 'helo_otp',
      acquireTimeout: 0, // set 0 for default timeout
      port: 3306
    }
  },
  mysql_user_local_db: {
    init: false,
    // name should be same as object name.
    name: 'mysql_user_local_db',
    is_slave: false,
    options: {
      connection_limit: 50,
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'helootplocal',
      acquireTimeout: 0, // set 0 for default timeout
      port: 3306
    }
  },
  // mysql_call_db: {
  //     init: true,
  //     //name should be same as object name.
  //     name: "mysql_call_db",
  //     is_slave: false,
  //     options: {
  //         connection_limit: 50,
  //         host: '10.40.13.246',
  //         user: 'root',
  //         password: 'Y6mk4DNsgnebxLNG',
  //         database: 'helo_otp',
  //         acquireTimeout: 0, //set 0 for default timeout
  //         port: 3306
  //     }
  // },
  mongo: {
    init: true,
    host: '127.0.0.1:27018',
    use_auth: true,
    name: 'helo_whatsapp',
    options: {
      db_name: 'helo_whatsapp',
      authSource: 'admin',
      authMechanism: 'DEFAULT',
      user: 'dbwhatsapp',
      pass: '1kwNPyemcLtbClWJ'
    }
  },
  postgresql: {
    init: true,
    name: 'helo_whatsapp',
    options: {
      host: '127.0.0.1',
      port: 5432,
      database: 'helo_whatsapp',
      user: 'viva_helo_whatsapp',
      password: 'hscbvyhd76734bhdf',
      max_connection: 10,
      idleTimeoutMillis: 30000
    }
  },
  redis_local: {
    init: false,
    use_auth: true,
    host: '127.0.0.1',
    db: '2',
    port: '6379',
    user: '',
    pass: ''
  },
  rabbitmq_vb: {
    init: false,
    amqp_url: 'amqp://10.40.13.246:5672/vb?heartbeat=30',
    reconnect_interval: 5000,
    delay_connection_callback: 1000,
    use_auth: true,
    host: '10.40.13.246',
    virtual_host: 'vb',
    port: '5672',
    user: 'vb_user',
    pass: 'yeij9Adohbaili',
    truncate_message_log_length: 30
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
    }
  },
  authentication: {
    jwtSecretKey: '8d45631ab3d40ebcb2667ff316',
    google: {
      allow: true,
      clientID: '559421680637-3hm6pq8ucqs0jr4jlrogg419qtlpor2k.apps.googleusercontent.com',
      clientSecret: 'ksql2F8tS2YCqRBqZBTU4Ui5',
      callbackURL: 'http://localhost:3000/helowhatsapp/api/users/googleRedirect'
    },
    facebook: {
      allow: true,
      clientID: '2528454964073348',
      clientSecret: '49c3b90cb33922c506fef7ccd5e717b3',
      callbackURL: 'http://localhost:3000/helowhatsapp/api/users/facebookRedirect',
      profileFields: ['id', 'displayName', 'email', 'picture']
    },
    internal: {
      allow: true
    },
    strategy: {
      google: { name: 'google', options: { scope: ['profile', 'email'] } },
      facebook: { name: 'facebook', options: { scope: 'email' } },
      jwt: { name: 'jwt', options: { session: false } }
    }
  },
  emailProvider: {
    service: 'sendgrid',
    host: 'smtp.sendgrid.net',
    port: 25587,
    auth: {
      user: 'apikey',
      password: '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'
    },
    tls: true,
    debug: true,
    fromEmail: 'danish.galiyara@vivaconnect.co',
    subject: {
      emailVerification: 'Helo Whatsapp Email Verification'
    }
  }
}
