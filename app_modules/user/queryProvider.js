const getUserDetailsByEmail = function (email) {
  return `select user_id, hash_password as hash_password,salt_key,token_expiry_in_seconds as "tokenExpireyInSeconds"  from users 
  where email = '${email}' and is_active = true`
}

const createUser = function (email, hashPassword, userId, passwordSalt, tokenExpireyInSeconds) {
  return `insert into users ( email, hash_password, user_id,salt_key,token_expiry_in_seconds) values 
  ('${email}', '${hashPassword}', '${userId}', '${passwordSalt}',${tokenExpireyInSeconds})`
}

module.exports = { getUserDetailsByEmail, createUser }
