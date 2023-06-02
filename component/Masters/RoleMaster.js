const bcrypt = require(`bcryptjs`)
const jwt = require(`jsonwebtoken`)
const fs = require(`fs`)
const _ = require(`lodash`)
// const path = require(`path`)

const db = require('../../config/db/dbConn')
const apiResponse = require(`../../helper/formatResponse`)
const errorCode = require(`../../config/errorCode/errorCode`)
const genericErrorRes = require(`../../utils/errorResponse`).errorResponse

class Role {
  addRoleInDB ( RoleName, RoleDescription,Createdby,CreatedOn,UpdatedBy,UpdatedOn,isActive) {
    return new Promise(async (resolve, reject) => {
      try {
        await db.RoleManager.create({
            roleName: RoleName,
            roleDescription: RoleDescription,
            createdBy:Createdby,
            createdOn:CreatedOn,
            updatedBy:UpdatedBy,
            updatedOn:UpdatedOn,
            isActive:isActive
        })
        resolve()
      } catch (error) {
        console.log(`error ${error}`)
        let Eresponse = genericErrorRes(error)
        reject(Eresponse)
      }
    })
  }

  async getUserData (userid) {
    const statusvalue = 1
    const userExist = await db.users
      .findOne({
        where: {
          userid: userid,
          status: statusvalue
        },
        attributes: { exclude: ['email_id', 'mobile_no', 'created_by', 'created_on', 'updated_by', 'ba_details_verification', 'action_by', 'action_on', 'updated_on'] }
      })
    console.log('details', userExist)

    const userData = (!_.isEmpty(userExist)) ? { userId: userExist.user_id, password: userExist.password, status: userExist.status, baId: userExist.ba_id } : {}
    return userData
  }

  async isEmptyObject(obj) {
    return !Object.keys(obj).length;
  }

  async getRoleData (RoleName) {
    const statusvalue = 1
    const userExist = await db.RoleManager
      .findOne({
        where: {
          roleName: RoleName
        },
        attributes: { exclude: ['RoleDescription', 'created_by', 'created_on', 'updated_by', 'updated_on'] }
      })
    console.log('details', userExist)
  
    const userData = (!_.isEmpty(userExist)) ? { RoleName: userExist.roleName} : {}
    return userData;
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

    const RoleCls = new Role()

    console.log('hi')
    // public key to generate jwt authToken
    const publicKey = fs.readFileSync(`${__basedir}/config/keys/public.key`, `utf8`)

    const legit = jwt.verify(authToken, publicKey, verifyOptions)

    console.log('log',legit)
    // console.log(`legit ${JSON.stringify(legit)}`)

    const passedUserId = (req.body && req.body.userId) ? req.body.userId : (req.headers.userid) ? req.headers.userid : ''
    
    console.log('userid',passedUserId)

    console.log('userid',legit.userId)
    if (legit.userId == passedUserId) {

    const rolename= req.body.roleName
    const roledescription = req.body.roleDescription

    const isActive=req.body.isActive
    console.log('roledesc',roledescription)
    console.log('rolename',rolename)
    const createdby = req.body.createdBy
    console.log('createdby',createdby)
    var d = new Date()
    const createdon = d
    const updatedby = req.body.updatedBy
    const updatedon = d

    

    const Roledata= await RoleCls.getRoleData(rolename)

    console.log('role',Roledata)

    if(Roledata)
    {
      const userUpdate = await RoleCls.addRoleInDB(rolename, roledescription, createdby, createdon,updatedby,updatedon,isActive)
      res.status(200).send(apiResponse.successFormat(`success`, `insert successful`, userUpdate, []))
    }
    else
    {
      res.status(200).send(apiResponse.successFormat(`fail`, `data already exist`, rolename, []))
    }
      
    } else {
      res.status(400).send(apiResponse.successFormat(`failure`, `InVaild AuthToken`, {}, []))
    }
  } catch (error) {
    console.log(`error ${JSON.stringify(error)}`)
    res.status(401).send(error)
  }
}

module.exports = { Roledata }
