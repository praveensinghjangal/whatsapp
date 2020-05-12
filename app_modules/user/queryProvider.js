const searchUser = function (email) {
  return `select user_id, status as user_status, hash_password as hash_password,salt_key from users where email = '${email}'`
}

const createUser = function (email, hashPassword, userId, status, passwordSalt) {
  return `insert into users ( email, hash_password, user_id,status, salt_key) values ('${email}', '${hashPassword}', '${userId}', '${status}', '${passwordSalt}')`
}

module.exports = { searchUser, createUser }
