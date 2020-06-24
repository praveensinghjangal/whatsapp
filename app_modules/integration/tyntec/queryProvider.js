
const addPayload = () => {
  return `INSERT INTO queue_payload
  ( to_contact_number,
  from_contact_number, pay_load)
  VALUES($1, $2, $3);
  `
}

module.exports = {
  addPayload
}
