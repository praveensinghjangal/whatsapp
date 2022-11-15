const q = require('q')
const __logger = require('../../lib/logger')
const __constants = require('../../config/constants')
const DbService = require('../../app_modules/message/services/dbData')
const moment = require('moment')
const _ = require('lodash')
const EmailService = require('../../lib/sendNotifications/email')
const emailTemplates = require('../../lib/sendNotifications/emailTemplates')
const errorToTelegram = require('../../lib/errorHandlingMechanism/sendToTelegram')
const userWabaToUserName = {}
const preMonth = moment().utc().subtract(1, 'months').format('MMMM')
const __config = require('../../config')
// reduce will make key for data and reduce  according to previous and current value where innitail value is {}
const bodyCreator = (array) => {
  const merged = array.reduce((r, { wabaPhoneNumber, messageCountry, ...rest }) => {
    const key = `${wabaPhoneNumber}-${messageCountry}`
    console.log('key',key)
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
          userWabaToUserName[dbwabaName[i].wabaPhoneNumber] = dbwabaName[i].businessName
        }
        console.log('userWabaToUserName', userWabaToUserName)
      } else {
      // need to develop
      }
    })
    .then(() => {
      for (let i = 0; i < allUserData.length; i++) {
        data = allUserData[i]
        if (data.wabaPhoneNumber) {
          data.businessName = userWabaToUserName[data.wabaPhoneNumber]

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
      console.log('3333333333333333333333333333333333333333333333333', allUserGroupedOnBusinessName)
      const abc = Object.keys(allUserGroupedOnBusinessName)
      // keys for all business name
      const obj1 = []
      const obj2 = []
      abc.forEach((result) => {
        const q = allUserGroupedOnBusinessName[result]
        //console.log('qqq', q)
        const allUserGroupedOnWabaNumber = _.groupBy(q, item => {
          return [item.wabaPhoneNumber]
           //  looping the key pushing data again grouping by waba no
           
          })
          console.log('----allUserData------',allUserGroupedOnWabaNumber)
          const abc1 = Object.keys(allUserGroupedOnWabaNumber)
          // keys for all wabaphone number
          //console.log('++++++++++++++', abc1)
          abc1.forEach((data) => {
            if (allUserGroupedOnWabaNumber.hasOwnProperty(data)) {
              const obj = { businessName: '', wabaNumber: '', country: [] }
              obj.businessName = allUserGroupedOnWabaNumber[data][0].businessName
              obj.wabaNumber = data
              obj.country = allUserGroupedOnWabaNumber[data]
              obj1.push(obj)
            }
          })
          console.log("$$$$$$$$$$$$$",obj1[0])
        })
        const obj21 = []
        const allUserGroupedOnBusinessName22 = _.groupBy(obj1, item => {
          return [item.businessName]
        })
        // data with object key as businessname value and value as an array  with the businessname,wabanumber,country of array
        console.log("^^^^^^^^^^",allUserGroupedOnBusinessName22)
      const abc4 = Object.keys(allUserGroupedOnBusinessName22)
      console.log('}}}}}}}}', abc4)
      //process.exit(1)
      abc4.forEach((data) => {
        if (allUserGroupedOnBusinessName22.hasOwnProperty(data)) {
          console.log('------------', allUserGroupedOnBusinessName22[data])
          const obj12 = { businessName: '', wabaPhoneNumber: [] }
          obj12.businessName = data
          obj12.wabaPhoneNumber = allUserGroupedOnBusinessName22[data]
          obj21.push(obj12)
        }
      })
      console.log('}}}}}}}}---', obj21[3])
     
  
  
      return mainTable(obj21)
    })
    .then((data)=>{
      console.log('1111111111111111111111111111111',data)
      const emailService = new EmailService(__config.emailProvider)
      
      const subject = `MIS Report for ${preMonth}`
      return emailService.sendEmail(__config.misEmailList, subject, emailTemplates.messageAndConvoMisMonth(data))

    })

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
      
        
       }
    }  
  


}
console.log('22222222222222222222222222222222222222222',tableContent)
return tableContent
}

module.exports = messageStatusOnMailForConversation













