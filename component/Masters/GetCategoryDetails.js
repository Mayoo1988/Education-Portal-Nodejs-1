const bcrypt = require(`bcryptjs`)
const jwt = require(`jsonwebtoken`)
const fs = require(`fs`)
const _ = require(`lodash`)
// const path = require(`path`)

const db = require('../../config/db/dbConn')
const apiResponse = require(`../../helper/formatResponse`)
const errorCode = require(`../../config/errorCode/errorCode`)
const genericErrorRes = require(`../../utils/errorResponse`).errorResponse

class category {
  SelectCategoryfromDB ( ) {
    return new Promise(async (resolve, reject) => {
      try {
        db.sequelize.query(`CALL Sp_SelectCategory()`, {
          replacements: {}
        }).then(response => {
            resolve(response)
        }).catch(() => {
          const errorObj = {
            code: `err_001`,
            message: errorCode.err_001
          }
          reject(apiResponse.errorFormat(`fail`, `Something went wrong`, {}, [errorObj], 400))
        });
      } catch (error) {
        console.log('error', error)
        let Eresponse = genericErrorRes(error)
        reject(Eresponse)
      }
    })
  }
}

const categorydata = async (req, res) => {
  try {
    const authToken = req.headers.authtoken
   console.log('Hello');
    const verifyOptions = {
      expiresIn: '1h',
      algorithm: ['RS256']
    }

    const CategoryCls = new category()

    // public key to generate jwt authToken
    const publicKey = fs.readFileSync(`${__basedir}/config/keys/public.key`, `utf8`)
    const legit = jwt.verify(authToken, publicKey, verifyOptions)
    const passedUserId = (req.body && req.body.userId) ? req.body.userId : (req.headers.userid) ? req.headers.userid : ''

    if (legit.userId == passedUserId) {
      const userUpdate = await CategoryCls.SelectCategoryfromDB()
      res.status(200).send(apiResponse.successFormat(`success`, `select successful`, userUpdate, []))
    } else {
      res.status(400).send(apiResponse.successFormat(`Invalid`, `InVaild AuthToken`, {}, []))
    }
  } catch (error) {
    res.status(401).send(error)
  }
}
module.exports = { categorydata }
