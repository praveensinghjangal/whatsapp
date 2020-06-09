// Template
const getTemplateList = (messageTemplateStatusId) => {
  let query = `
    SELECT DISTINCT mt.message_template_id as "messageTemplateId", mt.template_name as "TemplateName",
    mt.type, mtc.category_name as "categoryName", mts.status_name as "statusName", mtl.language_name as "languageName",
    mt.media_type as "mediaType"
    FROM message_template mt
      JOIN waba_information wi
        ON wi.is_active = true AND wi.waba_information_id = mt.waba_information_id
      JOIN message_template_category mtc
        ON mtc.is_active = true and mtc.message_template_category_id = mt.message_template_category_id
      JOIN message_template_status mts
        ON mts.is_active = true and mts.message_template_status_id = mt.message_template_status_id
      JOIN message_template_language mtl
        ON mtl.is_active = true and mtl.message_template_language_id = mt.message_template_language_id
    WHERE mt.is_active = true and wi.user_id = $1
  `

  if (messageTemplateStatusId) {
    query += ' AND mt.message_template_status_id = $2'
  }

  return query
}

const getTemplateInfo = () => {
  return `
    SELECT DISTINCT mt.message_template_id as "messageTemplateId", mt.waba_information_id as "wabaInformationId",
    mt.template_name as "templateName", mt.type, mt.body_text as "bodyText", mt.header_text as "headerText",
    mt.footer_text as "footerText", mt.media_type as "mediaType", mtc.category_name as "categoryName",
    mts.status_name as "statusName", mtl.language_name as "languageName"
    FROM message_template mt
      JOIN waba_information wi
        ON wi.is_active = true and wi.waba_information_id = mt.waba_information_id
      JOIN message_template_category mtc
        ON mtc.is_active = true and mtc.message_template_category_id = mt.message_template_category_id
      JOIN message_template_status mts
        ON mts.is_active = true and mts.message_template_status_id = mt.message_template_status_id
      JOIN message_template_language mtl
        ON mtl.is_active = true and mtl.message_template_language_id = mt.message_template_language_id
    WHERE mt.is_active = true AND wi.user_id = $1 AND mt.message_template_id = $2`
}

const addTemplate = () => {
  return `insert into message_template(message_template_id, waba_information_id, template_name, "type", message_template_category_id, message_template_status_id, message_template_language_id, body_text , header_text, footer_text, media_type, created_by)
    values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`
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

  if (messageTemplateCategoryId) {
    query += ' AND mtlib.message_template_category_id = $1'
  }

  if (templateName) {
    query += ' AND mtlib.template_name = $2'
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
  WHERE mtlib.is_active = true AND mtlib.message_template_library_id = $1`
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
    WHERE is_active = true`
}

// Template Count
const getTemplateCountByStatus = () => {
  return `select count(mt.message_template_id) as "templateCount",
          mts.status_name  as "statusName"
          from message_template mt 
          left join message_template_status mts
          on mt.message_template_status_id  = mts.message_template_status_id
          left join waba_information wi
          on mt.waba_information_id = wi.waba_information_id
          where mt.is_active  = true 
          and wi.is_active =true 
          and mts.is_active  = true 
          and wi.user_id = $1
          group by mts.message_template_status_id`
}

const getTempalteAllocatedCountToWaba = () => {
  return `select templates_allowed as "allocatedTemplateCount" 
          from waba_information wi 
          where wi.is_active = true 
          and wi.user_id=$1`
}

const getTempalteUsedCountByWaba = () => {
  return `select  count(mt.message_template_id) as "usedTemplateCount" 
          from message_template mt 
          left join waba_information wi
          on mt.waba_information_id = wi.waba_information_id
          where mt.is_active  = true 
          and wi.is_active = true 
          and wi.user_id=$1`
}

const getTemplateCount = () => {
  return `select count(1) as "templatesConsumed" from message_template
        where waba_information_id = $1 and is_active = true`
}

// Template By Id
const getMessageTemplateDataByWabaId = () => {
  return `SELECT  message_template_id as "messageTemplateId", 
    waba_information_id as "wabaInformationId", template_name as "templateName"
    FROM message_template mt 
    where is_active = true and mt.waba_information_id =$1`
}

const getTemplateTableDataAndWabaId = () => {
  return `select wi.waba_information_id as "wabaInformationId",wi.templates_allowed as "templatesAllowed", 
  mt.message_template_id as "messageTemplateId", mt.template_name as "templateName",
  mt.type, mt.message_template_category_id as "messageTemplateCategoryId", mt.message_template_status_id as "messageTemplateStatusId",
  mt.message_template_language_id as "messageTemplatelanguageId", mt.body_text as "bodyText", mt.header_text as "headerText",
  mt.footer_text as "footerText",mt.media_type as "mediaType"
  from waba_information wi
  left join message_template mt on mt.waba_information_id = wi.waba_information_id and mt.is_active = true and mt.message_template_id = $1
  where wi.is_active = true and wi.user_id = $2`
}

const setIsActiveFalseByTemplateId = () => {
  return `update message_template 
          set is_active = false, updated_on=now(),updated_by=$2
          where message_template_id = $1 and is_active = true`
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
  setIsActiveFalseByTemplateId,
  getSampleTemplateList,
  getSampleTemplateInfo
}
