
module.exports = {
  getWabaData: () => {
    return `select CONCAT(phone_code, phone_number) as "id",
    service_provider_id as "serviceProviderId",
    api_key as "apiKey",
    webhook_post_url as "webhookPostUrl",
    optin_text as "optinText"
    from waba_information
    where is_active = 1 and phone_number = ?`
  }
}
