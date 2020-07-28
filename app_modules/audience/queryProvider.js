
const addAudienceData = () => {
  return `INSERT INTO audience 
  (audience_id, phone_number, channel, optin, optin_source_id,
  segment_id,chat_flow_id, name, email, gender, country,created_by,waba_phone_number,first_message,last_message)
  VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,(select CONCAT(wi.phone_code ,wi.phone_number ) 
  from waba_information wi
  where user_id = ? and wi.is_active=1),?,?)`
}

const updateAudienceRecord = () => {
  return `UPDATE audience
  SET channel=?, optin=?, optin_source_id=?,
  segment_id=?, chat_flow_id=?, name=?, email=?, gender=?,
  country=?, updated_by =?,updated_on = now(),waba_phone_number =?,first_message = ?, last_message = ? 
  WHERE audience_id=? and phone_number=? and is_active=true`
}

const getAudienceRecordList = (columnArray) => {
  // console.log('getAudienceRecoredList', columnArray)
  let query = `SELECT audience_id as "audienceId", aud.phone_number as "phoneNumber",
  channel, first_message as "firstMessage",
  last_message as "lastMessage", optin, (last_message between now()- interval 24 HOUR and now()) as tempOptin,
  osm.optin_source as "optinSource",sm.segment_name ,chat_flow_id as "chatFlowId",name,
  aud.email, gender, aud.country
  FROM audience aud
  left join optin_source osm  on osm.optin_source_id  = aud.optin_source_id
  and osm.is_active = true
  left join segment sm  on sm.segment_id  = aud.segment_id
  and sm.is_active  =true
  join waba_information wi on CONCAT(wi.phone_code ,wi.phone_number ) = aud.waba_phone_number and wi.is_active = true
  WHERE aud.is_active = true`

  columnArray.forEach((element, index) => {
    // console.log('Element', element)
    if (element === 'aud.phone_number') {
      query += ` AND LOCATE (?,${element})`
    } else if (element === 'aud.first_message') {
      query += ' AND DATE(?)'
    } else {
      query += ` AND ${element} = ?`
    }
  })
  // console.log('Query', query)
  return query
}

const getAudienceTableDataWithId = () => {
  return `SELECT audience_id as "audienceId", aud.phone_number as "phoneNumber",
  channel, first_message as "firstMessage",
  last_message as "lastMessage", optin, waba_phone_number as "wabaPhoneNumber",
  osm.optin_source as "optinSource",sm.segment_name ,chat_flow_id as "chatFlowId",name,
  aud.email, gender, aud.country
  FROM audience aud
  left join optin_source osm  on osm.optin_source_id  = aud.optin_source_id
  and osm.is_active = true
  left join segment sm  on sm.segment_id  = aud.segment_id
  and sm.is_active  =true
  WHERE aud.is_active = true and aud.audience_id=?`
}

const getAudienceTableDataByPhoneNumber = () => {
  return `SELECT audience_id as "audienceId", aud.phone_number as "phoneNumber",
  channel, first_message as "firstMessage",
  last_message as "lastMessage", segment_id as "segmentId",
  chat_flow_id as "chatFlowId",name, aud.email, gender, aud.country,optin, waba_phone_number as "wabaPhoneNumber"
  FROM audience aud
  join waba_information wi on CONCAT(wi.phone_code ,wi.phone_number ) = aud.waba_phone_number and wi.is_active = 1 and wi.user_id = ?  
  where aud.phone_number=? and aud.is_active=1`
}

const getOptinByPhoneNumber = () => {
  return `select last_message as "lastMessage" ,optin 
  from audience aud 
  where aud.is_active = true 
  and aud.phone_number = ? and waba_phone_number = ?`
}

// Optin Master

const getOptinSourceData = () => {
  return `SELECT optin_source_id as "optinSourceId", optin_source as "optinSource"
  FROM optin_source
  WHERE is_active= true`
}

const getOptinSourceDataById = () => {
  return `SELECT optin_source_id as "optinSourceId", optin_source as "optinSource"
  FROM optin_source
  WHERE is_active= true and optin_source.optin_source_id = ? `
}

const addOptinSourceData = () => {
  return `INSERT INTO optin_source
  (optin_source_id, optin_source, created_on, created_by, is_active)
  VALUES(?, ?, CURRENT_TIMESTAMP, 'admin',  1) `
}

const updateOptinSourceData = () => {
  return `UPDATE optin_source
  SET optin_source=?, updated_on=CURRENT_TIMESTAMP,
  updated_by='admin'
  WHERE optin_source_id=? and is_active = true`
}
// Segment
const getSegmentData = () => {
  return `SELECT segment_id as "segmentId", segment_name as "segmentName"
  FROM segment sg
  WHERE is_active = true`
}

const getSegmentDataById = () => {
  return `SELECT segment_id as "segmentId", segment_name as "segmentName"
  FROM segment 
  WHERE is_active = true and segment.segment_id = ? `
}

const addSegmentData = () => {
  return `INSERT INTO segment
  (segment_id, segment_name, created_on, created_by, is_active)
  VALUES(?, ?, CURRENT_TIMESTAMP, 'admin',  1) `
}

const updateSegmentData = () => {
  return `UPDATE segment
  SET segment_name=?, updated_on=CURRENT_TIMESTAMP,
  updated_by='admin'
  WHERE segment_id=? and is_active = true`
}

module.exports = {
  getAudienceRecordList,
  getAudienceTableDataWithId,
  getAudienceTableDataByPhoneNumber,
  addAudienceData,
  updateAudienceRecord,
  getOptinByPhoneNumber,
  getOptinSourceData,
  getOptinSourceDataById,
  addOptinSourceData,
  updateOptinSourceData,
  getSegmentData,
  getSegmentDataById,
  addSegmentData,
  updateSegmentData
}
