const getMaterData = () => {
  return `SELECT master_data_id as masterdDataId , platform_name as platFormName , business_id as businessId , system_user_id as systemUserId ,
  system_user_token AS systemUserToken, credit_line_id as creditLineId, access_token as accessToken From master_data 
  WHERE master_data_id = ? and is_active = true`
}

const updateMasterDataByMasterDataId = () => {
  return `update master_data  
  set platform_name = ?,business_id = ?,system_user_id = ?,system_user_token = ?,credit_line_id= ?,
  updated_on = now(),updated_by= ?
  where master_data_id = ? and is_active=1`
}

const addMasterData = () => {
  return `INSERT INTO master_data
    (master_data_id, platform_name, business_id, 
    system_user_id, system_user_token, credit_line_id, created_on, created_by,is_active)
    VALUES(?,?,?,?,?,?,now(),?,1);`
}
module.exports = { getMaterData, updateMasterDataByMasterDataId, addMasterData }
