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


  async getCourseDataByUser (userId, courseId) {
    return new Promise((resolve, reject) => {
      db.sequelize.query(`CALL sp_selectCourseModules_By_User(:_userId, :_courseId)`,
        {
          replacements: {
            _userId:userId,
            _courseId:courseId
          }//,
          //type: db.Sequelize.QueryTypes.SELECT
        })
        .then(response => {
          console.log('user modules response', response)
          // let newResponse = _.uniqBy(response, r => {
          //   return r.ModuleId
          // });
          resolve(response);
        })
    })
  //  const userData = (!_.isEmpty(userExist)) ? { courseId: userExist.courseId, courseName: userExist.courseName,courseCode:userExist.courseCode,coursePosterImage:userExist.coursePosterImage,courseDescription:userExist.courseDescription,courseRefLink:userExist.courseRefLink,courseCertRefLink:userExist.courseCertRefLink } : {}
   // return userData
  }



  async isEmptyObject(obj) {
    return !Object.keys(obj).length;
  }


}


const courseDataByUser = async (req, res) => {
  try {

    const AnswerCls = new Answer()

    const userId= req.headers.userid;
    let courseId = req.body.courseId;
    courseId = parseInt(courseId);
    console.log('userId', userId, 'courseId', courseId);
    const answerdata = await AnswerCls.getCourseDataByUser(userId, courseId)

    // if(!Roledata)
    // {
     // const userUpdate = await RoleCls.addQuestionInDB(QuestionDescription, QuestionType,MappingId,MappingType,Marks,Createdby,CreatedOn,UpdatedBy,UpdatedOn)
      res.status(200).send(apiResponse.successFormat(`success`, `successful data`, answerdata, []))
   // }
    // else
    // {
    //   res.status(200).send(apiResponse.successFormat(`fail`, `data already exist`, QuestionDescription, []))
    // }


  } catch (error) {
    //console.log(`error ${JSON.stringify(error)}`)
    console.log(`error `,error)
    res.status(401).send(error)
  }
}

module.exports ={ courseDataByUser }
