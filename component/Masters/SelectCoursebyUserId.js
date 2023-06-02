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
  

  async getCourseData (userId) {
    return new Promise((resolve, reject) => {
      db.sequelize.query(`CALL sp_selectCourse_By_User(:_userId)`,
        {
          replacements: {
            _userId:userId
          }//,
          //type: db.Sequelize.QueryTypes.SELECT
        })
        .then(response => {
          console.log('response', response)
        resolve(response)
        })
    })
  //  const userData = (!_.isEmpty(userExist)) ? { courseId: userExist.courseId, courseName: userExist.courseName,courseCode:userExist.courseCode,coursePosterImage:userExist.coursePosterImage,courseDescription:userExist.courseDescription,courseRefLink:userExist.courseRefLink,courseCertRefLink:userExist.courseCertRefLink } : {}
   // return userData
  }

  async isEmptyObject(obj) {
    return !Object.keys(obj).length;
  }

  
}

const coursedata = async (req, res) => {
  try {
    console.log(`headers`, req.headers)
    const authToken = req.headers.authtoken
    
    const verifyOptions = {
      expiresIn: '1h',
      algorithm: ['RS256']
    }

    const AnswerCls = new Answer()

    // public key to generate jwt authToken
    const publicKey = fs.readFileSync(`${__basedir}/config/keys/public.key`, `utf8`)

    const legit = jwt.verify(authToken, publicKey, verifyOptions)

    console.log('log',legit)
    // console.log(`legit ${JSON.stringify(legit)}`)

    const passedUserId = (req.body && req.body.userId) ? req.body.userId : (req.headers.userid) ? req.headers.userid : ''
    console.log('userId',passedUserId)

    if (legit.userId == passedUserId) {

    const userId= req.body.userId
    console.log('inside user',userId)
    

    const answerdata= await AnswerCls.getCourseData(userId)

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

module.exports = { coursedata }
