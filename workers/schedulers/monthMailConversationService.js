const q = require('q')
const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const DbService = require('../../app_modules/message/services/dbData')
const moment = require('moment')
const _ = require('lodash')
const EmailService = require('../../lib/sendNotifications/email')
const emailTemplates = require('../../lib/sendNotifications/emailTemplates')
const errorToTelegram = require('../../lib/errorHandlingMechanism/sendToTelegram')
const userIdToUserName = {}
const preMonth = moment().utc().subtract(1, 'months').format('MMMM')
const __config = require('../../config')

const bodyCreator = (array) => {
  const merged = array.reduce((r, { wabaPhoneNumber, messageCountry, ...rest }) => {
    const key = `${wabaPhoneNumber}-${messageCountry}`
    r[key] = r[key] || { wabaPhoneNumber, messageCountry, ui: 0, bi: 0, rc: 0, na: 0 }
    r[key][rest.conversationCategory] = rest.conversationCategoryCount
    r[key].total = r[key].total ? r[key].total + rest.conversationCategoryCount : rest.conversationCategoryCount
    return r
  }, {})
  const arraydata = Object.values(merged)
  return arraydata
}
const bodyCreator1 = (array) => {
  const merged = array.reduce((r, { wabaPhoneNumber, messageCountry, ...rest }) => {
    const key = `${wabaPhoneNumber}-${messageCountry}`
    r[key] = r[key] || { wabaPhoneNumber, messageCountry, ui: 0, bi: 0, rc: 0, na: 0 }
    r[key][rest.conversationCategory] = rest.conversationCategoryCount
    r[key].total = r[key].total ? r[key].total + rest.conversationCategoryCount : rest.conversationCategoryCount
    return r
  }, {})
  const arraydata = Object.values(merged)
  return arraydata
}
// handle no record for mis data as of now mis stops in case of no data but if there is 0 campagin the opt out data should go
const messageStatusOnMailForConversation = () => {
  const conversationMis = q.defer()
  const dbService = new DbService()
  // const date = moment().utc().subtract(1, 'days').format('YYYY-MM-DD')
  // const date = '2022-10-22'
  //   const dateWithTime = moment().utc().subtract(1, 'days').format('YYYY-MM-DD HH:mm:ssZ')
  //   const startOfMonth = moment(dateWithTime).utc().startOf('month').format('YYYY-MM-DD')
  //   const endOfMonth = moment(dateWithTime).utc().endOf('month').format('YYYY-MM-DD')
  const startOfMonth = '2022-09-01'
  const endOfMonth = '2022-09-30'
  // const startOfMonth = moment().utc().subtract(1,'months').startOf('month').format('YYYY-MM-DD');
  // const endOfMonth = moment().utc().subtract(1,'months').endOf('month').format('YYYY-MM-DD');
  let arrayofWabanumber
  dbService.getActiveBusinessNumber()
    .then((data) => {
      console.log('active user', data)
      if (data) {
        arrayofWabanumber = data.wabaNumber.split(',')
        return dbService.getConversationDataBasedOnWabaNumberAllData(arrayofWabanumber, startOfMonth, endOfMonth)
      } else {
        // sudo docker run --rm -it -p 15672:15672 -p 5672:5672 rabbitmq:3-management
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: 'No active waba numbers in platform', data: {} })
      }
    })
    .then((dbResponse) => {
      console.log('111111111111111111111111111111111111', dbResponse)
      if (dbResponse && dbResponse.length) {
        allUserData = bodyCreator(dbResponse)
        console.log('alluserData', allUserData)
        return dbService.getWabaNameByWabaNumberWithCode(arrayofWabanumber)
      }
    })
    .then(dbwabaName => {
      console.log('222222222222222222222222222222222222222222222222', dbwabaName)
      if (dbwabaName && dbwabaName.length) {
        for (let i = 0; i < dbwabaName.length; i++) {
          userIdToUserName[dbwabaName[i].wabaPhoneNumber] = dbwabaName[i].businessName
        }
        console.log('userIdToUserName', userIdToUserName)
      } else {
      // need to develop
      }
    })
    .then(() => {
      for (let i = 0; i < allUserData.length; i++) {
        data = allUserData[i]
        if (data.wabaPhoneNumber) {
          data.businessName = userIdToUserName[data.wabaPhoneNumber]
        } else {
          // need to develop
        }
      }
      console.log('3333333333333333333333333333333333', allUserData)
      return allUserData
    })
    .then((allUserData) => {
      // array of object data
      const allUserGroupedOnBusinessName = _.groupBy(allUserData, item => {
        return [item.businessName]
      })
      //  object with the value of business name as key and value as an array of object data
      //console.log('3333333333333333333333333333333333333333333333333', allUserGroupedOnBusinessName)
      const abc = Object.keys(allUserGroupedOnBusinessName)
      // keys for all business name
      const obj1 = []
      const obj2 = []
      abc.forEach((result) => {
        const q = allUserGroupedOnBusinessName[result]
        //console.log('qqq', q)
        const allUserGroupedOnBusinessName11 = _.groupBy(q, item => {
          return [item.wabaPhoneNumber]
           //  looping the key pushing data again grouping by waba no
        })
        // console.log('----allUserData------',allUserGroupedOnBusinessName11)
        // process.exit(1)
       
        const abc1 = Object.keys(allUserGroupedOnBusinessName11)
        // keys for all wabaphone number
        //console.log('++++++++++++++', abc1)
        abc1.forEach((data) => {
          if (allUserGroupedOnBusinessName11.hasOwnProperty(data)) {
            const obj = { businessName: '', wabaNumber: '', country: [] }
            obj.businessName = allUserGroupedOnBusinessName11[data][0].businessName
            obj.wabaNumber = data
            obj.country = allUserGroupedOnBusinessName11[data]
            obj1.push(obj)
          }
        })
         console.log("$$$$$$$$$$$$$",obj1[0])
      })
      const obj21 = []
      const allUserGroupedOnBusinessName1122 = _.groupBy(obj1, item => {
        return [item.businessName]
      })
      const abc4 = Object.keys(allUserGroupedOnBusinessName1122)
      console.log('}}}}}}}}', abc4)
      abc4.forEach((data) => {
        if (allUserGroupedOnBusinessName1122.hasOwnProperty(data)) {
          console.log('------------', allUserGroupedOnBusinessName1122[data])
          const obj12 = { businessName: '', wabaPhoneNumber: [] }
          obj12.businessName = data
          obj12.wabaPhoneNumber = allUserGroupedOnBusinessName1122[data]
          obj21.push(obj12)
        }
      })
      console.log('}}}}}}}}---', obj21[3])
     
       
      //console.log("////////////",createRowHTML(obj21))

      // return
      // console.log('========', data)
      // console.log('11111111111111111111--1',obj1)    wabanumber with key
      //   let groupNumber
      //   const  objectKeys = Object.keys(allUserGroupedOnBusinessName)
      //   const obj= []
      //   const obj1 = {}
      //   for(let i =0; i<objectKeys.length;i++){
      //     const b = objectKeys[i]
      //     const c = allUserGroupedOnBusinessName[b]
      //     groupNumber =_.groupBy(c ,item => {
      //             return[item['wabaPhoneNumber']];
      //         });
      //         obj1[b] = [groupNumber]
      //         console.log('99999999999999999999999999999999999999999',obj1)
      //       }
      //       obj.push(obj1)
      //       console.log("-------------------------------obj",obj)
      //     console.log("groupNumber-------------------------------------",groupNumber)
      //     return obj
      // }).then((groupNumber)=>{
      //   const abc = Object.keys(groupNumber[0])
      //   const xyz = abc.map((data) => {
      //     console.group("4444444444444444444444",groupNumber[0][data])
      //   })
      //   process.exit(1)\
  
      return mainTable(obj21)
    })
    .then((data)=>{
      console.log('1111111111111111111111111111111',data)
      const emailService = new EmailService(__config.emailProvider)
      
      const subject = `MIS Report for ${preMonth}`
      return emailService.sendEmail(__config.misEmailList, subject, emailTemplates.messageAndConvoMisMonth(data))
      // console.log('_____________', allUserData)
      // process.exit(1)
    })
  // .then((data)=>{
  // const allUserGrouped = _.groupBy(allUserData ,item => {
  //   return [item['businessName']];
  // });
  // const groupBybusinessName = _.groupBy(data, item => item.businessName)
  // console.log("________________---------------------------__ppp",groupBybusinessName)
  //  console.log("11111111111111111111111111111111111111111111111",allUserData)
  // const groupBybusinessName = _.groupBy(data, item => item.businessName )
  // _.each(groupBybusinessName, (singleUserData, wabaKey) => {
  //   const groupNumber = _.groupBy(singleUserData, item => item.wabaPhoneNumber)
  //    console.log("66666666666666666666",singleUserData[wabaKey])
  // })
  // console.log("11111111111111111111111111111111",groupBybusinessName.wabaKey)
  // process.exit(1)
  //   const allUserLastDay = _.groupBy(lastDayData, item => item.wabaPhoneNumber)
  // _.each(allUserLastDay, (singleUserData, wabaKey) => {
  //   const alluserCountryLastDay = _.groupBy(singleUserData, item => item.countryOfPhoneNumber)
  // let emptyjsonLastDay = {}
  // _.each(alluserCountryLastDay, (singlecountryData, key) => {
  //   UserLastDayDataArr = [key, [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], 0]
  // return groupBybusinessName
  // })
  // .then ((data)=>{
  //   function createRowHTML(){
  //     var tableContent=""
  //     for(i=0; i<data.length;i++){
  //     var rowspan = 0;
  //     var detailLength = data.key.length;
  //     rowspan = detailLength;
  //     tableContent += "<tr><td rowspan=" + parseInt(1 + rowspan) + ">" + data.key.getActiveBusinessNumber + "</td></tr>";
  //     // data.map((ele) => {
  //     //   // '<td>'ele.ui'</td>'
  //     //   // <td>ele.bi</td>
  //     //   // <td>ele.rc</td>
  //     //   // <td>ele.na</td>
  //     //   // <td>ele.total</td>
  //     // })
  //   }
  // }
  // console.log(data)
  // dbService.getMisRelatedData(startOfMonth, endOfMonth)
  // .then(responseFromDb => {
  //   const arrayofWabanumber = []
  //   const allUserData = bodyCreator(responseFromDb)
  //   console.log("allUserData", allUserData)
  //   const allUserGrouped = _.groupBy(allUserData, item => item.wabaPhoneNumber)
  //   __logger.info('data fetched from DB ~function=messageStatusOnMail---- allUserGrouped', allUserGrouped)
  //   _.each(allUserGrouped, (singleUserData, key) => {
  //     const UserAllDayDataArr = [key, [0, 0], [0, 0], [0, 0], [0, 0], 0]
  //     singleUserData.forEach(userCountData => {
  //       const removePhoneCodeFromWaba = phoneCodeAndPhoneSeprator(userCountData.wabaPhoneNumber).phoneNumber
  //       if (arrayofWabanumber.indexOf(removePhoneCodeFromWaba) === -1) arrayofWabanumber.push(removePhoneCodeFromWaba)
    //     })
    //   })
    //   console.log('allUserGrouped', allUserGrouped)
    //   return dbService.getWabaNameByWabaNumber(arrayofWabanumber)
    // })
    // .then(dbresponse => {
    //   const userIdToUserName = {}
    //   for (let i = 0; i < dbresponse.length; i++) {
    //     userIdToUserName[dbresponse[i].wabaPhoneNumber] = dbresponse[i].businessName
    //   }
    //   console.log("dbresponse", dbresponse)
    //   //console.log('objects using ',mtdAllUserCount,mtdTotalStatusCount,mtdTotalMessageCount)
    //   return conversationMis.resolve({
    //     // mtdStatusCount: passingObjectToMailer.mtdAllUserCount,
    //     // mtdTotalStatusCount: passingObjectToMailer.mtdTotalStatusCount,
    //     // mtdTotalMessageCount: passingObjectToMailer.mtdTotalMessageCount,
    //     userIdToUserNameConvo: userIdToUserName
    //   })
    // })
    .catch((error) => {
      console.log('error in sending mis ~function=messageStatusOnMailForConversation', error)
      __logger.error('error in sending mis ~function=messageStatusOnMailForConversation', { err: typeof error === 'object' ? error : { error: error.toString() } })
      conversationMis.reject({ type: error.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: error.err || error })
    }).catch((error) => {
      const telegramErrorMessage = 'Monthy MIS report err || function ~ error in Sending monthly MIS'
      errorToTelegram.send(error, telegramErrorMessage)
      console.log('errror', error)
      return conversationMis.reject(error)
    })
  return conversationMis.promise
}


