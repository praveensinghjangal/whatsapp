
module.exports = {
  getMasterData: (tableName, columnArr) => {
    return `select ${columnArr.join(',')} from ${tableName} where is_active = true`
  }
}
