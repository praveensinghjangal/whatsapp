const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
let encrypyDecrypt = require('encrypy-decrypt');
const q = require('q')

var dbo
let count
let data = []

var url = "mongodb://admin:admin@3.6.0.103:7001/";


MongoClient.connect(url, async function (err, db) {
   
    if (err) {throw err;}
    else {
    dbo = db.db("helowhatsapp");
    let gotCount = await getCount();
    console.log("---------------------a-----", gotCount);
     getData(gotCount);
    // console.log("___________gotData",gotData.length)
    }



   
        

    
});

const getCount = () => {
    return new Promise((resolve, reject) => {
        dbo.collection("messages").find({
            createdOn: {
                $gte: new Date("2022-02-18T00:00:00.000Z"),
                $lt: new Date("2022-02-19T00:00:00.000Z")
            }, messageId :'22ab934e-1b0c-4998-9ff8-f6a0ba6d5b83-MjIwMjE4'
        }).count()
        .then((count) => {
            resolve(count)

        })
        .catch((e) => {
            reject(e)

        })


    })
}

const getData = (gotCount) => {
    return new Promise((resolve, reject) => {
         let oneTime = 10
        console.log('at a time data update', oneTime)
        let numberOfTime = Math.ceil(gotCount / oneTime)
        console.log('numbers of time', numberOfTime)
        
        for (let i = 0; i < numberOfTime; i++) {
            const skip = i * oneTime
            console.log('numberOfTime', i)
            
            dbo.collection("messages").find({
                
                    createdOn: {
                                   $gte: new Date("2022-02-18T00:00:00.000Z"),
                                   $lt: new Date("2022-02-19T00:00:00.000Z")
                               }, messageId :'22ab934e-1b0c-4998-9ff8-f6a0ba6d5b83-MjIwMjE4'
            }).sort( { createdOn : 1 } ).limit(oneTime).skip(skip).toArray( function (err, result) {
                if (err) reject(err);
                // encrypyDecrypt.decryptKeysInObj(result, ["senderPhoneNumber"])
                //console.log("heeeyy--",result)
                 console.log("hgjhwfshfjhfhg-------------------------",result[i])
                
                for(i=0;i<result.length; i++){
                    //console.log("heeeyy--",result[i])
                ans =  encrypyDecrypt.decryptKeysInObj([result[i]], ["senderPhoneNumber"], 0)
                console.log("------------------",ans)    
                if (ans.length <= 0) {
                    console.log("it is not decryted with iteration 10 so trying to decrypt with iteration 100")
                    ans =  encrypyDecrypt.decryptKeysInObj([result[i]], ["senderPhoneNumber"], 90)
                    //console.log("rrrrrrrrrr",ans[0].status)
                }
                console.log("hgjhwfshfjhfhg-------------------- decrpyted-----",ans)
                console.log("decrpyted-----",ans[0].status)
                const messageId = ans[0].messageId
                const data1 = ans[0]
                // process.exit(1)
                const updateResult = updateSingleRecords(messageId,ans[0])


                //console.log("eee",data.length)
            }
            
            

            });
        }
        
        resolve(true)
    })

}



function updateSingleRecords(messageId,data1) {
    const updateRocords = q.defer()
    var myquery = { messageId: messageId };
    var data = encrypyDecrypt.encryptKeysInObj({senderPhoneNumber:data1.senderPhoneNumber}, ["senderPhoneNumber"])
    var newvalues = { $set: {senderPhoneNumber : data.senderPhoneNumber,status:encrypyDecrypt.encryptKeysInObj(data1.status, ["senderPhoneNumber"])} };
    //console.log(newvalues)
    try {
        dbo.collection("messages").updateOne(myquery, newvalues , function (err, res) {
            if (err) {
                updateRocords.resolve(false)
                throw err;
            }
            else {
                console.log("completed")
                
                updateRocords.resolve(true)
            }
        });
        return updateRocords.promise
    } catch (err) {
        console.log('222222222222222222222222222222222222222222222222', err)
    }
    db.close();
}
