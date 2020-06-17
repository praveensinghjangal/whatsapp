const getPlanList = (messageTemplateStatusId) => {
  return `SELECT plan_id as "planId", plan_name as "planName",
  plan_validity as "planValidity", plan_cost as "planCost", plan_category as "planCategory",
  plan_benefits as "planBenefits"
  FROM plan_details pd where pd.is_active = true`
}

module.exports = {
  getPlanList
}