function countryFormatter(countryList){
  let tableCountry =''
  let noOfCountry = countryList.length
  
  if (noOfCountry>1){
     
    for(let i=0; i<noOfCountry;i ++){
      if(i !==0){
        tableCountry +="<tr>"
      }
      tableCountry+= '<td>'+ countryList[i].messageCountry +'</td>'
      tableCountry += "<td>" + countryList[i].ui + "</td>"
        tableCountry += "<td>" + countryList[i].bi + "</td>"
        tableCountry += "<td>" + countryList[i].rc + "</td>"
        tableCountry += "<td>" + countryList[i].na + "</td>"
        tableCountry += "<td>" + countryList[i].total + "</td>"
        if(i !==0 ){
          tableCountry +="</tr>"
        }
    }
    
  }else{
    tableCountry+= '<td>'+ countryList[0].messageCountry +'</td>'
      tableCountry += "<td>" + countryList[0].ui + "</td>"
        tableCountry += "<td>" + countryList[0].bi + "</td>"
        tableCountry += "<td>" + countryList[0].rc + "</td>"
        tableCountry += "<td>" + countryList[0].na + "</td>"
        tableCountry += "<td>" + countryList[0].total + "</td>"
  }
  return tableCountry
}

function wabaFormatter(wabaNumberList){
  let tableWabaNumber =''
  let noOfWabaNumber = wabaNumberList.length
  if(noOfWabaNumber>1){
   
    for(let i=0; i< noOfWabaNumber; i++){
      if(i!==0){
        tableWabaNumber += '<tr>'
      }
      tableWabaNumber += `<td rowspan = ${wabaNumberList[i].country.length}>` + wabaNumberList[i].wabaNumber + "</td>"
      tableWabaNumber +=  countryFormatter(wabaNumberList[i].country)
      if(i!==0 ){
        tableWabaNumber += '</tr>'
      }

    }
    
  }else{
    tableWabaNumber += "<td>" + wabaNumberList[0].wabaNumber + "</td>"
      tableWabaNumber += "" + countryFormatter(wabaNumberList[0].country) + ""
  }
  return tableWabaNumber
    
}

