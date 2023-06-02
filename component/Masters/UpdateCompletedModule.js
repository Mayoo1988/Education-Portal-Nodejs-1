const jwt = require(`jsonwebtoken`)
const fs = require(`fs`)
const _ = require(`lodash`)
const db = require('../../config/db/dbConn')
const verifyAuthToken = require(`../authenticate/verifyAuthToken`)
const apiResponse = require(`../../helper/formatResponse`)
const errorCode = require(`../../config/errorCode/errorCode`)
const genericErrorRes = require(`../../utils/errorResponse`).errorResponse

class UpdateCompletedModule{

UpdateModuleCompletedInDB(ModuleId, CourseId,IsCompleted ) {
    return new Promise((resolve, reject) => {
      db.sequelize.query(`CALL Sp_update_Module_Completed(:ModuleId, :CourseId, :IsCompleted)`, {
          replacements: {
            ModuleId: ModuleId,
            CourseId: CourseId,
            IsCompleted: IsCompleted
          } //,
          //type: db.Sequelize.QueryTypes.SELECT
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
const CompletedModuledata = async (req, res) => {
    try{
        
    const CourseId= req.body.courseId;
    const ModuleId= req.body.moduleId;
    const IsCompleted= req.body.IsCompleted;
    console.log('IsCompleted',IsCompleted);
    const UpdateCompleted = new UpdateCompletedModule();
    const userUpdate = await  UpdateCompleted.UpdateModuleCompletedInDB(CourseId,ModuleId,IsCompleted);
    res.status(200).send(apiResponse.successFormat(`success`, `update successful`, userUpdate, []))
    }catch (error) {
        console.log(`error `,error)
        // res.status(401).send(error)
      }
    
}
module.exports = { CompletedModuledata }