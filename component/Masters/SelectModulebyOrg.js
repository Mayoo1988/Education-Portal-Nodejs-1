const _ = require(`lodash`);
const db = require('../../config/db/dbConn');
const apiResponse = require(`../../helper/formatResponse`);

class CourseOrg {
    SelectModulebyorgDB(OrgId) {
        return new Promise((resolve, reject) => {
          db.sequelize.query(`CALL Sp_select_course_On_Org(:OrgId)`, {
              replacements: {
                OrgId: OrgId
              }
            })
            .then(response => {
              console.log('response', response)
              resolve(response)
            })
            .catch((error) => {
              console.log('error', error)
              // console.log(`sp error ${JSON.stringify(error)}`)
              const errorObj = {
                code: `err_001`,
                message: errorCode.err_001
              }
              reject(apiResponse.errorFormat(`fail`, `Something went wrong`, {}, [errorObj], 400))
            })
        })
    
      }
    }


const moduleorgdata = async (req, res) => {
    try{
        const OrgId= req.body.OrgId;
        console.log('result org',OrgId);
        const SelectCourse = new CourseOrg();
        const userUpdate = await SelectCourse.SelectModulebyorgDB(OrgId);
        res.status(200).send(apiResponse.successFormat(`success`, `select successful`, userUpdate, []))
    }catch (error) {
    // console.log(`error ${JSON.stringify(error)}`)
    console.log(`error `, error)
    res.status(500).send(error)
  }
};
module.exports = { moduleorgdata }