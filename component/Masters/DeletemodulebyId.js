const bcrypt = require(`bcryptjs`)
const jwt = require(`jsonwebtoken`)
const fs = require(`fs`)
const _ = require(`lodash`)
// const path = require(`path`)

const db = require('../../config/db/dbConn')
const apiResponse = require(`../../helper/formatResponse`)
const errorCode = require(`../../config/errorCode/errorCode`)
const genericErrorRes = require(`../../utils/errorResponse`).errorResponse

class User {
  DeleteModuleInDB (ModuleId) {
    return new Promise((resolve, reject) => {
        db.sequelize.query(`CALL Sp_DeleteModule(:_ModuleId)`,
          {
            replacements: {
                _ModuleId: ModuleId
            }//,
            //type: db.Sequelize.QueryTypes.SELECT
          })
          .then(response => {
             console.log('response', response)
            // console.log(`sp response ${JSON.stringify(response)}`)
            // if (response[0]['0'].message === `success`) {
            //   const baDetails = response[1]['0']
            //   const serviceId = _.map(response[2], value => value.serviceId)
            //   baDetails['services'] = serviceId
               resolve(response)
            // }
             //else {
              //const errorObj = {
                //code: `err_001`,
                //message: errorCode.err_001
              //}
              //reject(apiResponse.errorFormat(`fail`, `Something went wrong`, {}, [errorObj], 400))
            //}
          })
          .catch((error) => {
             console.log('error',error)
            // console.log(`sp error ${JSON.stringify(error)}`)
            const errorObj = {
              code: `err_001`,
              message: errorCode.err_001
            }
            reject(apiResponse.errorFormat(`fail`, `Something went wrong`, {}, [errorObj], 400))
          })
      })
  
  }

  

  async isEmptyObject(obj) {
    return !Object.keys(obj).length;
  }

  async encryptPassword (password) {

    const saltRounds = 15

    return bcrypt.hash(password,
    saltRounds)
    
    }

  
}

const moduledelete = async (req, res) => {
  try {
    console.log(`headers`, req.headers)
    const authToken = req.headers.authtoken

    console.log('token',authToken)
    
    const verifyOptions = {
      expiresIn: '1h',
      algorithm: ['RS256']
    }

    const UserCls = new User()

    console.log('hi')
    // public key to generate jwt authToken
    const publicKey = fs.readFileSync(`${__basedir}/config/keys/public.key`, `utf8`)

    const legit = jwt.verify(authToken, publicKey, verifyOptions)

    console.log('log',legit)
    // console.log(`legit ${JSON.stringify(legit)}`)

    //const passedUserId = (req.body && req.body.userId) ? req.body.userId : (req.headers.userid) ? req.headers.userid : ''
    const passedUserId = req.headers.userid
    console.log('userid',passedUserId)

    // const userDatavalue= await verifydata.getUserData(passedUserId)
    // const data= await  verifydata.isEmptyObject(userDatavalue)
    // console.log(`passedUserId ${passedUserId}`)
  //  console.log(passedUserId)
    console.log('userid',legit.userId)
    if (legit.userId == passedUserId)
   {
     console.log('I am inside')
     const ModuleId = req.body.moduleId

     const userdelete = await UserCls.DeleteModuleInDB(ModuleId)
     res.status(200).send(apiResponse.successFormat(`success`, ` successful delete`, userdelete, []))  
    } 
    else
     {
      res.status(400).send(apiResponse.successFormat(`failure`, `InVaild AuthToken`, {}, []))
     }
    
  } catch (error) {
    console.log(`error`,error)
    res.status(401).send(error)
  }
}
module.exports = { moduledelete }
