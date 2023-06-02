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
  

  async getQuestionData (questionid) {
    const statusvalue = 1
    const userExist = await db.QuestionManager
      .findOne({
        where: {
          QuestionId: questionid
        },
        attributes: { exclude: [ 'CreatedBy','CreatedOn','UpdatedBy','UpdatedOn'] }
      })
    console.log('details', userExist)

    const userData = (!_.isEmpty(userExist)) ? { questionId: userExist.questionid, questionDescription: userExist.QuestionDescription,MappingId:userExist.MappingId,MappingType:userExist.MappingType,Marks:userExist.Marks } : {}
    return userData
  }

  async isEmptyObject(obj) {
    return !Object.keys(obj).length;
  }

  
}

const Questiondata = async (req, res) => {
  try {
    console.log(`headers`, req.headers)
    const authToken = req.headers.authtoken
    
    const verifyOptions = {
      expiresIn: '1h',
      algorithm: ['RS256']
    }

    const RoleCls = new Question()

    // public key to generate jwt authToken
    const publicKey = fs.readFileSync(`${__basedir}/config/keys/public.key`, `utf8`)

    const legit = jwt.verify(authToken, publicKey, verifyOptions)

    console.log('log',legit)
    // console.log(`legit ${JSON.stringify(legit)}`)

    const passedUserId = (req.body && req.body.userId) ? req.body.userId : (req.headers.userid) ? req.headers.userid : ''
    
    console.log('userid',passedUserId)

    console.log('userid',legit.userId)
    if (legit.userId == passedUserId) {

    const QuestionId= req.body.questionid
    
    

    const questiondata= await RoleCls.getQuestionData(QuestionId)

    // if(!Roledata)
    // {
     // const userUpdate = await RoleCls.addQuestionInDB(QuestionDescription, QuestionType,MappingId,MappingType,Marks,Createdby,CreatedOn,UpdatedBy,UpdatedOn)
      res.status(200).send(apiResponse.successFormat(`success`, `successful data`, questiondata, []))
   // }
    // else
    // {
    //   res.status(200).send(apiResponse.successFormat(`fail`, `data already exist`, QuestionDescription, []))
    // }
      
    } else {
      res.status(400).send(apiResponse.successFormat(`failure`, `InVaild AuthToken`, {}, []))
    }
  } catch (error) {
    console.log(`error ${JSON.stringify(error)}`)
    res.status(401).send(error)
  }
}

module.exports = { Questiondata }
