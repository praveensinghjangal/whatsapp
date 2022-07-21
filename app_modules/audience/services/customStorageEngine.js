var excel = require('excel-stream') // package to read excel to objects in stream
const { Transform } = require('stream')
const __constants = require('../../../config/constants')
const __db = require('../../../lib/db')
const rmqObject = __db.rabbitmqHeloWhatsapp.fetchFromQueue()

function getDestination (req, file, cb) {
  cb(null, '')
}

function MyCustomStorage (opts) {
  this.getDestination = (opts.destination || getDestination)
}

MyCustomStorage.prototype._handleFile = function _handleFile (req, file, cb) {
  // set input stream for xlsxWriter stream which will be used to downlaod excel
  req.xlsxWriter.setInputStream(
    // stream of input file
    file.stream
      // convert excel to object stream
      .pipe(excel())
      // process object stream and return formated object for xlsxWriter
      .pipe(getTransformObject())
  )
  cb(null, {
    path: '',
    size: 0
  })
}

module.exports = function (opts) {
  return new MyCustomStorage(opts)
}

// custom logic start:

// return transform stream which will do proccessing
function getTransformObject () {
  const jsonToDb = new Transform({
    writableObjectMode: true,
    readableObjectMode: true,
    transform (chunk, encoding, callback) {
      // to check current memory usage
      // const used = process.memoryUsage().heapUsed / 1024 / 1024
      // console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`)
      // records is blank array decalred below
      if (!chunk.email) {
        delete chunk.email
      }
      if (!chunk.gender) {
        delete chunk.gender
      }
      chunk.channel = __constants.DELIVERY_CHANNEL.whatsapp
      chunk.optin = true
      this.records.push(chunk)
      // console.log(chunk)
      // batch processing of records
      if (this.records.length === __constants.STREAM_OPTIN_BATCH_SIZE) {
        saveDataToDB(this.records)
          .then((data) => {
            // data is modified data
            // data.forEach((record) => {
            //   this.push([...Object.values(record)])
            // })
            // console.log('this.records', this.records)
            console.log('saved to db')
            // reset records for batch processing
            this.records = []
            callback()
          })
      } else {
        callback()
      }
    },
    flush (done) {
      // flush we repeat steps for last records,
      // eg total records 108, last 8 records are left to process
      if (this.records.length > 0) {
        saveDataToDB(this.records)
          .then((data) => {
            // data.forEach((record) => {
            //   this.push([...Object.values(record)])
            // })
            this.records = []
            console.log('done processing')
            done()
          })
      } else {
        console.log('done processing')
        done()
      }
    }
  })
  jsonToDb.records = []
  return jsonToDb
}

// async function to process data
function saveDataToDB (array) {
  return new Promise((resolve, reject) => {
    const authorization = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJfaWQiOiJjZmEwZmZiYy0zMjliLTQzNDktYWQwMi02M2IwNTE2MTBjNTgiLCJwcm92aWRlcklkIjoiYTRmMDM3MjAtM2EzMy00Yjk0LWI4OGEtZTEwNDUzNDkyMTgzIiwid2FiYVBob25lTnVtYmVyIjoiOTE3OTI2NDYwMDk1IiwibWF4VHBzVG9Qcm92aWRlciI6MTV9LCJpYXQiOjE2NTg0MDQ5MzIsImV4cCI6MTY1ODQ5MTMzMn0.3pU27Cd7VCv0qi6AXw2W62TXkP8AvnXziMq8rtk420w'
    rmqObject.sendToQueue(__constants.MQ.send_optin_excel_stream, JSON.stringify({ data: array, authorization: authorization }))
      .then(statusResponse => resolve('done!'))
      .catch(err => {
        reject(err)
      })
  })
}
