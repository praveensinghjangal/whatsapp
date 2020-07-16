// Segment
const getSegmentData = () => {
  return `SELECT segment_id as "segmentId", segment_name as "segmentName"
  FROM segment sg
  WHERE is_active = true`
}

const getSegmentDataById = () => {
  return `SELECT segment_id as "segmentId", segment_name as "segmentName"
  FROM segment 
  WHERE is_active = true and segment.segment_id = ? `
}

const addSegmentData = () => {
  return `INSERT INTO segment
  (segment_id, segment_name, created_on, created_by, is_active)
  VALUES(?, ?, CURRENT_TIMESTAMP, 'admin',  1) `
}

const updateSegmentData = () => {
  return `UPDATE segment
  SET segment_name=?, updated_on=CURRENT_TIMESTAMP,
  updated_by='admin'
  WHERE segment_id=? and is_active = true`
}

module.exports = {
  getSegmentData,
  getSegmentDataById,
  addSegmentData,
  updateSegmentData
}
