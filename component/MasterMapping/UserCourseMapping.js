const bcrypt = require(`bcryptjs`)
const jwt = require(`jsonwebtoken`)
const fs = require(`fs`)
const _ = require(`lodash`)
// const path = require(`path`)

const db = require('../../config/db/dbConn')
const UserCourseModel = db.UserCourseModel;
const apiResponse = require(`../../helper/formatResponse`)
const errorCode = require(`../../config/errorCode/errorCode`)
const genericErrorRes = require(`../../utils/errorResponse`).errorResponse

class UserOrgMapping {
  userCourseMapping ( userId,courseId, CreatedBy,CreatedOn,UpdatedBy,UpdatedOn,status,completedModules,totalModules) {
    return new Promise(async (resolve, reject) => {
      db.sequelize.query(`CALL Sp_user_course_mapping(:userId,:courseId, :CreatedBy, :CreatedOn, :UpdatedBy,:UpdatedOn, :status, :completedModules, :totalModules, :assignedOn,:completedOn)`,
        {
          replacements: {
            userId:userId,
            courseId:courseId,
            CreatedBy: CreatedBy,
            CreatedOn:CreatedOn,
            UpdatedBy:UpdatedBy,
            UpdatedOn:UpdatedOn,
            status:status,
            completedModules:completedModules,
            totalModules:totalModules,
            assignedOn:new Date,
            completedOn:new Date
          }//,
          //type: db.Sequelize.QueryTypes.SELECT
        })
        .then(response => {
          console.log('response', response)
        resolve(response)
        })
    })
  }

  async getUserData(userid) {
    const statusvalue = 1
    const userExist = await db.users
      .findOne({
        where: {
          userid: userid,
          status: statusvalue
        },
        attributes: {
          exclude: ['email_id', 'mobile_no', 'created_by', 'created_on', 'updated_by', 'ba_details_verification', 'action_by', 'action_on', 'updated_on']
        }
      })

    const userData = (!_.isEmpty(userExist)) ? {
      userId: userExist.user_id,
      password: userExist.password,
      status: userExist.status,
      baId: userExist.ba_id
    } : {}
    return userData
  }
}

const UserCourseMappingdata = async (req, res) => {
  try {

    const authToken = req.headers.authtoken
    const verifyOptions = {
      expiresIn: '1h',
      algorithm: ['RS256']
    }

    const UserOrgCls = new UserOrgMapping()

    // public key to generate jwt authToken
    const publicKey = fs.readFileSync(`${__basedir}/config/keys/public.key`, `utf8`)
    const legit = jwt.verify(authToken, publicKey, verifyOptions)
    
    console.log()
    const passedUserId = (req.body && req.body.userId) ? req.body.userId : (req.headers.userid) ? req.headers.userid : ''
    if (legit.userId) {
      console.log('inside',passedUserId)
      const UserId = req.body.userId
      const CourseId = req.body.courseId
      const createdBy = legit.userId
      var d = new Date()
      const createdOn = d
      const updatedBy = passedUserId
      const updatedOn = d
      const status = "Assigned";
      const completedModules = 0;
      const totalModules = 0;
      console.log('create user course mapping record');
      const userUpdate = await UserOrgCls.userCourseMapping(UserId, CourseId, createdBy, createdOn, updatedBy, updatedOn,status, completedModules,totalModules)


      res.status(200).send(apiResponse.successFormat(`success`, `insert successful`, userUpdate, []))

    } else {
      res.status(400).send(apiResponse.successFormat(`invalid`, `InVaild AuthToken`, {}, []))
    }
  } catch (error) {
    console.log(`error ${JSON.stringify(error)}`)
    res.status(401).send(error)
  }
}

const selectUserCourseMapping = async (req, res) => {
  try {

    const authToken = req.headers.authtoken
    const verifyOptions = {
      expiresIn: '1h',
      algorithm: ['RS256']
    }

    const UserOrgCls = new UserOrgMapping()

    // public key to generate jwt authToken
    const publicKey = fs.readFileSync(`${__basedir}/config/keys/public.key`, `utf8`)
    const legit = jwt.verify(authToken, publicKey, verifyOptions)

    const passedUserId = (req.body && req.body.userId) ? req.body.userId : (req.headers.userid) ? req.headers.userid : ''

    if (legit.userId) {
      const UserId = req.body.userId
      const CourseId = req.body.courseId
      const createdBy = legit.userId
      var d = new Date()
      const createdOn = d
      const updatedBy = passedUserId
      const updatedOn = d;
      const status = "Assigned";
      const completedModules = 0;
      const totalModules = 0;
      const assignedOn= null;
      const completedOn =null;
      const userUpdate = await UserOrgCls.UserOrgMappingInDB(userId,courseId, CreatedBy,CreatedOn,UpdatedBy,UpdatedOn,status,completedModules,totalModules,assignedOn,completedOn)
      res.status(200).send(apiResponse.successFormat(`success`, `insert successful`, userUpdate, []))

    } else {
      res.status(400).send(apiResponse.successFormat(`invalid`, `InVaild AuthToken`, {}, []))
    }
  } catch (error) {
    console.log(`error ${JSON.stringify(error)}`)
    res.status(401).send(error)
  }
}

module.exports = {
  UserCourseMappingdata,
  selectUserCourseMapping
}
