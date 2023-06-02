const bcrypt = require(`bcryptjs`)
const jwt = require(`jsonwebtoken`)
const fs = require(`fs`)
const _ = require(`lodash`)
const path = require(`path`)
const mkdirp = require(`mkdirp`)

const db = require('../../config/db/dbConn')
const apiResponse = require(`../../helper/formatResponse`)
const errorCode = require(`../../config/errorCode/errorCode`)
const genericErrorRes = require(`../../utils/errorResponse`).errorResponse

class User {


  async storeInDB(filePath, type, courseId) {
    try {
      const updateQuery = (type === `course`) ? {
        CoursePosterImage: filePath
      } : {
        ImageFile: filePath
      }
      const query = (type === `course`) ? {
        CourseId: +(courseId),
        isActive: 1
      } : {
        CourseId: +(courseId),
        isActive: 1
      }

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


  UpdateUserInDB(courseid, CourseName, CourseCode,CoursePosterImage, CourseDescription,CreatedBy,CreatedOn, UpdatedBy, UpdatedOn, categoryId) {

    //console.log('Data', courseid, CourseName, CourseCode, CourseDescription, UpdatedBy, UpdatedOn, isActive)

    return new Promise((resolve, reject) => {
      db.sequelize.query(`CALL Sp_update_course(:_courseId, :CourseName, :CourseCode,:CoursePosterImage, :CourseDescription,:CreatedBy,:CreatedOn,:UpdatedBy, :UpdatedOn, :categoryId)`, {
          replacements: {
            _courseId: courseid,
            CourseName: CourseName,
            CourseCode: CourseCode,
            CoursePosterImage:null,
            CourseDescription: CourseDescription,
            CreatedBy:CreatedBy,
            CreatedOn:CreatedOn,
            UpdatedBy: UpdatedBy,
            UpdatedOn: UpdatedOn,
            categoryId: categoryId
          } //,
          //type: db.Sequelize.QueryTypes.SELECT
        })
        .then(response => {
          console.log('response', response)
          // console.log(`sp response ${JSON.stringify(response)}`)
          // if (response[0]['0'].message === `success`) {
          //   const baDetails = response[1]['0']
          //   const serviceId = _.map(response[2], value => value.serviceId)
          //   baDetails['services'] = serviceId
          resolve(response)
          // }
          //else {
          //const errorObj = {
          //code: `err_001`,
          //message: errorCode.err_001
          //}
          //reject(apiResponse.errorFormat(`fail`, `Something went wrong`, {}, [errorObj], 400))
          //}
        })
        .catch((error) => {
          console.log('error', error)
          // console.log(`sp error ${JSON.stringify(error)}`)
          const errorObj = {
            code: `err_001`,
            message: errorCode.err_001
          }
          reject(apiResponse.errorFormat(`fail`, `Something went wrong`, {}, [errorObj], 400))
        })
    })

  }



  async isEmptyObject(obj) {
    return !Object.keys(obj).length;
  }

  async encryptPassword(password) {

    const saltRounds = 15

    return bcrypt.hash(password,
      saltRounds)

  }
}

const courseupdate = async (req, res) => {
  try {
    const authToken = req.headers.authtoken

    const verifyOptions = {
      expiresIn: '1h',
      algorithm: ['RS256']
    }

    const file = req.file;
    const UserCls = new User()


    // public key to generate jwt authToken
    const publicKey = fs.readFileSync(`${__basedir}/config/keys/public.key`, `utf8`)

    const legit = jwt.verify(authToken, publicKey, verifyOptions)
    const passedUserId = (req.body && req.body.userId) ? req.body.userId : (req.headers.userid) ? req.headers.userid : ''

    // const userDatavalue= await verifydata.getUserData(passedUserId)
    // const data= await  verifydata.isEmptyObject(userDatavalue)
    // console.log(`passedUserId ${passedUserId}`)
     console.log('Check', legit.userId, passedUserId);

    if (legit.userId == passedUserId) {


      console.log('req.body', req.body);
      const courseid = req.body.courseId
      const CourseName = req.body.courseName
      const CourseCode = req.body.courseCode
      const CourseDescription = req.body.courseDescription
      const Createdby = passedUserId
      var d = new Date()
      const CreatedOn = d
      const UpdatedBy = legit.userId
      const UpdatedOn = d
      

      if (file) {
        const ext = path.extname(file.originalname).toLowerCase()

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
        const bufferFile = file.buffer
        const folderPath = `${__basedir}/public/uploads/courseMaterial/image/${courseid}`
        const fileName = `course_poster${ext}`
        const filePath = `${folderPath}/${fileName}`

        // create Directory if not exist for RFP
        await UserCls.createDirectory(folderPath)

        // store file on server
        await UserCls.storeFile(filePath, bufferFile)

        const resFilePath = `courseMaterial/image/${courseid}`
        const publicFilePath = `${process.env.URL_METHOD}://${process.env.URL}/${resFilePath}/${fileName}`
        // const publicFilePath = folderPath + '/' + fileName;
        console.log('resFilePath', resFilePath, publicFilePath)

        // add in db
        await UserCls.storeInDB(publicFilePath, 'course', courseid)
      }

      const userUpdate = await UserCls.UpdateUserInDB(courseid, CourseName, CourseCode,null, CourseDescription,Createdby,CreatedOn, UpdatedBy, UpdatedOn,2)
      res.status(200).send(apiResponse.successFormat(`success`, `update successful`, userUpdate, []))

    } else {
      res.status(400).send(apiResponse.successFormat(`failure`, `InVaild AuthToken`, {}, []))
    }

  } catch (error) {
    console.log(`error`, error)
    res.status(401).send(error)
  }
}
module.exports = {
  courseupdate
}
