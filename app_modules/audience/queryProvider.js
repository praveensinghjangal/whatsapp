
const addAudienceData = () => {
  return `INSERT INTO audience 
  (audience_id, phone_number, channel, optin, optin_source_id,
  segment_id,chat_flow_id, name, email, gender, country,created_by,waba_phone_number,first_message,last_message)
  VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?)`
}

const updateAudienceRecord = () => {
  return `UPDATE audience
  SET channel=?, optin=?, optin_source_id=?,
  segment_id=?, chat_flow_id=?, name=?, email=?, gender=?,
  country=?, updated_by =?,updated_on = now(),waba_phone_number =?,first_message = ?, last_message = ? 
  WHERE audience_id=? and phone_number=? and is_active=true`
}

const getAudienceRecordList = (columnArray, offset, limit, userId, startDate, endDate) => {
  let query = `SELECT count(1) over() as "totalFilteredRecord", audience_id as "audienceId", aud.phone_number as "phoneNumber",
  channel, first_message as "firstMessage",
  last_message as "lastMessage", optin, (last_message between now()- interval 24 HOUR and now()) as tempOptin,
  osm.optin_source as "optinSource",sm.segment_name ,chat_flow_id as "chatFlowId",name,
  aud.email, gender, aud.country
  FROM audience aud
  left join optin_source osm  on osm.optin_source_id  = aud.optin_source_id
  and osm.is_active = true
  left join segment sm  on sm.segment_id  = aud.segment_id
  and sm.is_active  =true
  left join audience_waba_no_mapping awnm  on awnm.aud_mapping_id  = aud.waba_phone_number
  and awnm.is_active  =true
  join waba_information wi on CONCAT(wi.phone_code ,wi.phone_number ) = awnm.waba_phone_number and wi.is_active = true
  WHERE aud.is_active = true`

  columnArray.forEach((element, index) => {
    if (element === 'aud.phone_number') {
      query += ` AND LOCATE (?,${element})`
    } else {
      query += ` AND ${element} = ?`
    }
  })

  if (startDate && endDate) {
    query += ` AND aud.first_message between '${startDate}' and '${endDate}' `
  }
  query += ` order by aud.created_on asc limit ${limit} offset ${offset};
  select count(1) as "totalRecord" from audience 
  where is_active = true
  and waba_phone_number = (select CONCAT(phone_code ,phone_number) from waba_information where user_id = '${userId}' and is_active = 1);`
  return query
}

const getAudienceTableDataWithId = () => {
  return `SELECT audience_id as "audienceId", aud.phone_number as "phoneNumber",
  channel, first_message as "firstMessage",
  last_message as "lastMessage", optin, awnm.waba_phone_number as "wabaPhoneNumber",
  osm.optin_source as "optinSource",sm.segment_name ,chat_flow_id as "chatFlowId",name,
  aud.email, gender, aud.country
  FROM audience aud
  left join optin_source osm  on osm.optin_source_id  = aud.optin_source_id
  and osm.is_active = true
  left join segment sm  on sm.segment_id  = aud.segment_id
  and sm.is_active  =true
  left join audience_waba_no_mapping awnm  on awnm.aud_mapping_id  = aud.waba_phone_number
  and awnm.is_active  =true  
  WHERE aud.is_active = true and aud.audience_id=?`
}

const getAudienceTableDataByPhoneNumber = wabaPhoneNumber => {
  let query = `SELECT audience_id as "audienceId", aud.phone_number as "phoneNumber",
  channel, first_message as "firstMessage",
  last_message as "lastMessage", segment_id as "segmentId",
  chat_flow_id as "chatFlowId",name, aud.email, gender, aud.country,optin, 
  awnm.aud_mapping_id as "wabaPhoneNumber",optin_source_id as "optinSourceId",
  awnm.aud_mapping_id as "audienceMappingId"
  FROM audience aud   
  left join audience_waba_no_mapping awnm  on awnm.aud_mapping_id  = aud.waba_phone_number
  and awnm.is_active  =true  `
  if (!wabaPhoneNumber) {
    query = query + ` join waba_information wi on CONCAT(wi.phone_code ,wi.phone_number ) = awnm.waba_phone_number 
    and wi.is_active =true and wi.user_id = ?`
  }
  query = query + ' where aud.is_active=true and'
  if (wabaPhoneNumber) {
    query = query + '  awnm.waba_phone_number= ? and'
  }
  query = query + ' aud.phone_number= ?'
  return query
}

const getOptinByPhoneNumber = () => {
  return `select last_message as "lastMessage" ,optin 
  from audience aud 
  left join audience_waba_no_mapping awnm  
  on awnm.aud_mapping_id  = aud.waba_phone_number  and awnm.is_active  =true
  where aud.is_active = true 
  and aud.phone_number = ? and awnm.waba_phone_number = ?`
}

const getWabaNumberFromDb = () => {
  return `select CONCAT(wi.phone_code ,wi.phone_number ) as "wabaPhoneNumber"
  from waba_information wi
  where user_id = ? and wi.is_active=1`
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
  WHERE is_active= true and optin_source_id = ? `
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

const getWabaPhoneNumber = () => {
  return `select waba_phone_number as "wabaPhoneNumber",
  aud_mapping_id as "audMappingId"
  from audience_waba_no_mapping
  where waba_phone_number=? and is_active=true`
}

/* Waba Number Mapping Queries For Audience */
const getWabaIdFromWabaNoMapping = () => {
  return `select waba_information_id as "wabaInformationId",
  waba_phone_number as "wabaPhoneNumber",
  aud_mapping_id as "audMappingId"
  from audience_waba_no_mapping 
  where waba_information_id = ? and is_active = 1`
}

const addWabaNoMappingData = () => {
  return `insert into  audience_waba_no_mapping (aud_mapping_id,waba_phone_number,waba_information_id,created_by) 
  values(?,?,?,?)`
}

const updateWabaNoMappingData = () => {
  return `update audience_waba_no_mapping  
  set waba_phone_number =?, updated_on = now(),updated_by=?
  where waba_information_id = ? and is_active=1`
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
  updateSegmentData,
  getWabaNumberFromDb,
  getWabaPhoneNumber,
  getWabaIdFromWabaNoMapping,
  addWabaNoMappingData,
  updateWabaNoMappingData
}
