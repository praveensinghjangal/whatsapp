const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
let encrypyDecrypt = require('encrypy-decrypt');
const q = require('q')


MongoClient.connect("mongodb://admin:admin@3.6.0.103:7001/", function (err, db) {
    if (err) {
        console.log('errrrrrrrrrrrrrrrrrr', err)
        console.log('Database not connected! : ' + JSON.stringify(err, undefined, 2));
    } else {
        var dbo = db.db("helowhatsapp");
        console.log('start')
        updateRecords(dbo)
    }
})

const updateRecords = (db) => {
    const getTotalCountData = q.defer()
    getTotalCounts(db)
        .then(async (counts) => {
            console.log('counts', counts)
            let oneTime = 1000
            let idsGotError = []
            let idsUpdated = []
            console.log('at a time data update', oneTime)
            let numberOfTime = Math.ceil(counts / oneTime)
            console.log('numbers of time', numberOfTime)
            for (let i = 0; i < numberOfTime; i++) {
                const offset = i * oneTime
                console.log('numberOfTime', i)
                const data = await getDataOfNumbers(db, oneTime, offset)
                if (data.length > 0) {
                    for (let i = 0; i < data.length; i++) {
                        const value = data[i]
                        if (value && value.customTwo && !value.campName) {
                            let messageIds = value.messageId
                            const customTwo = value.customTwo
                            const campName = objectData[customTwo]
                            if (campName && campName.length) {
                                console.log('campName 1111111111111111', campName)
                                console.log('customTwo 2222222222222222', customTwo)
                                const updateResult = await updateSingleRecords(db, messageIds, campName)
                                if (updateResult === true) {
                                    idsUpdated.push(messageIds)
                                } else {
                                    idsGotError.push(messageIds)
                                }
                            }
                        } else {
                            idsGotError.push(value.messageId)
                        }
                    }
                } else {
                    console.log('no records found', oneTime, offset)
                }
            }
            console.log('ids updates 000000000000000000000000', idsUpdated.length)
            console.log('ids got err 1111111111111111', idsGotError.length)
            // console.log('ids got  with stringfy', JSON.stringify(idsUpdated))
            // console.log('ids got err with stringfy', JSON.stringify(idsGotError[0],idsGotError[1],idsGotError[2],idsGotError[3],idsGotError[4]))
            // con.end();
        })
        .catch(err => {
            console.log('errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr', err)
        })
    return getTotalCountData.promise
}


function getTotalCounts(dbo) {
    const getTotalCounts = q.defer()
    // console.log('111111111111111111111111111111111111111', dbo)
    try {
        dbo.collection("messages").countDocuments({
             createdOn: { $gte: new Date('2022-08-10T18:29:00.000Z'),
              $lte: new Date('2022-09-01T18:30:00.000Z') }})
        .then((result) => {
            // if (err) {
            //     console.log('error getting counts', err)
            //     throw err;
            // }
            console.log('result', result)
            getTotalCounts.resolve(result)
        }).catch((err) => {
            if (err) {
                console.log('error getting counts', err)
                throw err;
            }
        })
        return getTotalCounts.promise
    } catch (error) {
        console.log('getTotalCounts', error)
    }
}
function getDataOfNumbers(db, oneTime, offset) {
    const getDataOfNumbers = q.defer()
    var date = { createdOn: { $gte: new Date('2022-08-10T18:29:00.000Z'), $lte: new Date('2022-09-01T18:30:00.000Z') }, customTwo: { $exists: true, $ne: null } }
    var dataSkip = { limit: oneTime, skip: offset }
    var project = { messageId: 1, customTwo: 1, campName: 1 }
    var objectId = { _id: 1 }
    // var newvalues = { $set: { templateId: templateId } };
    try {
        db.collection("messages").find(date, dataSkip).project(project).sort(objectId).toArray((err, result) => {
            if (err) {
                console.log('error getDataOfNumbers', err)
                throw err;
            }
            console.log('getDataOfNumbers result', result)
            getDataOfNumbers.resolve(result)
        })
        return getDataOfNumbers.promise
    } catch (err) {
        console.log('222222222222222222222222222222222222222222222222', err)
    }
    return getDataOfNumbers.promise
}