const getBusinessCategory = () => {
  return `select business_category_id, category_name
    from business_category 
    WHERE created_by = $1 and is_active = true`
}

module.exports = {
  getBusinessCategory
}
