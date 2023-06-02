const bcrypt = require(`bcryptjs`)
const jwt = require(`jsonwebtoken`)
const fs = require(`fs`)
const _ = require(`lodash`)
// const path = require(`path`)

const db = require('../../config/db/dbConn')
const apiResponse = require(`../../helper/formatResponse`)
const errorCode = require(`../../config/errorCode/errorCode`)
const genericErrorRes = require(`../../utils/errorResponse`).errorResponse

class Login {
  generateAccessToken(password, hash, userId) {

    return new Promise((resolve, reject) => {

      // bcrypt compare generated hash and password
      bcrypt.compare(password, hash)
        .then(function(result) {
          // console.log('result', result)
          if (!result) {
            // function broke, throw error
            const errorResponse = {
              code: `ERR_002`,
              message: errorCode.ERR_002
            }
            reject(apiResponse.errorFormat(`fail`, errorCode.ERR_002, {}, [errorResponse], 401))
          } else {
            // jwt payload
            const payload = {
              userId
            }
            // private key to generate jwt authToken
            const privateKey = fs.readFileSync(`${__basedir}/config/keys/private.key`, `utf8`)
            // signature options
            const signOptions = {
              expiresIn: '1h',
              algorithm: 'RS256'
            }
            // create a token
            var authToken = jwt.sign(payload, privateKey, signOptions)
            console.log('auth', authToken)
            resolve({
              authToken,
              userId
            })
          }
        })
        .catch(function() {
          // function broke, throw error
          const errorResponse = {
            code: `ERR_001`,
            message: errorCode.ERR_001
          }
          reject(apiResponse.errorFormat(`fail`, errorCode.ERR_001, {}, [errorResponse], 500))
        })
    })
  }

  encryptPassword(password) {

    return bcrypt.hash(password,
      saltRounds)

  }

  async getLoginData(userid) {
    return new Promise((resolve, reject) => {
      db.sequelize.query(`CALL SP_Userdata( :_USERID)`, {
          replacements: {
            _USERID: userid
          },
          type: db.Sequelize.QueryTypes.SELECT
        })
        .then(response => {
          // console.log('response', response)
          // console.log(`sp response ${JSON.stringify(response)}`)
          // console.log('hi')
          // console.log(response[0]['0'])
          const Details = response[0]['0']
          let responseObj = {}
          _.forOwn(response[0]['0'], (value, key) => {
            responseObj[key] = value
          })
          resolve({
            responseObj
          })
        }).catch(() => {
          const errorObj = {
            code: `err_001`,
            message: errorCode.err_001
          }
          reject(apiResponse.errorFormat(`fail`, errorCode.ERR_001, {}, [errorObj], 500))
        })
    })
  }

  async getUserData(username) {
    const userExist = await db.users
      .findOne({
        where: {
          email_Id: username
        },
        attributes: {
          exclude: ['mobileNo', 'photoPath', 'isActive', 'joiningDate', 'createdBy', 'createdOn', 'updatedBy', 'updatedOn']
        }
      })
    const userData = (!_.isEmpty(userExist)) ? {
      userId: userExist.userId,
      password: userExist.password,
      firstName: userExist.firstName,
      lastName: userExist.lastName,
      email_Id: userExist.email_Id,
      roleId: userExist.roleId,
      orgId:userExist.orgId
    } : {}
    return userData
  }

  async getMobileData(mobileno) {
    return new Promise(async (resolve, reject) => {
      try {
        let sessionToken = await db.users.findOne({
          where: {
            mobile_no: mobileno
          },
          attributes: {
            exclude: ['email_id', 'mobile_no', 'created_by', 'created_on', 'updated_by', 'ba_details_verification', 'action_by', 'action_on', 'updated_on']
          }
        })
        resolve(sessionToken)
      } catch (error) {
        let Eresponse = genericErrorRes(error)
        reject(Eresponse)
      }
    })
  }

  async addTokenInDB(userId, token) {
    // register user
    let user = await db.users.update({
      auth_token: token
    }, {
      where: {
        user_id: userId
      }
    })
    let dataObj = {
      authToken: token,
      userId: userId
    }
    return (dataObj)
  }
}

const login = async (req, res) => {
  const username = req.body.userName
  const password = req.body.password

  const deviceType = req.body.deviceType



  const loginCls = new Login()

  try {
    var userData;

    if (deviceType === 'mobile') {
      userData = await loginCls.getMobileData(username)
    } else if (deviceType === 'web') {
      userData = await loginCls.getUserData(username)
      // check if user exist and get the userId
    }

    if (!_.isEmpty(userData)) {
      // get the token generated
      const responseData = await loginCls.generateAccessToken(password, userData.password, userData.userId)
      let userId = responseData.userId
      let authToken = responseData.authToken
      // Add token in the database

      let resObj = {
        token: responseData,
        userdata: userData
      }
      // send success response
      res.status(200).send(apiResponse.successFormat(`success`, `login successful`, resObj, []))
    } else if (!_.isEmpty(userData)) {
      // throw error if no account inactive
      const errorResponse = {
        code: `ERR_003`,
        message: errorCode.ERR_003
      }
      throw (apiResponse.errorFormat(`fail`, errorCode.ERR_003, {}, [errorResponse], 401))
    } else {
      // throw error if no account exists
      const errorResponse = {
        code: `ERR_002`,
        message: errorCode.ERR_002
      }

      throw (apiResponse.errorFormat(`fail`, errorCode.ERR_002, {}, [errorResponse], 401))
    }
  } catch (error) {
    console.log('error', error)
    console.log(`error ${(error)}`)
    let errorResponse = genericErrorRes(error)
    let code = (Object.prototype.hasOwnProperty.call(error, 'status')) ? error.code : 500
    res.status(code).send(errorResponse)
  }
}

module.exports = {
  login
}
