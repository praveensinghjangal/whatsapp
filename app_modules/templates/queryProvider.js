const __constants = require('../../config/constants')

// Template
const getTemplateList = (messageTemplateStatusId) => {
  let query = `
  SELECT DISTINCT mt.message_template_id as "messageTemplateId", mt.template_name as "TemplateName",
  mt.type, mtc.category_name as "categoryName", mts.status_name as "statusName",
  mts.message_template_status_id as "messageTemplateStatusId",mt.media_type as "mediaType",
  CONCAT_WS(', ', mtl.language_name,mtl2.language_name) as "languageName"
  FROM message_template mt
    JOIN waba_information wi
      ON wi.is_active = true AND wi.waba_information_id = mt.waba_information_id
    left JOIN message_template_category mtc
      ON mtc.is_active = true and mtc.message_template_category_id = mt.message_template_category_id
    left JOIN message_template_status mts
      ON mts.is_active = true and mts.message_template_status_id = mt.message_template_status_id
    left JOIN message_template_language mtl
      ON mtl.is_active = true and mtl.message_template_language_id = mt.message_template_language_id
    left JOIN message_template_language mtl2
      ON mtl2.is_active = true and mtl2.message_template_language_id = mt.second_message_template_language_id
  WHERE mt.is_active = true and wi.user_id =  ?`

  if (messageTemplateStatusId) {
    query += ' AND mt.message_template_status_id = ?'
  }

  return query
}

const getTemplateInfo = () => {
  return `
    SELECT DISTINCT mt.message_template_id as "messageTemplateId", mt.waba_information_id as "wabaInformationId",
    mt.template_name as "templateName", mt.type, mt.body_text as "bodyText", mt.header_text as "headerText",
    mt.footer_text as "footerText", mt.media_type as "mediaType", mtc.category_name as "categoryName",
    mts.status_name as "statusName", mtl.language_name as "languageName",mt.second_language_required as "secondLanguageRequired",
    mtl2.language_name as "secondLanguageName" ,mt.second_language_header_text as "secondLanguageHeaderText",
    mt.second_language_body_text as "secondLanguageBodyText",mt.second_language_footer_text as "secondLanguageFooterText",
    mt.header_type as "headerType", mt.button_type as "buttonType", mt.button_data as "buttonData",
    mt.first_localization_status as "firstLocalizationStatusId", mt.second_localization_status as "secondLocalizationStatusId",
    mtc.message_template_category_id as "messageTemplateCategoryId",mts.message_template_status_id as "messageTemplateStatusId",
    mtl.message_template_language_id as "messageTemplateLanguageId",mtl2.message_template_language_id as "secondTemplateLanguageId",
    mt.first_localization_rejection_reason as "firstLocalizationRejectionReason",mt.second_localization_rejection_reason as "secondLocalizationRejectionReason",
    mtl.language_code as "languageCode", mtl2.language_code as "secondLanguageCode"
    FROM message_template mt
      JOIN waba_information wi
        ON wi.is_active = true and wi.waba_information_id = mt.waba_information_id
      LEFT JOIN message_template_category mtc
        ON mtc.is_active = true and mtc.message_template_category_id = mt.message_template_category_id
      LEFT JOIN message_template_status mts
        ON mts.is_active = true and mts.message_template_status_id = mt.message_template_status_id
      LEFT JOIN message_template_language mtl
        ON mtl.is_active = true and mtl.message_template_language_id = mt.message_template_language_id
      LEFT JOIN message_template_language mtl2
        ON mtl2.is_active = true and mtl2.message_template_language_id = mt.second_message_template_language_id
    WHERE mt.is_active = true AND wi.user_id = ? AND mt.message_template_id = ?`
}

