const bcrypt = require(`bcryptjs`)
const jwt = require(`jsonwebtoken`)
const fs = require(`fs`)
const _ = require(`lodash`)
// const path = require(`path`)

const db = require('../../config/db/dbConn')
const apiResponse = require(`../../helper/formatResponse`)
const errorCode = require(`../../config/errorCode/errorCode`)
const genericErrorRes = require(`../../utils/errorResponse`).errorResponse

class Content {
  addCourseInDB (CourseName, CourseCode,CoursePosterImage,CourseDescription,CourseReferenceLink,Createdby,CreatedOn,UpdatedBy,UpdatedOn) {
    return new Promise(async (resolve, reject) => {
      try {
        await db.CourseManager.create({
          ModuleId: ModuleId,
          CourseId: CourseId,
          ContentTypeId: ContentTypeId,
          ContentPath:ContentPath,
          CourseDescription:CourseDescription,
          CourseReferenceLink:CourseReferenceLink,
          CreatedBy:Createdby,
          CreatedOn:CreatedOn,
          UpdatedBy:UpdatedBy,
          UpdatedOn:UpdatedOn
        })
        resolve()
      } catch (error) {
        console.log('error', error)
        let Eresponse = genericErrorRes(error)
        reject(Eresponse)
      }
    })
  }

  async isEmptyObject(obj) {
    return !Object.keys(obj).length;
  }

  async getCourseData (CourseName) {
    const statusvalue = 1
    const userExist = await db.CourseManager
      .findOne({
        where: {
          CourseName: CourseName
        },
        attributes: { exclude: [ 'CourseCode','CoursePosterImage','CourseDescription','CourseReferenceLink','Createdby','CreatedOn','UpdatedBy','UpdatedOn'] }
      })
  
    const userData = (!_.isEmpty(userExist)) ? { CourseName: userExist.CourseName} : {}
    return userData;
  }

  async getUserData (userid) {
    const statusvalue = 1
    const userExist = await db.users
      .findOne({
        where: {
          userid: userid,
          status: statusvalue
        },
        attributes: { exclude: ['email_id', 'mobile_no', 'created_by', 'created_on', 'updated_by', 'ba_details_verification', 'action_by', 'action_on', 'updated_on'] }
      })
    console.log('details', userExist)

    const userData = (!_.isEmpty(userExist)) ? { userId: userExist.user_id, password: userExist.password, status: userExist.status, baId: userExist.ba_id } : {}
    return userData
  }

}

const Coursedata = async (req, res) => {
  try {

    console.log(`headers`, req.headers)
    const authToken = req.headers.authtoken
    
    const verifyOptions = {
      expiresIn: '1h',
      algorithm: ['RS256']
    }

    const OrgCls = new Course()

    console.log('hi')
    // public key to generate jwt authToken
    const publicKey = fs.readFileSync(`${__basedir}/config/keys/public.key`, `utf8`)

    const legit = await jwt.verify(authToken, publicKey, verifyOptions)

    console.log('log',legit)
    // console.log(`legit ${JSON.stringify(legit)}`)

    const passedUserId = (req.body && req.body.userId) ? req.body.userId : (req.headers.userid) ? req.headers.userid : ''
    
    console.log('userid',passedUserId)

    // const userDatavalue= await verifydata.getUserData(passedUserId)
    // const data= await  verifydata.isEmptyObject(userDatavalue)
    // console.log(`passedUserId ${passedUserId}`)
  //  console.log(passedUserId)
    console.log('userid',legit.userId)
    if (legit.userId == passedUserId) {
    
    const CourseName= req.body.CourseName
    const CourseCode = req.body.CourseCode
    const CoursePosterImage = req.body.CoursePosterImage
    const CourseDescription = req.body.CourseDescription
    const CourseReferenceLink= req.body.CourseReferenceLink
   // const currentdate = new Date(jdate)
    var d = new Date()
    //console.log('date',joiningdate)
    const createdby = req.body.createdby
    const createdon = d
    const updatedby = req.body.updatedby
    const updatedon = d
    
    
    
    //const Roledata= await OrgCls.getCourseData(CourseName)

    //console.log('datalog',Roledata)

    //const data= await OrgCls.isEmptyObject(Roledata)    
    const userUpdate = await OrgCls.addCourseInDB(CourseName, CourseCode,CoursePosterImage,CourseDescription, CourseReferenceLink,createdby, createdon,updatedby,updatedon)
    res.status(200).send(apiResponse.successFormat(`success`, `insert successful`, userUpdate, [])) 
    } else {
      res.status(400).send(apiResponse.successFormat(`failure`, `InVaild AuthToken`, {}, []))
    }
  } catch (error) {
    console.log(`error `,error)
    res.status(401).send(error)
  }
}

module.exports = { Coursedata }
