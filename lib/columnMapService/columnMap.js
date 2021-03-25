
class ColumnMapService {
mapColumn (column, type) {
  console.log("Inside map Columns", column, type)
    let resultColumn = ''
    switch (type) {
      case 'like':
        resultColumn = ` AND ${column} like '%' ? '%' `
        break
      case 'between':
        resultColumn = ` AND ${column} between ? and ? `
        break  
      case 'locate':
        resultColumn = ` AND LOCATE (?,${column}) `
        break             
      default:
        resultColumn = ` AND ${column} = ? `
    }
    return resultColumn
  }

}

module.exports = ColumnMapService