const addTemplate = () => {
  return `insert into message_template(message_template_id, waba_information_id, template_name, type,
  message_template_category_id, message_template_status_id, message_template_language_id, body_text ,
  header_text, footer_text, media_type, second_language_required, second_message_template_language_id,second_language_header_text,
  second_language_body_text ,second_language_footer_text,
  header_type, button_type,button_data, created_by,first_localization_status,second_localization_status)
  values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
}

const updateTemplate = () => {
  return `update message_template set template_name =?, type =?, message_template_category_id =?,
  message_template_status_id =?,message_template_language_id =?, body_text  =?, header_text =?,
  footer_text =?, media_type =?, second_language_required = ?, second_message_template_language_id = ?,
  second_language_header_text = ?,second_language_body_text = ?,second_language_footer_text = ?,
  header_type = ?, button_type = ?,button_data = ?, updated_by =?,
  updated_on = now() 
  where message_template_id =? and  waba_information_id =?`
}

const deleteTemplate = () => {
  return `update message_template set is_active =FALSE, message_template_status_id =?,
  first_localization_status =?,second_localization_status =?, updated_on = now(),updated_by =?
  where message_template_id=? and is_active=true`
}

// Sample Template

const getSampleTemplateList = (messageTemplateCategoryId, templateName) => {
  let query = `
  SELECT DISTINCT mtlib.message_template_library_id as "messageTemplateLibraryId", mtlib.template_name as "templateName",
  mtlib.type, mtc.category_name as "categoryName", mts.status_name as "statusName", mtl.language_name as "languageName",
  mtlib.media_type as "mediaType"
  FROM message_template_library mtlib
    JOIN message_template_category mtc
      ON mtc.is_active = true and mtc.message_template_category_id = mtlib.message_template_category_id
    JOIN message_template_status mts
      ON mts.is_active = true and mts.message_template_status_id = mtlib.message_template_status_id
    JOIN message_template_language mtl
      ON mtl.is_active = true and mtl.message_template_language_id = mtlib.message_template_language_id
  WHERE mtlib.is_active = true`

  if (messageTemplateCategoryId !== undefined) {
    query += ` AND mtlib.message_template_category_id = '${messageTemplateCategoryId}' AND mtlib.message_template_category_id is not null`
  }

  if (templateName !== undefined) {
    query += ` AND mtlib.template_name = '${templateName}' AND mtlib.template_name is not null `
  }

  return query
}

const getSampleTemplateInfo = () => {
  return `
  SELECT DISTINCT mtlib.message_template_library_id as "messageTemplateId",
  mtlib.template_name as "templateName", mtlib.type, mtlib.body_text as "bodyText", mtlib.header_text as "headerText",
  mtlib.footer_text as "footerText", mtlib.media_type as "mediaType", mtc.category_name as "categoryName",
  mts.status_name as "statusName", mtl.language_name as "languageName"
  FROM message_template_library mtlib
    JOIN message_template_category mtc
      ON mtc.is_active = true and mtc.message_template_category_id = mtlib.message_template_category_id
    JOIN message_template_status mts
      ON mts.is_active = true and mts.message_template_status_id = mtlib.message_template_status_id
    JOIN message_template_language mtl
      ON mtl.is_active = true and mtl.message_template_language_id = mtlib.message_template_language_id
  WHERE mtlib.is_active = true AND mtlib.message_template_library_id = ?`
}

// Template Categories
const getTemplateCategories = () => {
  return `select message_template_category_id as "messageTemplateCategoryId", category_name as "categoryName"
    from message_template_category 
    WHERE is_active = true`
}

// Template Languages
const getTemplateLanguages = () => {
  return `select message_template_language_id as "messageTemplateLanguageId", language_name as "languageName"
    from message_template_language 
    WHERE is_active = true
    order by display_rank asc`
}

// Template Count
const getTemplateCountByStatus = () => {
  return `select wi.templates_allowed , count(mt.message_template_id ) as "count", mts.status_name
  from waba_information wi
  left join message_template mt on wi.waba_information_id = mt.waba_information_id and mt.is_active = true
  left join message_template_status mts on mt.message_template_status_id = mts.message_template_status_id 
  and mts.is_active = true
  where wi.is_active = true and wi.user_id = ?
  group by wi.templates_allowed , mts.status_name`
}

const getTempalteAllocatedCountToWaba = () => {
  return `select templates_allowed as "allocatedTemplateCount" 
          from waba_information wi 
          where wi.is_active = true 
          and wi.user_id=?`
}

const getTempalteUsedCountByWaba = () => {
  return `select  count(mt.message_template_id) as "usedTemplateCount" 
          from message_template mt 
          left join waba_information wi
          on mt.waba_information_id = wi.waba_information_id
          where mt.is_active  = true 
          and wi.is_active = true 
          and wi.user_id=?`
}

const getTemplateCount = () => {
  return `select count(1) as "templatesConsumed" from message_template
        where waba_information_id = ? and is_active = true`
}

// Template By Id
const getMessageTemplateDataByWabaId = () => {
  return `SELECT  message_template_id as "messageTemplateId", 
    waba_information_id as "wabaInformationId", template_name as "templateName"
    FROM message_template mt 
    where is_active = true and mt.waba_information_id =?`
}

const getTemplateTableDataAndWabaId = () => {
  return `select wi.waba_information_id as "wabaInformationId",wi.templates_allowed as "templatesAllowed", 
  wi.phone_number as "wabaPhoneNumber",
  mt.message_template_id as "messageTemplateId", mt.template_name as "templateName",
  mt.type, mt.message_template_category_id as "messageTemplateCategoryId", mt.message_template_status_id as "messageTemplateStatusId",
  mt.message_template_language_id as "messageTemplateLanguageId", mt.body_text as "bodyText", mt.header_text as "headerText",
  mt.footer_text as "footerText",mt.media_type as "mediaType" , mt.second_language_required as "secondLanguageRequired",
  mt.second_message_template_language_id as "secondMessageTemplateLanguageId" ,mt.second_language_header_text as "secondLanguageHeaderText",
  mt.second_language_body_text as "secondLanguageBodyText",second_language_footer_text as "secondLanguageFooterText",
  mt.header_type as "headerType", mt.button_type as "buttonType", mt.button_data as "buttonData",
  mt.first_localization_status as "firstLocalizationStatus",mt.second_localization_status as "secondLocalizationStatus",
  mt.first_localization_rejection_reason as "firstLocalizationRejectionReason",mt.second_localization_rejection_reason as "secondLocalizationRejectionReason",
  mts.status_name as "templateStatus",mtl.language_code as "languageCode", mtl2.language_code as "secondLanguageCode"
  from waba_information wi
  left join message_template mt on mt.waba_information_id = wi.waba_information_id and mt.is_active = true and mt.message_template_id = ?
  left join message_template_status mts on mts.message_template_status_id = mt.message_template_status_id and mts.is_active = true
  left JOIN message_template_language mtl ON mtl.is_active = true and mtl.message_template_language_id = mt.message_template_language_id
  left JOIN message_template_language mtl2 ON mtl2.is_active = true and mtl2.message_template_language_id = mt.second_message_template_language_id
  where wi.is_active = true and wi.user_id = ?`
}

const setIsActiveFalseByTemplateId = () => {
  return `update message_template 
          set is_active = false, updated_on=now(),updated_by=?
          where message_template_id = ? and is_active = true`
}

const setAllTemplatesInRedis = () => {
  return `select mt.message_template_id , mt.header_text ,mt.body_text ,
  mt.footer_text,CONCAT(wi.phone_code, wi.phone_number) as phone_number
  from message_template mt
  join waba_information wi on mt.waba_information_id = wi.waba_information_id and wi.is_active = true
  where mt.is_active = true`
}

const setTemplatesInRedisForWabaId = () => {
  return `select mt.message_template_id , mt.header_text ,mt.body_text ,
  mt.footer_text,CONCAT(wi.phone_code, wi.phone_number) as phone_number
  from message_template mt
  join waba_information wi on mt.waba_information_id = wi.waba_information_id and wi.is_active = true
  where mt.is_active = true and wi.waba_information_id = ?`
}

const updateTemplateStatus = () => {
  return `update message_template set message_template_status_id =?, first_localization_status =?,
  first_localization_rejection_reason = ?, second_localization_status =?, second_localization_rejection_reason = ?,
  updated_by =?, updated_on = now() 
  where message_template_id =? and  waba_information_id =?`
}

const getTemplateTableDataByTemplateName = () => {
  return `select wi.waba_information_id as "wabaInformationId",wi.templates_allowed as "templatesAllowed", 
        wi.phone_number as "wabaPhoneNumber",
        mt.message_template_id as "messageTemplateId", mt.template_name as "templateName",
        mt.type, mt.message_template_category_id as "messageTemplateCategoryId", mt.message_template_status_id as "messageTemplateStatusId",
        mt.message_template_language_id as "messageTemplateLanguageId", mt.body_text as "bodyText", mt.header_text as "headerText",
        mt.footer_text as "footerText",mt.media_type as "mediaType" , mt.second_language_required as "secondLanguageRequired",
        mt.second_message_template_language_id as "secondMessageTemplateLanguageId" ,mt.second_language_header_text as "secondLanguageHeaderText",
        mt.second_language_body_text as "secondLanguageBodyText",second_language_footer_text as "secondLanguageFooterText",
        mt.header_type as "headerType", mt.button_type as "buttonType", mt.button_data as "buttonData",
        mt.first_localization_status as "firstLocalizationStatus",mt.second_localization_status as "secondLocalizationStatus",
        mt.first_localization_rejection_reason as "firstLocalizationRejectionReason",mt.second_localization_rejection_reason as "secondLocalizationRejectionReason",
        mts.status_name as "templateStatus",mtl.language_code as "languageCode", mtl2.language_code as "secondLanguageCode"
        from waba_information wi
        left join message_template mt on mt.waba_information_id = wi.waba_information_id and mt.is_active = true and lower(mt.template_name) = lower(?)
        left join message_template_status mts on mts.message_template_status_id = mt.message_template_status_id and mts.is_active = true
        left JOIN message_template_language mtl ON mtl.is_active = true and mtl.message_template_language_id = mt.message_template_language_id
        left JOIN message_template_language mtl2 ON mtl2.is_active = true and mtl2.message_template_language_id = mt.second_message_template_language_id
        where wi.is_active = true and wi.user_id = ?;`
}

const getTemplateTableDataByTemplateId = () => {
  return `select wi.waba_information_id as "wabaInformationId",wi.templates_allowed as "templatesAllowed", 
    wi.phone_number as "wabaPhoneNumber",
    mt.message_template_id as "messageTemplateId", mt.template_name as "templateName",
    mt.type, mt.message_template_category_id as "messageTemplateCategoryId", mt.message_template_status_id as "messageTemplateStatusId",
    mt.message_template_language_id as "messageTemplateLanguageId", mt.body_text as "bodyText", mt.header_text as "headerText",
    mt.footer_text as "footerText",mt.media_type as "mediaType" , mt.second_language_required as "secondLanguageRequired",
    mt.second_message_template_language_id as "secondMessageTemplateLanguageId" ,mt.second_language_header_text as "secondLanguageHeaderText",
    mt.second_language_body_text as "secondLanguageBodyText",second_language_footer_text as "secondLanguageFooterText",
    mt.header_type as "headerType", mt.button_type as "buttonType", mt.button_data as "buttonData",
    mt.first_localization_status as "firstLocalizationStatus",mt.second_localization_status as "secondLocalizationStatus",
    mt.first_localization_rejection_reason as "firstLocalizationRejectionReason",mt.second_localization_rejection_reason as "secondLocalizationRejectionReason",
    mts.status_name as "templateStatus",mtl.language_code as "languageCode", mtl2.language_code as "secondLanguageCode"
    from waba_information wi
    left join message_template mt on mt.waba_information_id = wi.waba_information_id and mt.is_active = true and mt.message_template_id = ?
    left join message_template_status mts on mts.message_template_status_id = mt.message_template_status_id and mts.is_active = true
    left JOIN message_template_language mtl ON mtl.is_active = true and mtl.message_template_language_id = mt.message_template_language_id
    left JOIN message_template_language mtl2 ON mtl2.is_active = true and mtl2.message_template_language_id = mt.second_message_template_language_id
    where wi.is_active = true and wi.user_id = ?;`
}

const getAllTemplateWithStatus = (columnArray, startDate, endDate, searchBy, searchText) => {
  let query =
  `SELECT count(1) over() as "totalFilteredRecord", mt.message_template_id as "messageTemplateId", mt.template_name as "TemplateName",
   mt.type, mtc.category_name as "categoryName", mts.status_name as "statusName",
   mts.message_template_status_id as "messageTemplateStatusId",mt.media_type as "mediaType",
   CONCAT_WS(', ', mtl.language_name,mtl2.language_name) as "languageName",wi.user_id as "userId", mt.created_on
   FROM message_template mt
     JOIN waba_information wi
       ON wi.is_active = true AND wi.waba_information_id = mt.waba_information_id
     left JOIN message_template_category mtc
       ON mtc.is_active = true and mtc.message_template_category_id = mt.message_template_category_id
     left JOIN message_template_status mts
       ON mts.is_active = true and mts.message_template_status_id = mt.message_template_status_id
     left JOIN message_template_language mtl
       ON mtl.is_active = true and mtl.message_template_language_id = mt.message_template_language_id
     left JOIN message_template_language mtl2
       ON mtl2.is_active = true and mtl2.message_template_language_id = mt.second_message_template_language_id
     `

  if (searchBy && searchBy === __constants.SEARCH_FIELDS.userName && searchText) {
    query += ' JOIN users u on wi.user_id = u.user_id and u.is_active = true'
  } else {
    query += ' where mt.is_active = true'
  }
  columnArray.forEach((element) => {
    query += ` AND ${element} = ?`
  })

  if (startDate && endDate) {
    query += ` AND mt.created_on between '${startDate}' and '${endDate}' `
  }
  if (searchBy && searchBy === __constants.SEARCH_FIELDS.templateName && searchText) {
    query += ` AND mt.template_name like lower('%${searchText}%')`
  } else if (searchBy && searchBy === __constants.SEARCH_FIELDS.userName && searchText) {
    query += ` AND CONCAT(u.first_name,u.last_name) like lower('%${searchText}%')`
  } else if (searchBy && searchBy === __constants.SEARCH_FIELDS.wabaNumber && searchText) {
    query += ` AND wi.phone_number like lower('%${searchText}%')`
  }
  query += ` order by mt.created_on asc limit ? offset ?;
   select count(1) as "totalRecord" from message_template mt2
   where mt2.is_active = true`
  return query
}

const getTemplateStatusList = () => {
  return `select message_template_status_id as "messageTemplateStatusId",
  status_name as "statusName"
  from message_template_status
  where is_active = true and message_template_status_id != '${__constants.TEMPLATE_STATUS.deleted.statusCode}'`
}

// Support Template Count
const getAllTemplateCount = () => {
  return ` select mts.status_name as "statusName", count(1) as "statusCount" 
  from message_template mt 
  left join message_template_status mts on mt.message_template_status_id = mts.message_template_status_id 
  and mts.is_active = true
  where mt.is_active = true
  group by mts.status_name`
}

module.exports = {
  getTemplateList,
  getTemplateInfo,
  getTemplateCategories,
  getTemplateLanguages,
  getTemplateCountByStatus,
  getTempalteAllocatedCountToWaba,
  getMessageTemplateDataByWabaId,
  getTempalteUsedCountByWaba,
  getTemplateTableDataAndWabaId,
  getTemplateCount,
  addTemplate,
  updateTemplate,
  setIsActiveFalseByTemplateId,
  getSampleTemplateList,
  getSampleTemplateInfo,
  setAllTemplatesInRedis,
  setTemplatesInRedisForWabaId,
  updateTemplateStatus,
  deleteTemplate,
  getTemplateTableDataByTemplateName,
  getTemplateTableDataByTemplateId,
  getAllTemplateWithStatus,
  getTemplateStatusList,
  getAllTemplateCount
}
