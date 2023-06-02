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
  UpdateRoleInDB (roleId,roleName,roleDecription,createdBy,createdOn,updatedBy,updatedOn) {
    return new Promise((resolve, reject) => {
        db.sequelize.query(`CALL Sp_Update_Role(:_roleId, :roleName, :roleDescription, :createdBy, :createdOn, :updatedBy, :updatedOn)`,
          {
            replacements: {
              _roleId: roleId,
              roleName: roleName,
              roleDescription: roleDecription,
              createdBy:createdBy,
              createdOn:createdOn,
              updatedBy:updatedBy,
              updatedOn:updatedOn,
              isActive:'1'
            }//,
            //type: db.Sequelize.QueryTypes.SELECT
          })
          .then(response => {
             console.log('response', response)
               resolve(response)
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

const roleupdate = async (req, res) => {
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

    const passedUserId = (req.body && req.body.userId) ? req.body.userId : (req.headers.userid) ? req.headers.userid : ''
    
    console.log('userid',passedUserId)

    // const userDatavalue= await verifydata.getUserData(passedUserId)
    // const data= await  verifydata.isEmptyObject(userDatavalue)
    // console.log(`passedUserId ${passedUserId}`)
  //  console.log(passedUserId)
    console.log('userid',legit.userId)
    if (legit.userId == passedUserId)
   {
     console.log('I am inside')
    const roleId = req.body.roleId
    const roleName = req.body.roleName
    const roleDescription = req.body.roleDescription
    
    var d = new Date()

    const createdBy = passedUserId
    const createdOn = d
    const updatedBy = req.body.updatedBy
    const updatedOn = d

    const userUpdate = await UserCls.UpdateRoleInDB(roleId,roleName,roleDescription,createdBy,createdOn,updatedBy,updatedOn)
    res.status(200).send(apiResponse.successFormat(`success`, `update successful`, userUpdate, []))
       
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
module.exports = { roleupdate }
