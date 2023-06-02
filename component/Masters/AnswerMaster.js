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
        console.log(`error`,error)
        let Eresponse = genericErrorRes(error)
        reject(Eresponse)
      }
    })
  }

 
  async isEmptyObject(obj) {
    return !Object.keys(obj).length;
  }

  
}

const Answerdata = async (req, res) => {
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
    
    console.log('userid',passedUserId)

    console.log('userid',legit.userId)
    if (legit.userId == passedUserId) {

    const AnsDescription= req.body.AnsDescription
    const QuestionId = req.body.QuestionId
    const IsValid = req.body.IsValid
    const Createdby = req.body.createdby
    var d = new Date()
    const CreatedOn = d
    const UpdatedBy = req.body.updatedby
    const UpdatedOn = d

    

    //const Roledata= await RoleCls.getQuestionData(rolename)

    // if(!Roledata)
    // {
      const userUpdate = await AnswerCls.addAnswerInDB( AnsDescription, QuestionId,IsValid,Createdby,CreatedOn,UpdatedBy,UpdatedOn)
      res.status(200).send(apiResponse.successFormat(`success`, `insert successful`, userUpdate, []))
   // }
    // else
    // {
    //   res.status(200).send(apiResponse.successFormat(`fail`, `data already exist`, QuestionDescription, []))
    // }
      
    } else {
      res.status(400).send(apiResponse.successFormat(`failure`, `InVaild AuthToken`, {}, []))
    }
  } catch (error) {
    console.log(`error`,error)
    res.status(401).send(error)
  }
}

module.exports = { Answerdata }
