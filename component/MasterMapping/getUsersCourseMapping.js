const _ = require(`lodash`)

const db = require(`../../config/db/dbConn`)
const formatResponse = require(`../../helper/formatResponse`)
// const errorCodeJson = require('../../../config/errorCode/errorCode')
class getUsersCourseMappingClass{
}
const getUsersCourseMapping = async (req, res) => {
    try {
        db.sequelize.query(`CALL Sp_get_Users_Course_Mapping_Details()`,
        {
          replacements: {
            
          }
        })
        .then(response => {
        
            res.status(200).send(formatResponse.successFormat(`success`, `get successful`, response, []))

        });
    } catch (error) {
        console.log(error);
      const code = (Object.prototype.hasOwnProperty.call(error, 'status')) ? error.code : 500
      // const response = errorResponse(error)
      res.status(code).send(formatResponse.successFormat(`fail`, `Something went wrong`, {}, []))
    }
  }

module.exports = {getUsersCourseMapping}