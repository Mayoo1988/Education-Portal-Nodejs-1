const fs = require(`fs`)
// const _ = require(`lodash`)
const path = require(`path`)
const mkdirp = require(`mkdirp`)

const db = require(`../../../config/db/dbConn`)
const formatResponse = require(`../../../helper/formatResponse`)
const errorCodeJson = require('../../../config/errorCode/errorCode')
const errorResponse = require('../../../helper/errorResponse').errorResponse

class CourseMaterial {
  async storeInDB (filePath, type, moduleId, courseId) {
    try {
      const updateQuery = (type === `course`) ? { video_link: filePath } : { videoFile: filePath }
      const query = (type === `course`) ? {
        CourseId: +(courseId),
        isActive: 1
      } : {
        CourseId: +(courseId),
        ModuleId: +(moduleId),
        isActive: 1
      }

      if (type === `course`) {
        const update = await db.CourseManager.update(
          updateQuery,
          { where: query }
        )
        // console.log(`update ${JSON.stringify(update)}`) // [1] for success, [0] for error (handle case)
      } else {
        await db.Module.update(
          updateQuery,
          { where: query }
        )
      }
      return true
    } catch (error) {
      return Promise.reject(error)
    }
  }

  storeFile (filePath, bufferFile) {
    return new Promise((resolve, reject) => {
      try {
        fs.writeFile(`${filePath}`, bufferFile, { encoding: 'base64' }, (err) => {
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

  createDirectory (folderPath) {
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
}

const apiFn = async (req, res) => {
  try {
    //const { type, courseId, moduleId } = req.body
    const courseId =req.body.courseId;
    const moduleId =req.body.moduleId;
    const type =req.body.type;
    const file = req.file
   // console.log('req',req.body)
   // console.log('Course',courseId)
    console.log('upload file',file)
    //console.log('id',req.file.courseid)
    console.log('id1',req.body.courseId)
    console.log('id2',req.body.moduleId)
    //console.log('id2',req.files)
    //console.log('id3',req.files.courseid)
    const courseMaterialCls = new CourseMaterial()

    const ext = path.extname(file.originalname).toLowerCase()

    // if (!(/(pdf|rtf|doc?x|odt|txt)$/i.test(ext))) {
    //   throw (apiResponse.errorFormat(`fail`, errorCodeJson.err_015, {}, [{
    //     code: `err_015`,
    //     message: errorCodeJson.err_015
    //   }], 400))
    // }

    // calculate the size of file
    const fileSizeInBytes = file.size
    const fileSizeInKB = Number(fileSizeInBytes / 1000).toFixed(2)
    const fileSizeInMB = Number(fileSizeInKB / 1000).toFixed(2)
    // throw error if file size is greater than 15MB
    // if (fileSizeInMB > 20) {
    //   throw (formatResponse.errorFormat(`fail`, errorCodeJson.err_020, {}, [{
    //     code: `err_020`,
    //     message: errorCodeJson.err_020
    //   }], 400))
    // }

    const bufferFile = file.buffer

    const fileName = (type === `course`) ? `course_video${ext}` : `module_video${moduleId}${ext}`
    const folderPath = (type === `course`) ? `${__basedir}/public/uploads/courseMaterial/video/${courseId}` : `${__basedir}/public/uploads/courseMaterial/video/${courseId}/${moduleId}`
    const filePath = `${folderPath}/${fileName}`

    // create Directory if not exist for RFP
    await courseMaterialCls.createDirectory(folderPath)

    // store file on server
    await courseMaterialCls.storeFile(filePath, bufferFile)

    const resFilePath = (type === `course`) ? `courseMaterial/video/${courseId}` : `courseMaterial/video/${courseId}/${moduleId}`

    // add in db
    await courseMaterialCls.storeInDB(`${process.env.URL_METHOD}://${process.env.URL}/${resFilePath}/${fileName}`, type, moduleId, courseId)

    const result = {
      filePath: `${process.env.URL_METHOD}://${process.env.URL}/${resFilePath}/${fileName}`
    }

    res.status(200).send(formatResponse.successFormat(`success`, `Course Video uploaded successfully`, result, []))
  } catch (error) {
    console.log(`error ${error}`)
    const code = (Object.prototype.hasOwnProperty.call(error, 'status')) ? error.code : 500
    const response = errorResponse(error)
    res.status(code).send(response)
  }
}

module.exports = { apiFn }
