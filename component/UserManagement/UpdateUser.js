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
  UpdateUserInDB (userid,usercode, firstname, lastname, emailid, mobileno, photopath, isactive, joiningdate,
      password, orgId, createdby, createdon, updatedby,updatedon) {

    console.log('orgId', orgId)
    console.log('orgId', password)
    return new Promise((resolve, reject) => {

        db.sequelize.query(`CALL sp_Update_User(:_userId, :userCode, :firstName, :lastName, :email_Id, :mobileNo, :photoPath, :isActive,
            :joiningDate, :createdBy, :createdOn, :updatedBy, :updatedOn)`,
          {
            replacements: {
              _userId: userid,
              userCode: usercode,
              firstName: firstname,
              lastName: lastname,
              email_Id: emailid,
              mobileNo: mobileno,
              photoPath: photopath,
              isActive: isactive,
              joiningDate: joiningdate,
              createdBy: createdby,
              createdOn: createdon,
              updatedBy: updatedby,
              updatedOn: updatedon
            }//,
            //type: db.Sequelize.QueryTypes.SELECT
          })
          .then(response => {

               resolve(response);
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
    return bcrypt.hash(password, saltRounds)
  }


}

const userupdate = async (req, res) => {
  try {
    const authToken = req.headers.authtoken

    console.log('token',authToken)

    const verifyOptions = {
      expiresIn: '1h',
      algorithm: ['RS256']
    }

    const UserCls = new User()

    // public key to generate jwt authToken
    const publicKey = fs.readFileSync(`${__basedir}/config/keys/public.key`, `utf8`)

    const legit = jwt.verify(authToken, publicKey, verifyOptions)

    // console.log(`legit ${JSON.stringify(legit)}`)

    const passedUserId =  req.headers.userid;

    // const userDatavalue= await verifydata.getUserData(passedUserId)
    // const data= await  verifydata.isEmptyObject(userDatavalue)
    // console.log(`passedUserId ${passedUserId}`)
  //  console.log(passedUserId)
    if (legit.userId == passedUserId)
   {
    const userid = req.body.userId
    const usercode = req.body.userCode
    const firstname = req.body.firstName
    const lastname = req.body.lastName
    const emailid = req.body.email_Id
    const mobileno = req.body.mobileNo
    const photopath = req.body.photoPath
    const isactive = req.body.isActive
    const jdate = req.body.joiningDate
    const orgId = req.body.orgId
    //const joiningdate = new Date(jdate)
    const saltRounds = 15;
    const password = await UserCls.encryptPassword(req.body.password);

    var d = new Date()

    //console.log('date',joiningdate)
    const createdby = userid
    const createdon = d
    const updatedby = req.body.updatedBy || passedUserId
    const updatedon = d

    const userUpdate = await UserCls.UpdateUserInDB(userid, usercode, firstname, lastname, emailid, mobileno,
        photopath, isactive, jdate, password, orgId, createdby, createdon, updatedby, updatedon)
      res.status(200).send(apiResponse.successFormat(`success`, `insert successful`, userUpdate, []))
    }
    else
    {
    res.status(400).send(apiResponse.successFormat(`failure`, `InVaild AuthToken`, {}, []))
    }

  } catch (error) {
    console.log(`error`,error)
    res.status(400).send(error)
  }
}
module.exports = { userupdate }
