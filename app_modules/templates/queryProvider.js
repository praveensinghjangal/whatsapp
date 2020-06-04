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

module.exports = {
  getTemplateCategories,
  getTemplateLanguages
}
