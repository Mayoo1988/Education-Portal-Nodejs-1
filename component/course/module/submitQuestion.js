const _ = require(`lodash`)

const db = require(`../../../config/db/dbConn`)
const formatResponse = require(`../../../helper/formatResponse`)
// const errorCodeJson = require('../../../config/errorCode/errorCode')
class SubmitModuleClass{

    getMasterCorrectAnswer(QuestionId) {
        return new Promise(async (resolve, reject) => {
          try {

            // get Modules from corseId

             db.AnswerManager.findAll({
              where: {
                QuestionId: QuestionId,
              },
            }).then(masterAnswer => {

                resolve(masterAnswer);


            });
        }catch (error) {
            console.log('error', error)

            let Eresponse = genericErrorRes(error)
            reject(Eresponse)
          }
        });
      }



}

const submitModuleQuestion = async (req, res) => {
  try {

    console.log('req.body', req.body)
    const { courseId, moduleId, questionId, questionType, marks, selectedAnsId } = req.body;
    const userId = req.headers.userid;

    const submitModuleClass = new SubmitModuleClass()
    const masterAnswers = await submitModuleClass.getMasterCorrectAnswer(questionId)

    let validAnsId = 0;
    let currentOption = _.find(masterAnswers, ans => { return ans.AnsId == selectedAnsId})
    if(currentOption){
      validAnsId = currentOption.AnsId
    };
    let correctOption = _.find(masterAnswers, ans => { if(ans.IsValid) return ans;} )
    console.log('currentOption', currentOption, validAnsId, correctOption);
    // const quesAns = await db.UserCourseModuleQuestionsModel.update(
    //   { selectedAnsId: selectedAnsId, validAnsId: validAnsId, isQuestionAttempted: 1 },
    //   { where: {
    //     moduleMappingId: moduleId,
    //     userId:userId,
    //     questionId: questionId,
    //     courseId: courseId,
    //   } }
    // );
    // let isCorrectAnswer = false;
    // if(validAnsId == 1){
    //   isCorrectAnswer = true;
    // }

    console.log('req.body.selectedAnsId', req.body.selectedAnsId);
    console.log('validAnsId', correctOption.AnsId);
    db.sequelize.query(`CALL sp_submit_user_module_question_mapping_answer(:_id, :_selectedAnsId, :_validAnsId, :_isQuestionAttempted,
    :_moduleMappingId, :_userModuleMappingId)`, {
      replacements: {
        _id: req.body.questionModuleMappingId,
        _selectedAnsId: req.body.selectedAnsId,
        _validAnsId: correctOption.AnsId,
        _isQuestionAttempted: 1,
        _moduleMappingId: req.body.moduleMappingId,
        _userModuleMappingId: req.body.userModuleMappingId
      }
    }).then(response => {
      console.log('response', response)
      res.status(200).send(formatResponse.successFormat(`success`, 'Answer Submitted Successfully.', response[0], []))
    }).catch(error => {
      console.log(error);
      const code = (Object.prototype.hasOwnProperty.call(error, 'status')) ? error.code : 500
      res.status(code).send(formatResponse.successFormat(`fail`, error, {}, []))
    })

  } catch (error) {
    console.log(error);
    const code = (Object.prototype.hasOwnProperty.call(error, 'status')) ? error.code : 500
    res.status(code).send(formatResponse.successFormat(`fail`, `Something went wrong`, {}, []))
  }
}

module.exports = { submitModuleQuestion }
