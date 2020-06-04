const getTemplateList = (messageTemplateStatusId) => {
  let query = `
    SELECT DISTINCT mt.message_template_id, mt.template_name, mt.type, mtc.category_name, mts.status_name, mtl.language_name, mt.media_type
    FROM message_template mt
      JOIN waba_information wi
        ON wi.is_active = true and wi.user_id = $1
      JOIN message_template_category mtc
        ON mtc.is_active = true and mtc.message_template_category_id = mt.message_template_category_id
      JOIN message_template_status mts
        ON mts.is_active = true and mts.message_template_status_id = mt.message_template_status_id
      JOIN message_template_language mtl
        ON mtl.is_active = true and mtl.message_template_language_id = mt.message_template_language_id
    WHERE mt.is_active = true AND mt.waba_information_id = wi.waba_information_id
  `

  if (messageTemplateStatusId) {
    query += ' AND mt.message_template_status_id = $2'
  }

  return query
}

const getTemplateInfo = () => {
  return `
    SELECT DISTINCT mt.message_template_id, mt.waba_information_id, mt.template_name, mt.type, mt.message_template_category_id, mt.message_template_status_id, mt.message_template_language_id, mt.body_text, mt.header_text, mt.footer_text, mt.media_type, mt.is_active, mtc.category_name, mts.status_name, mtl.language_name
    FROM message_template mt
      JOIN waba_information wi
        ON wi.is_active = true and wi.user_id = $1
      JOIN message_template_category mtc
        ON mtc.is_active = true and mtc.message_template_category_id = mt.message_template_category_id
      JOIN message_template_status mts
        ON mts.is_active = true and mts.message_template_status_id = mt.message_template_status_id
      JOIN message_template_language mtl
        ON mtl.is_active = true and mtl.message_template_language_id = mt.message_template_language_id
    WHERE mt.is_active = true AND mt.waba_information_id = wi.waba_information_id AND mt.message_template_id = $2
  `
}

module.exports = { getTemplateList, getTemplateInfo }
