const bcrypt = require(`bcryptjs`)
const jwt = require(`jsonwebtoken`)
const fs = require(`fs`)
const _ = require(`lodash`)
// const path = require(`path`)

const db = require('../../config/db/dbConn')
const apiResponse = require(`../../helper/formatResponse`)
const errorCode = require(`../../config/errorCode/errorCode`)
const genericErrorRes = require(`../../utils/errorResponse`).errorResponse

class RoleSelect {
  

  async getroleData (roleId) {
    const statusvalue = 1
    const userExist = await db.RoleManager
      .findOne({
        where: {
          roleId: roleId
        },
        attributes: { exclude: [ 'CreatedBy','CreatedOn','UpdatedBy','UpdatedOn'] }
      })
    console.log('details', userExist)

    const userData = (!_.isEmpty(userExist)) ? { roleId: userExist.roleId, roleDescription: userExist.roleDescription,roleName:userExist.roleName,createdBy:userExist.createdBy } : {}
    return userData
  }

  async isEmptyObject(obj) {
    return !Object.keys(obj).length;
  }

  
}

const Roledata = async (req, res) => {
  try {
    console.log(`headers`, req.headers)
    const authToken = req.headers.authtoken
    
    const verifyOptions = {
      expiresIn: '1h',
      algorithm: ['RS256']
    }

    const RoleCls = new RoleSelect()

    // public key to generate jwt authToken
    const publicKey = fs.readFileSync(`${__basedir}/config/keys/public.key`, `utf8`)

    const legit = jwt.verify(authToken, publicKey, verifyOptions)

    console.log('log',legit)
    // console.log(`legit ${JSON.stringify(legit)}`)

    const passedUserId = (req.body && req.body.userId) ? req.body.userId : (req.headers.userid) ? req.headers.userid : ''
    
    console.log('userid',passedUserId)

    console.log('userid',legit.userId)
    if (legit.userId == passedUserId) {

    const roleId= req.body.roleId
    
    

    const answerdata= await RoleCls.getroleData(roleId)

    // if(!Roledata)
    // {
     // const userUpdate = await RoleCls.addQuestionInDB(QuestionDescription, QuestionType,MappingId,MappingType,Marks,Createdby,CreatedOn,UpdatedBy,UpdatedOn)
      res.status(200).send(apiResponse.successFormat(`success`, `successful data`, answerdata, []))
   // }
    // else
    // {
    //   res.status(200).send(apiResponse.successFormat(`fail`, `data already exist`, QuestionDescription, []))
    // }
      
    } else {
      res.status(400).send(apiResponse.successFormat(`failure`, `InVaild AuthToken`, {}, []))
    }
  } catch (error) {
    //console.log(`error ${JSON.stringify(error)}`)
    console.log(`error `,error)
    res.status(401).send(error)
  }
}

module.exports = { Roledata }
