const getTemplateList = () => {
  return `
    SELECT DISTINCT mt.message_template_id, mt.template_name, mt.type, mtc.category_name, mts.status_name, mtl.language_name, mt.media_type, mt.created_on, mt.created_by
    FROM message_template mt
      JOIN message_template_category mtc ON mtc.message_template_category_id = mt.message_template_category_id
      JOIN message_template_status mts ON mts.message_template_status_id = mt.message_template_status_id
      JOIN message_template_language mtl ON mtl.message_template_language_id = mt.message_template_language_id
    WHERE mt.is_active = true AND mt.waba_information_id = $1
  `
}

module.exports = {
  getTemplateList
}
