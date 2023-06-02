const bcrypt = require(`bcryptjs`)
const jwt = require(`jsonwebtoken`)
const fs = require(`fs`)
const _ = require(`lodash`)
// const path = require(`path`)

const db = require('../../config/db/dbConn')
const apiResponse = require(`../../helper/formatResponse`)
const errorCode = require(`../../config/errorCode/errorCode`)
const genericErrorRes = require(`../../utils/errorResponse`).errorResponse

class Organization {
  addOrgInDB ( orgname, OrgDescription,Orglogo, createdby, createdon,updatedby,updatedon,isActive) {
    return new Promise(async (resolve, reject) => {
      try {
        await db.OrgManager.create({
            OrgName:orgname,
            OrgDescription:OrgDescription,
            OrgLogo:Orglogo,
            CreatedBy:createdby,
            CreatedOn:createdon,
            UpdatedBy:updatedby,
            UpdatedOn:updatedon,
            isActive:isActive
        })
        resolve()
      } catch (error) {
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

    const userData = (!_.isEmpty(userExist)) ? { userId: userExist.user_id, password: userExist.password, status: userExist.status, baId: userExist.ba_id } : {}
    return userData
  }

  async isEmptyObject(obj) {
    return !Object.keys(obj).length;
  }

  async getOrgData (OrgName) {
    const statusvalue = 1
    const userExist = await db.RoleManager
      .findOne({
        where: {
            OrgName: OrgName
        },
        attributes: { exclude: ['RoleDescription', 'created_by', 'created_on', 'updated_by', 'updated_on'] }
      })
    console.log('details', userExist)

    const userData = (!_.isEmpty(userExist)) ? { OrgName: userExist.OrgName} : {}
    return userData;
  }

}

const Org = async (req, res) => {
  try {

    console.log(`headers`, req.headers)
    const authToken = req.headers.authtoken

    const verifyOptions = {
      expiresIn: '1h',
      algorithm: ['RS256']
    }

    const OrgCls = new Organization()

    // public key to generate jwt authToken
    const publicKey = fs.readFileSync(`${__basedir}/config/keys/public.key`, `utf8`)
    const legit = jwt.verify(authToken, publicKey, verifyOptions)
    const passedUserId = (req.body && req.body.userId) ? req.body.userId : (req.headers.userid) ? req.headers.userid : ''

    if (legit.userId == passedUserId) {
      console.log('Inside org');
        const orgname= req.body.orgName
        const OrgDescription = req.body.orgDescription
        const Orglogo = req.body.orgLogo
        const createdby = passedUserId
        var d = new Date()
        const createdon = d
        const updatedby = passedUserId
        const updatedon = d
        const isActive='1'
        console.log('Inside org',orgname, OrgDescription,Orglogo, createdby, createdon,updatedby,updatedon,isActive);
        const userUpdate = await OrgCls.addOrgInDB(orgname, OrgDescription,Orglogo, createdby, createdon,updatedby,updatedon,isActive)
        res.status(200).send(apiResponse.successFormat(`success`, `insert successful`, userUpdate, []))

    } else {

      res.status(400).send(apiResponse.successFormat(`failure`, `Error on Insert`, userUpdate, []))
    }
  } catch (error) {
    res.status(401).send(error)
  }
}

module.exports = { Org }
