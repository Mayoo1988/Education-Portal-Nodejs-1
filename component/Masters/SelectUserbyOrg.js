const jwt = require(`jsonwebtoken`)
const fs = require(`fs`)
const _ = require(`lodash`)
const db = require('../../config/db/dbConn')
const verifyAuthToken = require(`../authenticate/verifyAuthToken`)
const apiResponse = require(`../../helper/formatResponse`)
const errorCode = require(`../../config/errorCode/errorCode`)
const genericErrorRes = require(`../../utils/errorResponse`).errorResponse


class SelectuserOrg{

    SelectUserbyorgDB(OrgId) {
        return new Promise((resolve, reject) => {
          db.sequelize.query(`CALL Sp_select_user_On_Org()`, {
              replacements: {
                
              } //,
              //type: db.Sequelize.QueryTypes.SELECT
            })
            .then(response => {
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

const SelectUserByOrg = async (req, res) => {
    try{
        const OrgId= req.body.OrgId;
        const SelectUser = new SelectuserOrg();
        const userUpdate = await SelectUser.SelectUserbyorgDB(OrgId);
        res.status(200).send(apiResponse.successFormat(`success`, `select successful`, userUpdate, []))
    }catch (error) {
        console.log(`error `,error)
        // res.status(401).send(error)
      }
}
module.exports = { SelectUserByOrg }