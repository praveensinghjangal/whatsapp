
const addAudienceData = () => {
  return `INSERT INTO audience
  (audience_id, phone_number, channel, optin, optin_source_id,
  segment_id,chat_flow_id, "name", email, gender, country)
  VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`
}

const updateAudienceRecord = () => {
  return `UPDATE audience
  SET channel=$3, optin=$4, optin_source_id=$5,
  segment_id=$6, chat_flow_id=$7, "name"=$8, email=$9, gender=$10,
  country=$11, updated_on = now(),last_message = now()
  WHERE audience_id=$1 and phone_number=$2`
}

const getAudienceRecordList = (columnArray) => {
  // console.log('getAudienceRecoredList', array)
  let query = `SELECT audience_id as "audienceId", phone_number as "phoneNumber",
  channel, first_message as "firstMessage",
  last_message as "lastMessage", optin,
  osm.optin_source as "optinSource",sm.segment_name ,chat_flow_id as "chatFlowId","name",
  email, gender, country
  FROM audience aud
  left join optin_source_master osm  on osm.optin_source_master_id  = aud.optin_source_id
  and osm.is_active = true
  left join segment_master sm  on sm.segment_id  = aud.segment_id
  and sm.is_active  =true
  WHERE aud.is_active = true`

  columnArray.forEach((element, index) => {
    if (element === 'aud.phone_number') {
      console.log('index inside', index)
      query += ` AND ${element} ~ $${index + 1}`
    } else if (element === 'aud.first_message') {
      query += ` AND ${element}::date = $${index + 1}`
    } else {
      query += ` AND ${element} = $${index + 1}`
    }
  })

  return query
}

const getAudienceTableDataWithId = () => {
  return `SELECT audience_id as "audienceId", phone_number as "phoneNumber",
  channel, to_char(first_message,'DD/MM/YYYY HH:mm:ss') as "firstMessage",
  last_message as "lastMessage", optin,
  osm.optin_source as "optinSource",sm.segment_name ,chat_flow_id as "chatFlowId","name",
  email, gender, country
  FROM audience aud
  left join optin_source_master osm  on osm.optin_source_master_id  = aud.optin_source_id
  and osm.is_active = true
  left join segment_master sm  on sm.segment_id  = aud.segment_id
  and sm.is_active  =true
  WHERE aud.is_active = true and aud.audience_id=$1`
}

const getAudienceTableDataByPhoneNumber = () => {
  return `SELECT audience_id as "audienceId", phone_number as "phoneNumber",
  channel, to_char(first_message,'DD/MM/YYYY HH:mm:ss') as "firstMessage",
  to_char(last_message,'DD/MM/YYYY HH:mm:ss') as "lastMessage", segment_id as "segmentId",
  chat_flow_id as "chatFlowId","name", email, gender, country
  FROM audience
  where phone_number=$1`
}

const getTempOptinStatus = () => {
  return `select phone_number, audience_id ,optin from audience aud 
  where aud.is_active =true 
  and aud.audience_id =$1
  and  aud.last_message between now()- interval  '24 HOURS' and now()`
}

module.exports = {
  getAudienceRecordList,
  getAudienceTableDataWithId,
  getAudienceTableDataByPhoneNumber,
  addAudienceData,
  updateAudienceRecord,
  getTempOptinStatus
}
