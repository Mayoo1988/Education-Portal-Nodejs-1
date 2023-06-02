const fs = require(`fs`)
const path = require(`path`)

const formatResponse = require(`../../../helper/formatResponse`)
const errorCodeJson = require('../../../config/errorCode/errorCode')

const apiFn = async (req, res) => {
  try {
    const folderPath = `${__basedir}/public/uploads`
    let fileName = ``
    const fsFile = fs.promises

    const files = await fsFile.readdir(folderPath)

    for (const file of files) {
      const ext = path.extname(file).toLowerCase()
      if (ext === `.jpeg` || ext === `.jpg` || ext === `.png` || ext === `.pdf`) {
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
    res.status(200).send(formatResponse.successFormat(`success`, `Material Image succesfully fetched`, result, []))
  } catch (error) {
    const code = (Object.prototype.hasOwnProperty.call(error, 'status')) ? error.code : 500
    // const response = errorResponse(error)
    res.status(code).send(formatResponse.successFormat(`fail`, `Something went wrong`, {}, []))
  }
}

module.exports = { apiFn }