function mainTable(data){
  let tableContent=''
  for (let i = 0; i <data.length; i++) {
    if(i === data.length - 1 ){

    }
    tableContent += `<tr><td rowspan =${ calRowSpan(data[i])}>` + data[i].businessName + "</td>"
    tableContent += "" + wabaFormatter( data[i].wabaPhoneNumber) + "</tr>"
  }
 

 return tableContent
}

function calRowSpan(data){
  let rowspan = 1
  for(let i =0; i < data.wabaPhoneNumber.length ; i++ ){
  if(data.wabaPhoneNumber[i].country && data.wabaPhoneNumber[i].country.length>1){
    rowspan += data.wabaPhoneNumber[i].country.length 
  }
}
  return rowspan
}

function createRowHTML(data) {
  console.log("CALLLEDDD")
  var tableContent = "";
  let ar1 = []
  let arr2=[]
  console.log('::::::::::',data)
  for (var i = 0; i <data.length; i++) {

    ar1[i] = data[i].wabaPhoneNumber.length
    let fgh = 0
    for(var j = 0; j < data[i].wabaPhoneNumber.length; j++){
     fgh = fgh + data[i].wabaPhoneNumber[j].country.length 

    }
    arr2.push(fgh)
    console.log("bbbbbb",fgh)
    ar1[i] = arr2[i]> ar1[i] ?  arr2[i]: ar1[i]
    
  }
  console.log('OOOOOOOOOOOOOOOOOOOOO',ar1)
  console.log('OOOOOOOOOOOOOOOOOOOOO',arr2)
  console.log("{}{}{}{",JSON.stringify(data))
  for (var i = 0; i <data.length; i++) {
  
   // console.log(";;;;;;;;;;;;;;;;;;;",data[i].businessName)
    let rowspan1 = ar1[i]
   
    tableContent += "<tr><td rowspan=" + `${parseInt(rowspan1)}` + ">" + data[i].businessName + "</td>"
    //console.log('YYYY',data[i].businessName)  
    console.log('mmmm',rowspan1)

    for(var j = 0; j < data[i].wabaPhoneNumber.length; j++){
      let rowspan2 = data[i].wabaPhoneNumber[j].country.length
      console.log("&*&*&country length",data[i].wabaPhoneNumber[j].country.length)
      console.log("======================",rowspan2)
      if(rowspan1> 0 ){
        tableContent += "<td rowspan=" + `${parseInt(rowspan2)}` + ">" + data[i].wabaPhoneNumber[j].wabaNumber + "</td>"
      }else{
        tableContent += "<tr><td rowspan=" + `${parseInt(rowspan2)}` + ">" + data[i].wabaPhoneNumber[j].wabaNumber + "</td>"
      }
      rowspan1 =rowspan1-1
      console.log('!!!!',rowspan1)
      
      //  console.log("XXX", data[i].wabaPhoneNumber[j].wabaNumber)
      //  console.log("XXXXX", data[i].wabaPhoneNumber[j].country)
       for(var k=0; k<data[i].wabaPhoneNumber[j].country.length; k ++){
        
        console.log("IQrowspan2",rowspan2)
         if (rowspan2>0){
          tableContent += "<td>" + data[i].wabaPhoneNumber[j].country[k].messageCountry + "</td>"
         }else{
          tableContent += "<tr><td>" + data[i].wabaPhoneNumber[j].country[k].messageCountry + "</td>"
         }
         rowspan2 = rowspan2-1
         console.log('@@@@',rowspan2)
        tableContent += "<td>" + data[i].wabaPhoneNumber[j].country[k].ui + "</td>"
        tableContent += "<td>" + data[i].wabaPhoneNumber[j].country[k].bi + "</td>"
        tableContent += "<td>" + data[i].wabaPhoneNumber[j].country[k].rc + "</td>"
        tableContent += "<td>" + data[i].wabaPhoneNumber[j].country[k].na + "</td>"
     
        tableContent += "<td> "+ data[i].wabaPhoneNumber[j].country[k].total + "</td></tr>"
      
        
        // console.log("??????????????????",data[i].wabaPhoneNumber[j].country[k].total)
       }
    }  
    // calculate rowspan for first cell
  //   var rowspan = 0;
  //   var detailLength = data.result[result].bussinessName.length;
  //   tableContent += "<tr><td rowspan=" + parseInt(1 + rowspan) + ">" + data.result[result].bussinessName + "</td></tr>"
  //   rowspan += detailLength;
  //   for (var i = 0; i < detailLength; i++) {
  //     rowspan += data.result[result].bussinessName[i].wabaPhonenNo.length;
  //     tableContent += "<tr><td rowspan=" + parseInt(1 + rowspan) + ">" + data.result[result].bussinessName[i].wabaPhonenNo + "</td></tr>"
  //     for (var i = 0; j < detailLength; j++) {
  //       rowspan += data.result[result].bussinessName[i].wabaPhonenNo[j].countryName.length;
  //       tableContent += "<tr><td rowspan=" + parseInt(1 + rowspan) + ">" + data.result[result].bussinessName[i].wabaPhonenNo[j].countryName + "</td></tr>";
  //       tableContent += "<tr><td rowspan=" + parseInt(1 + rowspan) + ">" + data.result[result].bussinessName[i].wabaPhonenNo[j].ui + "</td></tr>";
  //       tableContent += "<tr><td rowspan=" + parseInt(1 + rowspan) + ">" + data.result[result].bussinessName[i].wabaPhonenNo[j].bi + "</td></tr>";
  //       tableContent += "<tr><td rowspan=" + parseInt(1 + rowspan) + ">" + data.result[result].bussinessName[i].wabaPhonenNo[j].rc + "</td></tr>";
  //       tableContent += "<tr><td rowspan=" + parseInt(1 + rowspan) + ">" + data.result[result].bussinessName[i].wabaPhonenNo[j].na + "</td></tr>";
  //       tableContent += "<tr><td rowspan=" + parseInt(1 + rowspan) + ">" + data.result[result].bussinessName[i].wabaPhonenNo[j].total + "</td></tr>";

        
    
    
    
    
  //   }

  //   // create rows

      
  //   }
  // }


}
console.log('22222222222222222222222222222222222222222',tableContent)
return tableContent
}

module.exports = messageStatusOnMailForConversation













