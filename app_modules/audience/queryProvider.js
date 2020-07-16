
const addAudienceData = () => {
  return `INSERT INTO audience
  (audience_id, phone_number, channel, optin, optin_source_id,
  segment_id,chat_flow_id, name, email, gender, country)
  VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
}

const updateAudienceRecord = () => {
  return `UPDATE audience
  SET channel=?, optin=?, optin_source_id=?,
  segment_id=?, chat_flow_id=?, name=?, email=?, gender=?,
  country=?, updated_by =?,updated_on = now(),last_message = now()
  WHERE audience_id=? and phone_number=? and is_active=true`
}

const getAudienceRecordList = (columnArray) => {
  // console.log('getAudienceRecoredList', array)
  let query = `SELECT audience_id as "audienceId", phone_number as "phoneNumber",
  channel, first_message as "firstMessage",
  last_message as "lastMessage", optin,
  osm.optin_source as "optinSource",sm.segment_name ,chat_flow_id as "chatFlowId",name,
  email, gender, country
  FROM audience aud
  left join optin_source osm  on osm.optin_source_master_id  = aud.optin_source_id
  and osm.is_active = true
  left join segment sm  on sm.segment_id  = aud.segment_id
  and sm.is_active  =true
  WHERE aud.is_active = true`

  columnArray.forEach((element, index) => {
    if (element === 'aud.phone_number') {
      console.log('index inside', index)
      query += ` AND ${element}  ~ ?`
    } else if (element === 'aud.first_message') {
      query += ` AND ${element}::date = ?`
    } else {
      query += ` AND ${element} = ${index + 1}`
    }
  })

  return query
}

const getAudienceTableDataWithId = () => {
  return `SELECT audience_id as "audienceId", phone_number as "phoneNumber",
  channel, date_format(first_message,'%d/%m/%Y %H:%i:s%') as "firstMessage",
  last_message as "lastMessage", optin,
  osm.optin_source as "optinSource",sm.segment_name ,chat_flow_id as "chatFlowId",name,
  email, gender, country
  FROM audience aud
  left join optin_source osm  on osm.optin_source_master_id  = aud.optin_source_id
  and osm.is_active = true
  left join segment sm  on sm.segment_id  = aud.segment_id
  and sm.is_active  =true
  WHERE aud.is_active = true and aud.audience_id=?`
}

const getAudienceTableDataByPhoneNumber = () => {
  return `SELECT audience_id as "audienceId", phone_number as "phoneNumber",
  channel, date_format(first_message,'%d/%m/%Y %H:%i:s%') as "firstMessage",
  date_format(last_message,'%d/%m/%Y %H:%i:s%') as "lastMessage", segment_id as "segmentId",
  chat_flow_id as "chatFlowId",name, email, gender, country,optin
  FROM audience
  where phone_number=? and is_active=true`
}

const getTempOptinStatus = () => {
  return `select phone_number, audience_id ,optin from audience aud 
  where aud.is_active =true 
  and aud.audience_id =?
  and  aud.last_message between now()- interval  '24 HOURS' and now()`
}

const getOptinByPhoneNumber = () => {
  return `select last_message as "lastMessage" ,optin 
  from audience aud 
  where aud.is_active =true 
  and aud.phone_number =?`
}

module.exports = {
  getAudienceRecordList,
  getAudienceTableDataWithId,
  getAudienceTableDataByPhoneNumber,
  addAudienceData,
  updateAudienceRecord,
  getTempOptinStatus,
  getOptinByPhoneNumber
}
