const bcrypt = require(`bcryptjs`)
const jwt = require(`jsonwebtoken`)
const fs = require(`fs`)
const _ = require(`lodash`)
// const path = require(`path`)

const db = require('../../config/db/dbConn')
const apiResponse = require(`../../helper/formatResponse`)
const errorCode = require(`../../config/errorCode/errorCode`)
const genericErrorRes = require(`../../utils/errorResponse`).errorResponse

class UserOrgMapping {
  UserOrgMappingInDB ( UserId, OrgId,Createdby,CreatedOn,UpdatedBy,UpdatedOn) {
    return new Promise(async (resolve, reject) => {
      try {
        await db.UserOrgMapping.create({
            UserId: UserId,
            OrgId: OrgId,
            CreatedBy:Createdby,
            CreatedOn:CreatedOn,
            UpdatedBy:UpdatedBy,
            UpdatedOn:UpdatedOn
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
}

const UserOrgMappingdata = async (req, res) => {
  try {
    console.log(`headers`, req.headers)
    const authToken = req.headers.authtoken
    
    const verifyOptions = {
      expiresIn: '1h',
      algorithm: ['RS256']
    }

    const UserOrgCls = new UserOrgMapping()

    console.log('hi',authToken)
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
    
      console.log('reqinside',req.body);
      const UserId   = req.body.userId
      const OrgId    = req.body.orgid
      const createdby = req.body.userId
      var d = new Date()
      const createdon = d
      const updatedby = req.body.userId
      const updatedon = d
      
      const userUpdate = await UserOrgCls.UserOrgMappingInDB(UserId,OrgId, createdby, createdon,updatedby,updatedon)
      res.status(200).send(apiResponse.successFormat(`success`,`insert successful`, userUpdate, []))
      
    //}



   
  } catch (error) {
    console.log(`error ${JSON.stringify(error)}`)
    res.status(401).send(error)
  }
}

module.exports = { UserOrgMappingdata }
