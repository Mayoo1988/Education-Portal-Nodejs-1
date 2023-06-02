const fs = require(`fs`)
const path = require(`path`)

const formatResponse = require(`../../../helper/formatResponse`)
const errorCodeJson = require('../../../config/errorCode/errorCode')

const apiFn = async (req, res) => {
  try {
    const data= req.body;
    console.log('data',data)
    // const courseId =req.body.courseId;
    // const moduleId =req.body.moduleId;
    const folderPath = `${__basedir}/public/uploads/courseMaterial/video/${courseId}/${moduleId}`
    let fileName = ``
    const fsFile = fs.promises
   console.log('folderpath',folderPath)
    const files = await fsFile.readdir(folderPath)
    console.log('files',files)
    for (const file of files) {
      console.log('filedata',file)
      const ext = path.extname(file).toLowerCase()
      if (ext === `.mp4` || ext === `.3gp` || ext === `.avi` || ext === `.ogg`) {
        fileName = file
      }
    }

    if (!fileName) {
      throw (formatResponse.errorFormat(`fail`, errorCodeJson.ERR_004, {}, [{
        code: `ERR_004`,
        message: errorCodeJson.ERR_004
      }], 400))
    }

    const result = {}
    result.filePath = `${process.env.URL_METHOD}://${process.env.URL}/${fileName}`
    console.log('filepath',filePath)
    res.status(200).send(formatResponse.successFormat(`success`, `Material Image succesfully fetched`, result, []))
  } catch (error) {
    const code = (Object.prototype.hasOwnProperty.call(error, 'status')) ? error.code : 500
    // const response = errorResponse(error)
    res.status(code).send(formatResponse.successFormat(`fail`, `Something went wrong`, {}, []))
  }
}

module.exports = { apiFn }
