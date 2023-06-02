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
  addUserInDB(usercode, firstname, lastname, emailid, mobileno, photopath, roleId, isactive, joiningdate, createdby, createdon, updatedby, updatedon, password,orgdata) {
    console.log('inside function')
    return new Promise(async (resolve, reject) => {
      try {
        await db.userManage.create({
          userCode: usercode,
          firstName: firstname,
          lastName: lastname,
          email_Id: emailid,
          mobileNo: mobileno,
          photoPath: photopath,
          roleId: roleId,
          isActive: isactive,
          joiningDate: joiningdate,
          createdBy: createdby,
          createdOn: createdon,
          updatedBy: updatedby,
          updatedOn: updatedon,
          password: password,
          orgId:orgdata
        }).then(response => {

          resolve(response);
      
     }).catch((error) => {
      console.log('error',error)
     // console.log(`sp error ${JSON.stringify(error)}`)
     const errorObj = {
       code: `err_001`,
       message: errorCode.err_001
     }
     reject(apiResponse.errorFormat(`fail`, `Something went wrong`, {}, [errorObj], 400))
   });
      } catch (error) {
        let Eresponse = genericErrorRes(error)
        console.log('error',error)
        reject(Eresponse)
      }
    })
  }

  // async getUserData (userid) {
  //   const statusvalue = 1
  //   const userExist = await db.users
  //     .findOne({
  //       where: {
  //         userid: userid,
  //         status: statusvalue
  //       },
  //       attributes: { exclude: ['email_id', 'mobile_no', 'created_by', 'created_on', 'updated_by', 'ba_details_verification', 'action_by', 'action_on', 'updated_on'] }
  //     })
  //   console.log('details', userExist)

  //   const userData = (!_.isEmpty(userExist)) ? { userId: userExist.user_id, password: userExist.password, status: userExist.status, baId: userExist.ba_id } : {}
  //   return userData
  // }


  async isEmptyObject(obj) {
    return !Object.keys(obj).length;
  }

  async encryptPassword(password) {
    const saltRounds = 15
    return bcrypt.hash(password, saltRounds)
  }

  async getUserData(email_Id) {
    
    const statusvalue = 1
    const userExist = await db.userManage
      .findOne({
        where: {
          email_Id: email_Id
        },
        attributes: {
          exclude: ['firstName', 'lastName', 'mobileNo', 'photoPath', 'isActive', 'joiningDate', 'createdBy', 'createdOn', 'updatedBy', 'updatedOn', 'password']
        }
    })
    const userData = (!_.isEmpty(userExist)) ? {
      UserCode: userExist.userCode,
      email_id: userExist.email_Id
    } : {}
    

    return userData;
  }
}

const user = async (req, res) => {
  try {
    // const authToken = req.headers.authtoken
    // const verifyOptions = {
    //   expiresIn: '1h',
    //   algorithm: ['RS256']
    // }

    const UserCls = new User()

    // public key to generate jwt authToken
    // const publicKey = fs.readFileSync(`${__basedir}/config/keys/public.key`, `utf8`)
    // const legit = jwt.verify(authToken, publicKey, verifyOptions)

    const passedUserId = (req.body && req.body.userId) ? req.body.userId : (req.headers.userid) ? req.headers.userid : ''

    
     console.log('inside');
    
      const usercode = req.body.userCode
      const firstname = req.body.firstName
      const lastname = req.body.lastName
      const emailid = req.body.email_Id
      const mobileno = req.body.mobileNo
      const photopath = req.body.photoPath
      const isactive = req.body.isActive
      const roleId = req.body.roleId
      const jdate = req.body.joiningDate
      const password = req.body.password
      const orgdata= req.body.Orgid;
      console.log('orgid',orgdata)
      //const joiningdate = new Date(jdate)

      var d = new Date()
      const createdby = req.body.createdBy
      const createdon = d
      const updatedby = req.body.updatedBy
      const updatedon = d
      

      const userdata = await UserCls.getUserData(emailid)
      
      const passwordvalue = await UserCls.encryptPassword(password)

      const data = await UserCls.isEmptyObject(userdata)
      

      if (data) {
        console.log('inside add user',emailid)
        const userUpdate = await UserCls.addUserInDB(usercode, firstname, lastname, emailid, mobileno, photopath, roleId, isactive, jdate, 'Admin', d, null, null, passwordvalue,orgdata)
        res.status(200).send(apiResponse.successFormat(`success`, `insert successful`, userUpdate, []))
      } else {
        res.status(200).send(apiResponse.successFormat(`fail`, `data already exist`, emailid, []))
      }
    // } else {
    //   res.status(400).send(apiResponse.successFormat(`failure`, `InVaild AuthToken`, {}, []))
    // }

  } catch (error) {
    res.status(401).send(error)
  }
}

module.exports = {
  user
}
