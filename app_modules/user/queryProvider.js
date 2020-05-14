const getUserDetailsByEmail = () => {
  return `select user_id, hash_password as hash_password,salt_key from users 
  where email = $1 and is_active = true`
}

const createUser = () => {
  return `insert into users ( email, hash_password, user_id,salt_key,signup_source,created_by) values 
  ($1,$2,$3,$4,$5,$6)`
}

module.exports = { getUserDetailsByEmail, createUser }
