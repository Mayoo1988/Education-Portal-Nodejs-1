const bcrypt = require(`bcryptjs`)
const jwt = require(`jsonwebtoken`)
const fs = require(`fs`)
const _ = require(`lodash`)
// const path = require(`path`)

const db = require('../../config/db/dbConn')
const apiResponse = require(`../../helper/formatResponse`)
const errorCode = require(`../../config/errorCode/errorCode`)
const genericErrorRes = require(`../../utils/errorResponse`).errorResponse

class Question {
  addQuestionInDB ( QuestionDescription, QuestionType,MappingId,MappingType,Marks,Createdby,CreatedOn,UpdatedBy,UpdatedOn) {
    return new Promise(async (resolve, reject) => {
      try{

      
      db.sequelize.query(`CALL Sp_insert_questions_answer(:questionDescription, :questionType, :mappingId, :mappingType,:marks, :createdBy, :createdOn, :updatedBy, :updatedOn)`,
        {
          replacements: {
            questionDescription:QuestionDescription,
            questionType: QuestionType,
            mappingId:MappingId,
            mappingType:MappingType,
            marks:Marks,
            createdBy:Createdby,
            createdOn:CreatedOn,
            updatedBy:UpdatedBy,
            updatedOn:UpdatedOn
          }//,
          //type: db.Sequelize.QueryTypes.SELECT
        })
        .then(response => {
          console.log('response', response)
        resolve(response)
        })}catch (error) {
          console.log('error',error)
          let Eresponse = genericErrorRes(error)
          reject(Eresponse)
        }
    })
  
  }

  addAnswerInDB ( AnsDescription, QuestionId,IsValid,Createdby,CreatedOn,UpdatedBy,UpdatedOn) {
    return new Promise(async (resolve, reject) => {
      try {
        await db.AnswerManager.create({
            AnsDescription: AnsDescription,
            QuestionId: QuestionId,
            IsValid:IsValid,
            CreatedBy:Createdby,
            CreatedOn:CreatedOn,
            UpdatedBy:UpdatedBy,
            UpdatedOn:UpdatedOn
        })
        resolve()
      } catch (error) {
        console.log('error',error)
        let Eresponse = genericErrorRes(error)
        reject(Eresponse)
      }
    })
  }

  async getQuestionData (questionDescription,mappingId) {
    const userExist = await db.QuestionManager
      .findOne({
        where: {
          QuestionDescription: questionDescription,
          MappingId:mappingId
        },
        attributes: { exclude: [ 'QuestionType','MappingId','MappingType','Marks','Createdby','CreatedOn','UpdatedBy','UpdatedOn'] }
      })


    const userData =  userExist.QuestionId

    console.log(userData)

    return userData
  }

  async isEmptyObject(obj) {
    return !Object.keys(obj).length;
  }
}

const Questiondata = async (req, res) => {
  try {

    const authToken = req.headers.authtoken
    const verifyOptions = {
      expiresIn: '1h',
      algorithm: ['RS256']
    }
    const RoleCls = new Question()
    const publicKey = fs.readFileSync(`${__basedir}/config/keys/public.key`, `utf8`)
    const legit = jwt.verify(authToken, publicKey, verifyOptions)
    const passedUserId = (req.body && req.body.userId) ? req.body.userId : (req.headers.userid) ? req.headers.userid : ''

    if (legit.userId == passedUserId) {

      const QuestionDescription= req.body.questionDescription

      const QuestionType = req.body.questionType
      const MappingId = req.body.mappingId
      const MappingType = req.body.mappingType
      const Marks = req.body.marks
      const Createdby = legit.userId
      var d = new Date()
      const CreatedOn = d
      const UpdatedBy = legit.userId
      const UpdatedOn = d
      var answerDescription = req.body.answerDescription
     // var QuestionId=4
      
      var userUpdate = await RoleCls.addQuestionInDB(QuestionDescription, QuestionType,MappingId,MappingType,Marks,Createdby,CreatedOn,UpdatedBy,UpdatedOn)
      //console.log('Userdata',userUpdate[0])
     // console.log('Userdata',userUpdate[0].questionid)
      console.log('description',answerDescription)
      for(i = 0; i < 4; i++){
        const userdata = await RoleCls.addAnswerInDB( answerDescription[i].answerDescription, userUpdate[0].questionid,answerDescription[i].isValid,Createdby,CreatedOn,UpdatedBy,UpdatedOn)
      }
    //   var questionid;
    //   Object.keys(userUpdate).forEach(function(key) {
    //     var row = userUpdate[key];
    //     questionid= row['questionid']
    //   });

    //   let responseObj = {}

    //   for(i = 0; i < 4; i++){
    //     _.forOwn(answerDescription[i], (value, key) => {
    //       responseObj[key] = value
    //     })
    //     const userUpdate = await RoleCls.addAnswerInDB( responseObj['answerDescription'], userUpdate[0].questionid,responseObj['isValid'],Createdby,CreatedOn,UpdatedBy,UpdatedOn)
    //  }
       res.status(200).send(apiResponse.successFormat(`success`, `insert successful`, userUpdate, []))
    } else {
      res.status(400).send(apiResponse.successFormat(`failure`, `InVaild AuthToken`, userdata, []))
    }
  } catch (error) {
    console.log(`error ${JSON.stringify(error)}`)
    res.status(401).send(error)
  }
}

module.exports = { Questiondata }
