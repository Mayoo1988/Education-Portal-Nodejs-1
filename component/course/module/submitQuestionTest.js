const _ = require(`lodash`)

const db = require(`../../../config/db/dbConn`)
const formatResponse = require(`../../../helper/formatResponse`)
// const errorCodeJson = require('../../../config/errorCode/errorCode')
class SubmitModuleTestClass{
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

    calculateModuleScore(moduleId, courseId, userId){
    return new Promise(async (resolve, reject) => {
        try {
            db.UserCourseModuleQuestionsModel.findAll({
                where: {
                    courseId:courseId,
                    userId: userId,
                    moduleMappingId: moduleId,

                },
                }).then(moduleAssignedQuestions => {

                let moduleScore = 0;
                let moduleTotalScore = 0;
                let questionScoreCard = [];
                let questionsId = [];
                let completedQuestions = moduleAssignedQuestions.length;
                _.forEach(moduleAssignedQuestions, (question)=> {
                    let card = {
                        questionId: question.questionId,
                        isCorrect: false
                    }
                    moduleTotalScore += question.marks;
                    if(question.validAnsId){
                        moduleScore += question.marks;
                        card.isCorrect = true
                    }

                    questionsId.push(question.questionId);
                    questionScoreCard.push(card);



                });

                    db.UserCourseModuleModel.update(
                    { score: moduleScore,  status: 'Completed', completedQuestions: completedQuestions },
                    { where: {
                        id: moduleId,
                        userId:userId,
                        courseId: courseId
                    } }
                    ).then( UserCourseModuleModelResponse => {

                        db.QuestionManager.findAll({
                            where: {
                              QuestionId: questionsId,
                            },
                          }).then(MasterQuestion => {

                            _.forEach(MasterQuestion, (question) => {
                                let currentQuestion = _.find(questionScoreCard, q => { return q.questionId == question.QuestionId} )

                                currentQuestion.questionDescription = question.QuestionDescription
                            });

                            resolve({moduleScore: moduleScore, questionScoreCard: questionScoreCard, moduleTotalScore: moduleTotalScore});
                          });
                });
                });

        }catch (error) {
            console.log('error', error)

            let Eresponse = genericErrorRes(error)
            reject(Eresponse)
            }
        });
    }

    getCurrentUserCourseMapping(courseId, userId){
        return new Promise(async (resolve, reject) => {
            try {
                db.UserCourseModel.findOne({
                    where: {
                        courseId:courseId,
                        userId: userId,            
                    },
                    }).then(userCourseModelResponse => {
                        resolve(userCourseModelResponse)
                    });

            }catch (error) {
                console.log('error', error)
    
                let Eresponse = genericErrorRes(error)
                reject(Eresponse)
                }
        });
    }

    
      
}


const submitModuleTest = async (req, res) => {
    try {
        const { courseId, moduleId, QuestionId, QuestionType, marks, selectedAnsId } = req.body;
        const userId = req.headers.userid;
        const submitModuleTestClass = new SubmitModuleTestClass()
        const masterAnswers = await submitModuleTestClass.getMasterCorrectAnswer(QuestionId)
        console.log('masterAnswers', JSON.stringify(masterAnswers));
        let validAnsId = 0;
        let currentOption = _.find(masterAnswers, ans => { console.log("ans", JSON.stringify(ans)); return ans.AnsId == selectedAnsId})
        if(currentOption) validAnsId = currentOption.IsValid; 
        console.log("currentOption", currentOption);
        // Updated question_user_module_mapping
        const quesAns = await db.UserCourseModuleQuestionsModel.update(
        { selectedAnsId: selectedAnsId,  validAnsId: validAnsId, marks: marks, isQuestionAttempted: 1 },
        { where: {
            moduleMappingId: moduleId,
            userId:userId,
            questionId: QuestionId,
            courseId: courseId,
        } }
        )
        //Calculate total Score and save it to user_module_course_mapping
        const totalScore = await submitModuleTestClass.calculateModuleScore(moduleId, courseId, userId);
        //get Current User Course Mapping

        const currentUserCourseMapping = await submitModuleTestClass.getCurrentUserCourseMapping( courseId, userId);
        console.log("currentUserCourseMapping", JSON.stringify(currentUserCourseMapping));
        let completedModules = currentUserCourseMapping.completedModules +1;


        let saveStatus ="In Progress";
        if(completedModules > currentUserCourseMapping.totalModules){
            completedModules =  currentUserCourseMapping.totalModules;
            saveStatus = "Completed"
        }
        // Complete Module 
        console.log({ 'completedModules': completedModules,  'status': saveStatus })
        const updateCourseModelResponse= await db.UserCourseModel.update(
            { completedModules: completedModules,  status: saveStatus },
            { where: {
            userId:userId,
            courseId: courseId
            } }
        )

    res.status(200).send(formatResponse.successFormat(`success` , `successful data`, {message: 'Answer Submitted Successfully.', moduleScoreCard: totalScore.questionScoreCard, score: totalScore.moduleScore, totalScore: totalScore.moduleTotalScore  }, { quesAns }, []))
    } catch (error) {
        console.log(error);
      const code = (Object.prototype.hasOwnProperty.call(error, 'status')) ? error.code : 500
      // const response = errorResponse(error)
      res.status(code).send(formatResponse.successFormat(`fail`, `Something went wrong`, {}, []))
    }
  }
module.exports = { submitModuleTest }