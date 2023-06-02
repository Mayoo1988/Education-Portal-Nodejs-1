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
  async getCourseData (courseId) {
    const statusvalue = 1
    const userExist = await db.CourseManager.findOne({
      where: {
        CourseId: courseId
      },
      attributes: { exclude: [ 'createdBy','createdOn','updatedBy','updatedOn'] }
    })

    const userData = (!_.isEmpty(userExist)) ? { courseId: userExist.dataValues.CourseId,
      courseName: userExist.dataValues.CourseName,
      courseCode: userExist.dataValues.CourseCode,
      coursePosterImage: userExist.dataValues.CoursePosterImage,
      courseDescription: userExist.dataValues.CourseDescription,
      categoryId: userExist.dataValues.categoryId,
      courseRefLink: userExist.dataValues.courseRefLink,
      courseCertRefLink: userExist.dataValues.courseCertRefLink } : {}
    return userData
  }

  async isEmptyObject(obj) {
    return !Object.keys(obj).length;
  }
}

const coursedata = async (req, res) => {
  try {
    const authToken = req.headers.authtoken

    const verifyOptions = {
      expiresIn: '1h',
      algorithm: ['RS256']
    }

    const AnswerCls = new Answer()

    // public key to generate jwt authToken
    const publicKey = fs.readFileSync(`${__basedir}/config/keys/public.key`, `utf8`)
    const legit = jwt.verify(authToken, publicKey, verifyOptions)

    const passedUserId = (req.body && req.body.userId) ? req.body.userId : (req.headers.userid) ? req.headers.userid : ''

    if (legit.userId == passedUserId) {

      const courseId= req.body.courseId
      const answerdata= await AnswerCls.getCourseData(courseId)

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
