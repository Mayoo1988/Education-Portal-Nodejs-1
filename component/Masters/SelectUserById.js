const bcrypt = require(`bcryptjs`)
const jwt = require(`jsonwebtoken`)
const fs = require(`fs`)
const _ = require(`lodash`)
// const path = require(`path`)

const db = require('../../config/db/dbConn')
const apiResponse = require(`../../helper/formatResponse`)
const errorCode = require(`../../config/errorCode/errorCode`)
const genericErrorRes = require(`../../utils/errorResponse`).errorResponse

class Answer {


  async getuserData (userId) {
    const statusvalue = 1
    const userExist = await db.users
      .findOne({
        where: {
            userId: userId
        },
        attributes: { exclude: [ 'CreatedBy','CreatedOn','UpdatedBy','UpdatedOn'] }
      })
    

    const userData = (!_.isEmpty(userExist)) ? {
      userId: userExist.userId,
      userCode: userExist.userCode,
      firstName: userExist.firstName,
      lastName: userExist.lastName,
      email_Id: userExist.email_Id,
      mobileNo: userExist.mobileNo,
      roleId: userExist.roleId,
      password: userExist.password,
      joiningDate: userExist.joiningDate,
      orgId: userExist.orgId,
      photoPath: userExist.photoPath } : {}
    return userData
  }

  async isEmptyObject(obj) {
    return !Object.keys(obj).length;
  }
}

const userdata = async (req, res) => {
  try {

    const authToken = req.headers.authtoken
    console.log('inside selectuserbyid')
    const verifyOptions = {
      expiresIn: '1h',
      algorithm: ['RS256']
    }

    const AnswerCls = new Answer()

    // public key to generate jwt authToken
    const publicKey = fs.readFileSync(`${__basedir}/config/keys/public.key`, `utf8`)

    const legit = jwt.verify(authToken, publicKey, verifyOptions)

    // console.log('log',legit)
    // console.log(`legit ${JSON.stringify(legit)}`)

  //  const passedUserId = (req.body && req.body.userId) ? req.body.userId : (req.headers.userid) ? req.headers.userid : ''
  const passedUserId =req.headers.userid
    if (legit.userId == passedUserId) {
      console.log('inside method selectuserbyid')
    const userId= req.body.userId

    const answerdata= await AnswerCls.getuserData(userId)

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
    // console.log(`error `,error)
    res.status(401).send(error)
  }
}

module.exports = { userdata }
