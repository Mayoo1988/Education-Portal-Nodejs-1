const fs = require(`fs`)
const _ = require(`lodash`)
const path = require(`path`)
const mkdirp = require(`mkdirp`)

const db = require(`../../../config/db/dbConn`)
const formatResponse = require(`../../../helper/formatResponse`)
const errorCodeJson = require('../../../config/errorCode/errorCode')
const errorResponse = require('../../../helper/errorResponse').errorResponse

class CourseMaterial {
  async storeInDB (filePath, type, moduleId, courseId) {
    try {
      const updateQuery = (type === `course`) ? { CoursePosterImage: filePath } : { ImageFile: filePath }
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
        console.log(`update ${JSON.stringify(update)}`) // [1] for success, [0] for error (handle case)
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
    console.log('Buffer file',bufferFile);
    return new Promise((resolve, reject) => {
      try {
        fs.writeFile(`${filePath}`, bufferFile, { encoding: 'base64' }, (err) => {
          if (err) {
            console.log('writefile error',err);
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

  async getModuleData (courseId, moduleId) {
    try {
      const moduleData = await db.Module.findOne({
        where: {
          CourseId: courseId,
          ModuleId: moduleId,
          isActive: 1
        },
        include: {
          model: db.CourseManager,
          where: {
            CourseId: courseId,
            isActive: 1
          },
          attributes: { exclude: ['createdBy', 'createdOn', 'updatedBy', 'updatedOn', 'userId'] }
        },
        attributes: { exclude: ['CreatedBy', 'CreatedOn', 'UpdatedBy', 'UpdatedOn', 'isActive'] }
      })
      console.log(`moduleData ${JSON.stringify(moduleData)}`)
      return moduleData
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getCourseData (courseId) {
    try {
      const courseData = await db.CourseManager.findOne({
        where: {
          CourseId: courseId,
          isActive: 1
        },
        attributes: { exclude: ['createdBy', 'createdOn', 'updatedBy', 'updatedOn', 'userId'] }
      })
      console.log(`courseData ${JSON.stringify(courseData)}`)
      return courseData
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

const apiFn = async (req, res) => {
  try {
    console.log('req',req)
    console.log('reqbody',req.files)
    console.log('reqbody',req.files.data)
    console.log('reqbody',req.data)
    const { type, courseId, moduleId } = req.body
    const file = req.file
    let data = {}

    const courseMaterialCls = new CourseMaterial()

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

    // if (type === `course`) {
    //   data = await courseMaterialCls.getCourseData(courseId)
    // } else {
    //   data = await courseMaterialCls.getModuleData(courseId, moduleId)
    // }

    // if (_.isEmpty(data)) {
    //   throw (formatResponse.errorFormat(`fail`, errorCodeJson.ERR_001, {}, [{
    //     code: `ERR_001`,
    //     message: errorCodeJson.ERR_001
    //   }], 400))
    // }

    const bufferFile = file.buffer
    // const folderPath = (type === `course`) ? `${__basedir}/public/uploads/courseMaterial/image/${data.CourseCode}` : `${__basedir}/public/uploads/courseMaterial/image/${data.CourseManager.CourseCode}/${data.ModuleCode}`
    const folderPath = (type === `course`) ? `${__basedir}/public/uploads/courseMaterial/image/${courseId}` : `${__basedir}/public/uploads/courseMaterial/image/${courseId}/${moduleId}`
    const fileName = (type === `course`) ? `course_poster${ext}` : `module_poster${ext}`
    const filePath = `${folderPath}/${fileName}`

    // create Directory if not exist for RFP
    await courseMaterialCls.createDirectory(folderPath)

    // store file on server
    await courseMaterialCls.storeFile(filePath, bufferFile)

    const resFilePath = (type === `course`) ? `courseMaterial/image/${courseId}` : `courseMaterial/image/${courseId}/${moduleId}`
    const publicFilePath = `${process.env.URL_METHOD}://${process.env.URL}/${resFilePath}/${fileName}`

    // add in db
    await courseMaterialCls.storeInDB(`${resFilePath}/${fileName}`, type, moduleId, courseId)

    const result = {
      filePath: publicFilePath
    }

    res.status(200).send(formatResponse.successFormat(`success`, `Course Image uploaded successfully`, result, []))
  } catch (error) {
    console.log(`error ${error}`)
    const code = (Object.prototype.hasOwnProperty.call(error, 'status')) ? error.code : 500
    const response = errorResponse(error)
    res.status(code).send(response)
  }
}

module.exports = { apiFn }
