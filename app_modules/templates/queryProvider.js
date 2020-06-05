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
          and mt.waba_information_id  = $1
          and wi.user_id = $2
          group by mts.message_template_status_id`
}

const getTempalteAllocatedCountToWaba = () => {
  return `select templates_allowed as "allocatedTemplateCount" 
          from waba_information wi 
          where wi.is_active = true 
          and wi.waba_information_id = $1
          and wi.user_id=$2`
}

const getTempalteUsedCountByWaba = () => {
  return `select  count(mt.message_template_id) as "usedTemplateCount" 
          from message_template mt 
          left join waba_information wi
          on mt.waba_information_id = wi.waba_information_id
          where mt.is_active  = true 
          and wi.is_active = true 
          and mt.waba_information_id = $1
          and wi.user_id=$2`
}

const getMessageTemplateDataByWabaId = () => {
  return `SELECT  message_template_id as "messageTemplateId", 
    waba_information_id as "wabaInformationId", template_name as "templateName"
    FROM message_template mt 
    where is_active = true and mt.waba_information_id =$1`
}

module.exports = {
  getTemplateList,
  getTemplateInfo,
  getTemplateCategories,
  getTemplateLanguages,
  getTemplateCountByStatus,
  getTempalteAllocatedCountToWaba,
  getMessageTemplateDataByWabaId,
  getTempalteUsedCountByWaba
}
