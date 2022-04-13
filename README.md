![](https://stage-whatsapp.helo.ai/assets/img/logo.png) Platform API
-------------
#### To Run This Application Follow The Steps Below : 
```sh
$ git clone http://git.vivaconnect.co/helo-whatsapp/platform-api.git
```
```sh 
$ cd ./platform-api
```
>Create a file named `.env` in app_root/config folder and paste the content at the end of this document in newly created file.

```sh
$ npm i
```
```sh
$ npm run develop
```
-------------
#### Developement environment .env file :
```sh
NODE_ENV = development
WORKER_TYPE = http_api
PORT = 3000
SOCKET_IO_PORT = 40010
BASE_URL = 'http://localhost:3000'
ARCHIVE_DB_NAME = archive
AUTH_CONFIG_API_AUTH_ALIAS = /client
AUTH_CONFIG_SECRET_KEY = 6de5661ab3c401bcb266dff913
AUTH_CONFIG_CIPHER_ALGORITHM = aes-256-ctr
AUTH_CONFIG_API_AUTH_INACTIVE_TIME_FRAME = 720
AUTH_CONFIG_API_AUTH_FORCE_EXPIREY_TIME_FRAME = 1440
AUTH_CONFIG_API_AUTH_API_ACCESS_KEY = hDcbcQxAuGphBBvcMepR
AUTH_CONFIG_API_AUTH_SERVER_DOC_ACCESS_KEY = 7ae9f9a2674c42329142b63ee20fd865
LOGGING_LOG_PATH = /var/log/
LOGGING_CONSOLE = true
LOGGING_ONLY_CONSOLE = false
LOGGING_LEVEL = silly
LOGGING_DATE_PATTERN = yyyy-MM-dd
LOGGING_MAX_SIZE = 104857600
LOGGING_COLORIZE = true
LOGGING_MONGO_HOST = localhost
LOGGING_MONGO_PORT = 27017
LOGGING_MONGO_USER_NAME = ''
LOGGING_MONGO_PASSWORD = ''
LOGGING_MONGO_ENABLED = false
ELASTIC_SEARCH_INIT = false
ELASTIC_SEARCH_USER_AUTH = false
ELASTIC_SEARCH_OPTIONS_HOST = 10.40.12.205
ELASTIC_SEARCH_OPTIONS_PROTOCOL = http
ELASTIC_SEARCH_OPTIONS_USER_NAME = ''
ELASTIC_SEARCH_OPTIONS_PASSWORD = ''
ELASTIC_SEARCH_OPTIONS_API_VERSION = 5.4
ELASTIC_SEARCH_OPTIONS_PORT = 9200
MONGO_INIT = true
MONGO_HOST = 35.154.250.234:27018
MONGO_OPTIONS_DB_NAME = helo_whatsapp
MONGO_OPTIONS_AUTH_SOURCE = admin
MONGO_OPTIONS_AUTH_MECHANISM = DEFAULT
MONGO_OPTIONS_USER = dbwhatsapp
MONGO_OPTIONS_PASS = 1kwNPyemcLtbClWJ
MONGO_NAME = helo_whatsapp
DYNAMO_DB_INIT = false
AWS_API_VERSION = 2016-11-15
AWS_REGION = us-west-2
AWS_ACCESS_KEY_ID = ''
AWS_SECRET_ACCESS_KEY = ''
AWS_S3_BUCKET_CONFIG_NAME = bucket_name
AWS_S3_BUCKET_CONFIG_API_VERSION = 2016-11-15
AWS_S3_BUCKET_CONFIG__REGION = us-west-2
AWS_S3_BUCKET_CONFIG_ACCESS_KEY_ID = ''
AWS_S3_BUCKET_CONFIG_SECRET_ACCESS_KEY = ''
RABBITMQ_INIT = true
RABBITMQ_AMQP_URL = amqp://35.154.250.234:5672/test?heartbeat=30
RABBITMQ_USE_AUTH = true
RABBITMQ_HOST = 35.154.250.234
RABBITMQ_VIRTUAL_HOST = helowhatsapp
RABBITMQ_PORT = 5672
RABBITMQ_USER = helowhatsapp
RABBITMQ_PASS = m3ppwixn0pKb
APP_SETTINGS_FILE_UPLOAD_DEFAULT_PATH = /var/helouploads
APP_SETTINGS_FILE_UPLOAD_JSON_PATH = var/helouploads/json
HW_MYSQL_INIT = true
HW_MYSQL_IS_SLAVE = false
HW_MYSQL_OPTIONS_CONNECTION_LIMIT = 20
HW_MYSQL_OPTIONS_HOST = 103.69.88.209
HW_MYSQL_OPTIONS_USER = danish
HW_MYSQL_OPTIONS_PASSWORD = haiTh7ohjahc
HW_MYSQL_OPTIONS_DATABASE = helo_whatsapp
HW_MYSQL_OPTIONS_PORT = 3307
PSQL_INIT = true
PSQL_NAME = helo_whatsapp
PSQL_OPTIONS_HOST = 35.154.250.234
PSQL_OPTIONS_PORT = 5432
PSQL_OPTIONS_DATABASE = helo_whatsapp
PSQL_OPTIONS_USER = viva_helo_whatsapp
PSQL_OPTIONS_PASSWORD = hscbvyhd76734bhdf
PSQL_OPTIONS_MAX_CONNECTIONS = 5
REDIS_INIT = true
REDIS_HOST = 35.154.250.234
REDIS_NO_READY_CHECK = true
REDIS_AUTH_PASS = H3c7t44M5mRC
REDIS_PORT = 6380
REDIS_DB = ''
AUTHENTICATION_JWT_SECRET_KEY = 8d45631ab3d40ebcb2667ff316
AUTHENTICATION_GOOGLE_ALLOW = true
AUTHENTICATION_GOOGLE_CLIENT_ID = 559421680637-3hm6pq8ucqs0jr4jlrogg419qtlpor2k.apps.googleusercontent.com
AUTHENTICATION_GOOGLE_CLIENT_SECRET = ksql2F8tS2YCqRBqZBTU4Ui5
AUTHENTICATION_GOOGLE_CALLBACK_URL = http://localhost:3000/helowhatsapp/api/users/googleRedirect
AUTHENTICATION_GOOGLE_AUTHORIZATION_URL = https://accounts.google.com/o/oauth2/v2/auth
AUTHENTICATION_GOOGLE_TOKEN_URL = https://www.googleapis.com/oauth2/v4/token
AUTHENTICATION_FACEBOOK_ALLOW = true
AUTHENTICATION_FACEBOOK_CLIENT_ID = 2528454964073348
AUTHENTICATION_FACEBOOK_CLIENT_SECRET = 49c3b90cb33922c506fef7ccd5e717b3
AUTHENTICATION_FACEBOOK_CALLBACK_URL = http://localhost:3000/helowhatsapp/api/users/facebookRedirect
AUTHENTICATION_FACEBOOK_PROFILE_FIELDS = id,displayName,email,picture
AUTHENTICATION_FACEBOOK_AUTHORIZATION_URL https://www.facebook.com/v3.2/dialog/oauth
AUTHENTICATION_FACEBOOK_TOKEN_URL = https://graph.facebook.com/v3.2/oauth/access_token
AUTHENTICATION_INTERNAL_ALLOW = true
AUTHENTICATION_STRATEGY_GOOGLE_OPTIONS_SCOPE = profile,email
AUTHENTICATION_STRATEGY_FACEBOOK_OPTIONS_SCOPE = email
AUTHENTICATION_STRATEGY_GOOGLE_OPTIONS_SESSION = false
EMAIL_PROVIDER_SERVICE = gmail
EMAIL_PROVIDER_HOST = smtp.gmail.com
EMAIL_PROVIDER_PORT = 587
EMAIL_PROVIDER_AUTH_USER = ''
EMAIL_PROVIDER_AUTH_PASSWORD = ''
EMAIL_PROVIDER_TLS = false
EMAIL_PROVIDER_DEBUG = true
EMAIL_PROVIDER_FROM_EMAIL = 'test@test.com'
EMAIL_PROVIDER_SUBJECT_EMAIL_VERIFICATION = Helo Whatsapp Email Verification
SERVICE_PROVIDER_ID_TYNTEC = f1d44200-4b9d-4901-ae49-5035e0b14a5d
SERVICE_PROVIDER_ID_DEMO = e76a602e-37e3-4c5d-898f-56bf0c880f93
SERVICE_PROVIDER_QUEUE_TYNTEC_OUTGOING = tyntecOutgoing
SERVICE_PROVIDER_QUEUE_DEMO = mock
MOCK_WEBHOOK_AUTH = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InByb3ZpZGVySWQiOiJmMWQ0NDIwMC00YjlkLTQ5MDEtYWU0OS01MDM1ZTBiMTRhNWQiLCJ3YWJhUGhvbmVOdW1iZXIiOiI5MTgwODA4MDA4MDgiLCJzaWduYXR1cmUiOiIzNmJlMThjYy0wNjIyLTRkZjEtOTlhYS00MzM4MzcwYTYwNGMifSwiaWF0IjoxNTkyNTY1Njc2LCJleHAiOjE2MDA2NTIwNzZ9.gM4s7nQ-8rF7bUXGvAqSj2u4YzJsoo3pQPZCMF1qNsE
MOCK_WEBHOOK_RECEIVER_NUMBER = 917666545750
MOCK_WEBHOOK_SENDER_NUMBER = 918080800808
INTERNAL_AUTH_TOKEN = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJfaWQiOiIxNTg5NDQ0MTIzNTI1MTIifSwiaWF0IjoxNTk1MzI4OTAyLCJleHAiOjE5MTA4NjE4MDF9.tBqEcNpNaKDsmtTJl7wj1Y-mm4n4pSWjonMycxMVeG8
OPTIN_MESSAGE_SOURCE = 28614254-12c6-4f44-aa3c-20cf9e9589cb
OPTIN_DIRECT_SOURCE = 5ad4bfa0-4dd1-433b-a88b-ace8197f8c38
AUTH_TOKENS = 8d07e86e-b122-4a54-95c5-ce9b032f935a,bvkhrve7gwdvgw-1f94-43c9-b5ee-256eb0bf764f
CHAT_APP_URL = http://localhost:3002
CHAT_APP_TOKEN = cc255782-1f94-43c9-b5ee-256eb0bf764f
EMAIL_PROVIDER_SUBJECT_PASSWORD_RESET = Request For Password Reset
ADMIN_PANNEL_BASE_URL = http://10.40.12.74:4200
TYNTEC_BASE_URL = https://api.tyntec.com
WEBCP_SMS_PROVIDER_SEND_SMS = false
WEBCP_SMS_PROVIDER_API_URL = https://hapi.smsapi.org/SendSMS.aspx?Username={{1}}&Password={{2}}&MobileNo={{3}}&Message={{4}}&SenderID={{5}}&CDMAHeader={{6}}
WEBCP_SMS_PROVIDER_USERNAME = ''
WEBCP_SMS_PROVIDER_PASSWORD = ''
WEBCP_SMS_PROVIDER_SENDER_ID = HELOVI
WEBCP_SMS_PROVIDER_CDMA_HEADER = HELOVI
EMAIL_PROVIDER_SEND_EMAIL = false
SCHEDULERS_UPDATE_TEMPLATE_STATUS_TIME = 00 00 */4 * * *
SCHEDULERS_UPDATE_TEMPLATE_STATUS_TIMEZONE = Europe/Dublin
EMAIL_TEMPLATE_STATUS_SUBJECT = Template Status Updated
WEB_HOOK_URL = https://whatsapp.helo.ai
HELO_OSS_URL = http://localhost:3003
CLUSTER_NUMBER = 0
SERVICE_PROVIDER_ID_FB = a4f03720-3a33-4b94-b88a-e10453492183
SERVICE_PROVIDER_QUEUE_FB_OUTGOING = fbOutgoing
PRIVATE_AUTH_TOKENS = 8d07e86e-b122-4a54-95c5-ce9b032f935a,8u3795c5ewdv9t-1f94-43c9-b5ee-256eb0bf764f
SUPPORT_BOT_TOKEN = bot5170754620:AAFZHdkiFwgRjGvekhrJVw32SKjkC0cvv_g
SUPPORT_TELEGRAM_CHAT_ID =1104847058

FACEBOOK_GRAPH_API_URL = https://graph.facebook.com
AUTHORIZATION = EAAG0ZAQUaL3wBAPxNeo1MDJeufavMePopf7pfxHdMYeN0NXmZCBQZBsPMZBZBpVH85J7HIptuRneelncDvxR7ZBzgpmuOW7ZCkarTQK0CQ4tkmw8NWLnzzOnOSdnZAJsYH7zEY8nAnv2BeLYClBJb9CL4BaZBh09oz8Bakq9IlgZBHMwqtn1kvWeBX
BUSINESS_ID = 237143287394373
SYSTEM_USER_ID_BSP = 155284020282729
CREDIT_LINE_ID_BSP = 4178067182304065
```