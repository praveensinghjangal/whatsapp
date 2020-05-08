module.exports = {
    logging: {
        level: 'silly',
        log_file: '/var/log/'
    },
    mysql_user_db: {
        init: true,
        //name should be same as object name.
        name: "mysql_user_db",
        is_slave: false,
        options: {
            connection_limit: 50,
            host: '10.40.13.246',
            user: 'rahul',
            password: 'ChahJ0ox5emi',
            database: 'helo_otp',
            acquireTimeout: 0, //set 0 for default timeout
            port: 3306
        }
    },
    mysql_user_local_db: {
        init: true,
        //name should be same as object name.
        name: "mysql_user_local_db",
        is_slave: false,
        options: {
            connection_limit: 50,
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'helootplocal',
            acquireTimeout: 0, //set 0 for default timeout
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
        init: false,
        host: '10.40.13.246:27018',
        use_auth: true,
        name: "helo_otp",
        options: {
            db_name: 'helo_otp',
            authSource: 'admin',
            authMechanism: 'DEFAULT',
            user: 'root',
            pass: 'BEZRzap2y95Q84'
        }
    },
    // redis_local: {
    //     init: true,
    //     use_auth: true,
    //     host: "10.40.13.246",
    //     db: "2",
    //     port: "6379",
    //     user: "",
    //     pass: "BEZRzap2y95Q84"
    // },
    redis_local: {
        init: true,
        use_auth: true,
        host: "127.0.0.1",
        db: "2",
        port: "6379",
        user: "",
        pass: ""
    },
    rabbitmq_vb: {
        init: false,
        amqp_url: "amqp://10.40.13.246:5672/vb?heartbeat=30",
        reconnect_interval: 5000,
        delay_connection_callback: 1000,
        use_auth: true,
        host: "10.40.13.246",
        virtual_host: "vb",
        port: "5672",
        user: "vb_user",
        pass: "yeij9Adohbaili",
        truncate_message_log_length:30
    }
};