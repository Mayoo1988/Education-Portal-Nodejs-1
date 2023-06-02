// const jwt = require(`jsonwebtoken`)
// const fs = require(`fs`)
const _ = require(`lodash`)
// const path = require(`path`)

const db = require('../../config/db/dbConn')
const apiResponse = require(`../../helper/formatResponse`)
// const errorCode = require(`../../config/errorCode/errorCode`)
// const genericErrorRes = require(`../../utils/errorResponse`).errorResponse

class Answer {
  async getmoduleData (ModuleId) {
    const moduleData = await db.ModuleManager
      .findOne({
        where: {
          ModuleId: ModuleId
        },
        attributes: { exclude: ['CreatedBy', 'CreatedOn', 'UpdatedBy', 'UpdatedOn'] }
      })
    // console.log('details', moduleData)

    const img = (moduleData.ImageFile) ? `${process.env.URL_METHOD}://${process.env.URL}/${moduleData.ImageFile}` : ``
    const video = (moduleData.videoFile) ? `${process.env.URL_METHOD}://${process.env.URL}/${moduleData.videoFile}` : ``
    const userData = (!_.isEmpty(moduleData)) ? moduleData : {}
    return userData
  }

  getQuestionsData(QuestionIds) {
    return new Promise((resolve, reject) => {
      console.log('QuestionIds', QuestionIds);
      db.sequelize.query(`CALL Sp_get_module_questions(:QuestionIds)`, {
        replacements: {
          QuestionIds: QuestionIds
        }
      }).then(response => {
        // console.log('response', response);
        resolve(response);
      }).catch(err => {
        reject(err);
      });
    })
  }

  getAnswersData(QuestionIds) {
    return new Promise((resolve, reject) => {
      console.log('QuestionIds', QuestionIds);
      db.sequelize.query(`CALL sp_get_module_question_answers(:QuestionIds)`, {
        replacements: {
          QuestionIds: QuestionIds
        }
      }).then(response => {
        // console.log('response', response);
        resolve(response);
      }).catch(err => {
        reject(err);
      });
    })
  }

  async isEmptyObject (obj) {
    return !Object.keys(obj).length
  }
}

const moduledata = async (req, res) => {
  try {
    const answerCls = new Answer()
    const moduleId = req.body.moduleId
    console.log('module',moduleId)
    let moduleResponse = await answerCls.getmoduleData(moduleId);
    console.log('moduleResponse',moduleResponse)
    if(moduleResponse.questionsId){
      // let questionsData = await answerCls.getQuestionsData(moduleResponse.questionsId);
      // let answersData = await answerCls.getAnswersData(moduleResponse.questionsId);
      // questionsData.forEach((ele, index) => {
      //   ele.answerDescription = answersData.filter(ansEle => ansEle.questionId == ele.questionId)
      // });
      // moduleResponse.dataValues.questions = questionsData;
      // console.log('moduleResponse', moduleResponse)
    }
    res.status(200).send(apiResponse.successFormat(`success`, `successful data`, moduleResponse, []))
  } catch (error) {
    // console.log(`error ${JSON.stringify(error)}`)
    console.log(`error `, error)
    res.status(500).send(error)
  }
}

module.exports = { moduledata }
