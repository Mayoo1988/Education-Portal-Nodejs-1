const bcrypt = require(`bcryptjs`)
const jwt = require(`jsonwebtoken`)
const fs = require(`fs`)
const _ = require(`lodash`)
const path = require(`path`)
const mkdirp = require(`mkdirp`)

// const path = require(`path`)

const db = require('../../config/db/dbConn')
const apiResponse = require(`../../helper/formatResponse`)
const errorCode = require(`../../config/errorCode/errorCode`)
const { Console } = require('console')
const genericErrorRes = require(`../../utils/errorResponse`).errorResponse

class Course {

    async storeInDB(filePath, type, courseId) {
      
      try {
        const updateQuery = (type === `course`) ? {
          CoursePosterImage: filePath
        } : {
          ImageFile: filePath
        }
        const query = (type === `course`) ? {
          CourseId: +(courseId)
        } : {
          CourseId: +(courseId)
        }
        
        console.log('query',query)
        if (type === `course`) {
          const update = await db.CourseManager.update(
            updateQuery, {
              where: query
            }
          )
          console.log(`update ${JSON.stringify(update)}`) // [1] for success, [0] for error (handle case)
        } else {
          await db.Module.update(
            updateQuery, {
              where: query
            }
          )
        }
        return true
      } catch (error) {
        return Promise.reject(error)
      }
    }
  
  
    storeFile(filePath, bufferFile) {
      return new Promise((resolve, reject) => {
        try {
          fs.writeFile(`${filePath}`, bufferFile, {
            encoding: 'base64'
          }, (err) => {
            if (err) {
              return reject(err)
            }
  
            resolve()
          })
        } catch (error) {
          reject(error)
        }
      })
    }
  
    createDirectory(folderPath) {
      return new Promise((resolve, reject) => {
        try {
          mkdirp(folderPath, (err) => {
            if (err) {
              return reject(err)
            }
  
            resolve()
          })
        } catch (error) {
          console.log(`create directory error ${error}`)
          reject(error)
        }
      })
    }
  
  
    addCourseInDB(CourseName, CourseCode, CourseDescription, createdBy, createdon, updatedby, updatedon, categoryId, _userId) {
        console.log('Addcourse',_userId)
      return new Promise((resolve, reject) => {
        db.sequelize.query(`CALL sp_insert_course(:CourseName, :CourseCode,:CoursePosterImage, :CourseDescription, :createdBy, :createdOn,
            :updatedBy, :updatedOn,:categoryId,:userId)`, {
            replacements: {
              CourseName: CourseName,
              CourseCode: CourseCode,
              CoursePosterImage:null,
              CourseDescription: CourseDescription,
              createdBy: createdBy,
              createdOn: createdon,
              updatedBy: updatedby,
              updatedOn: updatedon,
              categoryId: categoryId,
              userId: _userId
             
            }
          })
          .then(response => {
            console.log('response', response)
            resolve(response)
          })
      })
  
    }
  
    async isEmptyObject(obj) {
      return !Object.keys(obj).length;
    }
  
    async getCourseData(CourseName) {
      const statusvalue = 1
      const userExist = await db.CourseManager
        .findOne({
          where: {
            CourseName: CourseName
          },
          attributes: {
            exclude: ['CourseCode', 'CoursePosterImage', 'CourseDescription', 'CourseReferenceLink', 'Createdby', 'CreatedOn',
              'UpdatedBy', 'UpdatedOn']
          }
        })
  
  
      const userData = (!_.isEmpty(userExist)) ? {
        CourseName: userExist.CourseName
      } : {}
      return userData;
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
            exclude: ['email_id', 'mobile_no', 'created_by', 'created_on', 'updated_by', 'ba_details_verification', 'action_by',
              'action_on', 'updated_on']
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
  

const Coursedata = async (req, res) => {
  console.log('token req',req)
    const authToken = req.headers.authtoken
   
    const verifyOptions = {
        expiresIn: '1h',
        algorithm: ['RS256']
      }
      const file = req.file
     // console.log('file',file)
      const OrgCls = new Course();
    var ext;
if(file)
{
        ext = path.extname(file.originalname).toLowerCase()
        console.log('extname',ext)

    if (!(/(pdf|jpg|jpeg|png)$/i.test(ext))) {
      throw (formatResponse.errorFormat(`fail`, errorCodeJson.ERR_005, {}, [{
        code: `ERR_005`,
        message: errorCodeJson.ERR_005
      }], 400))
    }

    // calculate the size of file
    const fileSizeInBytes = file.size
    const fileSizeInKB = Number(fileSizeInBytes / 1000).toFixed(2)
    const fileSizeInMB = Number(fileSizeInKB / 1000).toFixed(2)
    // throw error if file size is greater than 15MB
    if (fileSizeInMB > 15) {
      throw (formatResponse.errorFormat(`fail`, errorCodeJson.ERR_006, {}, [{
        code: `ERR_006`,
        message: errorCodeJson.ERR_006
      }], 400))
    }

}

const publicKey = fs.readFileSync(`${__basedir}/config/keys/public.key`, `utf8`)
const legit = await jwt.verify(authToken, publicKey, verifyOptions)

console.log('legit',legit)
const passedUserId = (req.body && req.body.userId) ? req.body.userId : (req.headers.userid) ? req.headers.userid : ''
console.log('passedid',passedUserId)

 if (legit.userId == passedUserId) {
    console.log('Inside User');

    const CourseName = req.body.courseName

    const CourseCode = req.body.courseCode
    console.log('description',req.body.courseDescription)
    // const CoursePosterImage = req.body.coursePosterImage
    const CourseDescription = req.body.courseDescription
    const categoryId = req.body.categoryId
    const _userId = req.headers.userid
    console.log('userid',_userId)
    var d = new Date()
    const createdBy = passedUserId
    const createdon = d
    const updatedby = passedUserId
    const updatedon = d
    const userUpdate = await OrgCls.addCourseInDB(CourseName, CourseCode, CourseDescription, createdBy, createdon,
        updatedby, updatedon, categoryId, _userId)
    console.log('userUpdatedata',userUpdate)
    let courseId = userUpdate[0].courseId;
    console.log('courseIddata',courseId)
    var fileName;
    if(file)
    {
      const bufferFile = file.buffer
      const folderPath = `${__basedir}/public/uploads/courseMaterial/image/${courseId}`
      fileName = `course_poster${ext}`
      const filePath = `${folderPath}/${fileName}`
      console.log('filename',fileName,filePath)
      // create Directory if not exist for RFP
      await OrgCls.createDirectory(folderPath)

      // store file on server
      await OrgCls.storeFile(filePath, bufferFile)
    }
      const resFilePath = `courseMaterial/image/${courseId}`
      const publicFilePath = `${process.env.URL_METHOD}://${process.env.URL}/${resFilePath}/${fileName}`

      // add in db
      await OrgCls.storeInDB(publicFilePath, 'course', courseId)
      res.status(200).send(apiResponse.successFormat(`success`, `insert successful`, userUpdate, []))
}
 else{
     res.status(400).send(apiResponse.successFormat(`failure`, `Failure on insert`, {}, []))
}  


}

module.exports = { Coursedata }