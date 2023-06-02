const _ = require(`lodash`)

const db = require(`../../../config/db/dbConn`)
const formatResponse = require(`../../../helper/formatResponse`)
const apiResponse = require(`../../../helper/formatResponse`)
const errorCode = require(`../../../config/errorCode/errorCode`)
// const errorCodeJson = require('../../../config/errorCode/errorCode')

class Answer {
  getQuestionsData(QuestionIds){
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

  getAnswersData(QuestionIds){
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
}


const apiFn = async (req, res) => {
  try {
    const { courseId, moduleId } = req.query
    const userId = req.headers.userid;

    const result = []
    const quesAns = await db.sequelize.query(`CALL Sp_get_question_answer(:_moduleId, :_courseId, :_userId, :_userCourseMappingId)`,
      {
        replacements: {
          _moduleId: moduleId,
          _courseId: courseId,
          _userId: userId,
          _userCourseMappingId: userCourseMappingId
        }
      })
    const quesTrackerObj = {}
    const ansTrackerObj = {};
    let questionDetails =[];
    _.each(quesAns, e => {
      if (_.has(ansTrackerObj, e.QuestionId)) {
        ansTrackerObj[e.QuestionId].push({answerDescription: e.AnsDescription, answerId: e.AnsId} )



      } else {
        quesTrackerObj[e.QuestionId] = e.QuestionDescription;
        ansTrackerObj[e.QuestionId] = [];
        ansTrackerObj[e.QuestionId].push({answerDescription: e.AnsDescription, answerId: e.AnsId} )
        // ansTrackerObj[e.QuestionId].push(e.AnsDescription)

      }
    })
    _.each(quesAns, item => {
      questionDetails.QuestionId = item.QuestionId;
      let currentObject = _.find(questionDetails, q => {if(q.QuestionId == item.QuestionId) return q});

      if(currentObject){
        // currentObject.selectedAnsId = item.selectedAnsId;
        // validAnsId: item.validAnsId,
        // currentObject.marks = item.Marks;

      }else{
        let newObject ={
          QuestionId:item.QuestionId,
          QuestionType: item.QuestionType,
          selectedAnsId: item.selectedAnsId,
          moduleId: item.moduleMappingId,
          courseId: item.courseId,
          marks: item.Marks,
          question: item.QuestionDescription,
          isQuestionAttempted: item.isQuestionAttempted == 1 ? true: false,
          answers: ansTrackerObj[item.QuestionId],
        }
        questionDetails.push(newObject);
      }
    });


    _.forOwn(quesTrackerObj, (values, key) => {
      result.push({
        // question: values,
        // answer: ansTrackerObj[key],
        questionDetails: _.find(questionDetails, detail => { if(key == detail.QuestionId) return detail})
      })
    })
    res.status(200).send(formatResponse.successFormat(`success`, `Questions & Answer succesfully fetched`, result, []))
  } catch (error) {
    const code = (Object.prototype.hasOwnProperty.call(error, 'status')) ? error.code : 500
    // const response = errorResponse(error)
    res.status(code).send(formatResponse.successFormat(`fail`, `Something went wrong`, {}, []))
  }
}

const getCourseModuleQuestions = async (req, res) => {
  try{
    console.log('In getCourseModuleQuestions');
    console.log('req.query', req.query);
    const answerClass = new Answer()
    db.sequelize.query(`CALL sp_get_question_answer(:_moduleId, :_courseId, :_userModuleMappingId)`, {
      replacements: {
        _moduleId: req.query.moduleId,
        _courseId: req.query.courseId,
        _userModuleMappingId: req.query.userModuleMappingId
      }
    }).then(response => {
      console.log('response', response)
      let questionIds = '';
      response.forEach(async (ele, index) => {
        questionIds = ele.questionId + ',' + questionIds;

        if(response.length - 1 == index){
          let questionsData =  await answerClass.getQuestionsData(questionIds.slice(0, -1));
          // console.log('questionsData', questionsData);
          let answersData =  await answerClass.getAnswersData(questionIds.slice(0, -1));
          // console.log('answersData', answersData);
          questionsData.forEach((ele, questionIndex) => {
            ele.questionModuleMappingId = response[questionIndex].id,
            ele.courseId = response[questionIndex].courseId,
            ele.moduleId = response[questionIndex].moduleId,
            ele.userModuleMappingId = response[questionIndex].userModuleMappingId,
            ele.moduleMappingId = response[questionIndex].moduleMappingId,
            ele.selectedAnsId = response[questionIndex].selectedAnsId,
            ele.isQuestionAttempted = response[questionIndex].isQuestionAttempted,
            ele.marks = response[questionIndex].marks,
            ele.answerDescription = answersData.filter(ansEle => ansEle.questionId == ele.questionId)
          });

          res.status(200).send(formatResponse.successFormat(`success`, `Records fetched successfully`, questionsData, []))
          // res.status(200).send(apiResponse.successFormat(`success`, '', questionsData));
        }
      })
    }).catch(e => {
      const code = (Object.prototype.hasOwnProperty.call(e, 'status')) ? e.code : 500
      res.status(code).send(formatResponse.successFormat(`fail`, `Something went wrong`, {}, []))
    })
  }catch(error){
    const code = (Object.prototype.hasOwnProperty.call(error, 'status')) ? error.code : 500
    res.status(code).send(formatResponse.successFormat(`fail`, `Something went wrong`, {}, []))
  }
}

const getCurrentQuestionStatus = async (req, res) => {
  try{
    console.log('In getCurrentQuestionStatus');
    console.log('req', req.query.questionModuleMappingId);
    const answerClass = new Answer()
    db.sequelize.query(`CALL sp_get_current_question_status(:_questionModuleMappingId)`, {
      replacements: {
        _questionModuleMappingId: req.query.questionModuleMappingId
      }
    }).then(response => {
      // console.log('response', response)
      res.status(200).send(formatResponse.successFormat(`success`, `Question status`, response[0], []));
    }).catch(e => {
      const code = (Object.prototype.hasOwnProperty.call(e, 'status')) ? e.code : 500
      res.status(code).send(formatResponse.successFormat(`fail`, `Something went wrong`, {}, []))
    })
  }catch(error){
    const code = (Object.prototype.hasOwnProperty.call(error, 'status')) ? error.code : 500
    res.status(code).send(formatResponse.successFormat(`fail`, `Something went wrong`, {}, []))
  }
}

const getUserModuleScore = async (req, res) => {
  try{
    console.log('In getUserModuleScore');
    console.log('req', req.query.userModuleMappingId);
    const answerClass = new Answer()
    db.sequelize.query(`CALL sp_get_module_score(:_userModuleMappingId)`, {
      replacements: {
        _userModuleMappingId: req.query.userModuleMappingId
      }
    }).then(response => {
      // console.log('response', response)
      res.status(200).send(formatResponse.successFormat(`success`, `result status`, response[0], []));
    }).catch(e => {
      const code = (Object.prototype.hasOwnProperty.call(e, 'status')) ? e.code : 500
      res.status(code).send(formatResponse.successFormat(`fail`, `Something went wrong`, {}, []))
    })
  }catch(error){
    const code = (Object.prototype.hasOwnProperty.call(error, 'status')) ? error.code : 500
    res.status(code).send(formatResponse.successFormat(`fail`, `Something went wrong`, {}, []))
  }
}

module.exports = { apiFn, getCourseModuleQuestions, getCurrentQuestionStatus, getUserModuleScore }
