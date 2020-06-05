const sampleQuery = () => {
  return 'select now()'
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
  sampleQuery,
  getTemplateCategories,
  getTemplateLanguages,
  getTemplateCountByStatus,
  getTempalteAllocatedCountToWaba,
  getMessageTemplateDataByWabaId,
  getTempalteUsedCountByWaba
}
