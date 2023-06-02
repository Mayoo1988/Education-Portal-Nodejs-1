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
  generateAccessToken (password, hash, userId) {
    return new Promise((resolve, reject) => {
      // bcrypt compare generated hash and password
      bcrypt.compare(password, hash)
        .then(function (result) {
          if (!result) {
            // function broke, throw error
            const errorResponse = {
              code: `ERR_002`,
              message: errorCode.ERR_002
            }
            reject(apiResponse.errorFormat(`fail`, errorCode.ERR_002, {}, [errorResponse], 401))
          } else {
            // jwt payload
            const payload = { userId }

            // private key to generate jwt authToken
            const privateKey = fs.readFileSync(`${__basedir}/config/keys/private.key`, `utf8`)

            // signature options
            const signOptions = {
              expiresIn: '1h',
              algorithm: 'RS256'
            }

            // create a token
            var authToken = jwt.sign(payload, privateKey, signOptions)
            resolve({ authToken, userId })
          }
        })
        .catch(function () {
          // function broke, throw error
          const errorResponse = {
            code: `ERR_001`,
            message: errorCode.ERR_001
          }
          reject(apiResponse.errorFormat(`fail`, errorCode.ERR_001, {}, [errorResponse], 500))
        })
    })
  }

  async getUserData (userid) {
    const userExist = await db.users
      .findOne({
        where: {
          user_id: userid
        },
        attributes: { exclude: ['email_id', 'mobile_no', 'created_by', 'created_on', 'updated_by', 'ba_details_verification', 'action_by', 'action_on', 'updated_on'] }
      })
    console.log('details', userExist)

    const userData = (!_.isEmpty(userExist)) ? { userId: userExist.user_id, password: userExist.password, status: userExist.status, baId: userExist.ba_id } : {}
    return userData
  }

  async getSessionData (userid, appid) {
    const userExist = await db.userSession
      .findOne({
        where: {
          user_id: userid,
          status: 'active',
          app_id: appid
        },
        attributes: { exclude: ['email_id', 'mobile_no', 'created_by', 'created_on', 'updated_by', 'ba_details_verification', 'action_by', 'action_on', 'updated_on'] }
      })
    console.log('details', userExist)

    const userData = (!_.isEmpty(userExist)) ? { userId: userExist.user_id, password: userExist.password, status: userExist.status, baId: userExist.ba_id } : {}
    return userData
  }

  async addTokenInDB (userId, token) {
    // register user
    let user = await db.users.update(
      { auth_token: token },
      { where: {
        user_id: userId
      } }
    )
    let dataObj = {
      authToken: token,
      userId: userId
    }
    return (dataObj)
  }

  async UpdateSessionInDB (userId, token, appid) {
    const active = 'active'
    return new Promise(async (resolve, reject) => {
      try {
        const updateQuery = await db.userSession.update(
          { app_token: token },
          { where: {
            user_id: userId,
            status: active,
            app_id: appid
          } })

          const userdatavalue = await db.userSession
      .findOne({
        where: {
          user_id: userId,
          status: 'active',
          app_id: appid
        },
        attributes: { exclude: ['email_id', 'mobile_no', 'created_by', 'created_on', 'updated_by', 'ba_details_verification', 'action_by', 'action_on', 'updated_on'] }
      })

        console.log(`update ${userdatavalue}`)
        resolve(userdatavalue)
      } catch (error) {
        // console.log(`errorrrrrr ${error}`)
        // console.log(`error ${JSON.stringify(error)}`)
        let Eresponse = genericErrorRes(error)
        reject(Eresponse)
      }
    })
  }

  addSessionInDB (datauserId, token, app_id, app_token, status, last_login, last_logout, created_on, updated_onObj) {
    return new Promise(async (resolve, reject) => {
      try {
        let sessionToken = await db.userSession.create({
          user_id: datauserId,
          token: token,
          app_id: app_id,
          app_token: app_token,
          status: status,
          last_login: last_login,
          last_logout: last_logout,
          created_on: created_on
        })
        resolve(sessionToken)
      } catch (error) {
        // console.log(error)
        // console.log(`error ${JSON.stringify(error)}`)
        let Eresponse = genericErrorRes(error)
        reject(Eresponse)
      }
    })
  }

  async userApps (userId) {
    try {
      let newUserApp = await db.userApps.findAll({
        where: {
          user_id: userId
        },
        attributes: { exclude: ['id', 'user_id', 'created_by', 'updated_by', 'created_on', 'updated_on', 'status'] }
      })
      // console.log('newUser', newUserApp)
      return newUserApp
    } catch (error) {
      // console.log(error)
      // console.log(`error ${JSON.stringify(error)}`)
      let Eresponse = genericErrorRes(error)
      return Eresponse
    }
  }

  async userAppsMapping (userId, appId) {
    return new Promise(async (resolve, reject) => {
      try {
        let usermapped = await db.userApps.findOne({
          where: {
            user_id: userId,
            app_id: appId
          },
          attributes: { exclude: ['id', 'user_id', 'created_by', 'updated_by', 'created_on', 'updated_on', 'status'] }
        })
        if (!usermapped) {
          resolve(usermapped)
        } else {
          resolve(usermapped)
        }
      } catch (error) {
        console.log(`errorrrrrr ${error}`)
        // console.log(`error ${JSON.stringify(error)}`)
        let Eresponse = genericErrorRes(error)
        reject(Eresponse)
      }
    })
  }

  async UserSessionData (userid, appid) {
    const userExist = await db.userSession
      .findOne({
        where: {
          user_id: userid,
          app_id: appid
        },
        attributes: { exclude: ['email_id', 'mobile_no', 'created_by', 'created_on', 'updated_by', 'ba_details_verification', 'action_by', 'action_on', 'updated_on'] }
      })
    console.log('details', userExist)

    return userExist
  }
}

const logindata = async (req, res) => {
  const loginCls = new Login()

  try {
    console.log(`headers`, req.headers.userid)
    const authToken = req.headers.authtoken
    const appid = req.headers.appid
    const verifyOptions = {
      expiresIn: '1h',
      algorithm: ['RS256']
    }

    // public key to generate jwt authToken
    const publicKey = fs.readFileSync(`${__basedir}/config/keys/public.key`, `utf8`)

    const legit = jwt.verify(authToken, publicKey, verifyOptions)

    // console.log(`legit ${JSON.stringify(legit)}`)
    const userData = await loginCls.UserSessionData(legit.userId, appid)

    const userAppMapping = await loginCls.userAppsMapping(legit.userId, appid)

    console.log('userAppMapping', userAppMapping)
    // let resObj = {
    //   userApps: userData
    // }
    const passedUserId = req.headers.userid

    console.log(`passedUserId ${legit.userId}`)

    if (legit.userId === passedUserId) {
      const payload = { passedUserId }

      // private key to generate jwt authToken
      const privateKey = fs.readFileSync(`${__basedir}/config/keys/private.key`, `utf8`)

      //private key to generate application jwt authToken
      //const privateKey1 = fs.readFileSync(`${__basedir}/config/keys/private1.key`, `utf8`)

      // signature options
      const signOptions = {
        expiresIn: '1h',
        algorithm: 'RS256'
      }
      // create a token
      var authTokens1 = await jwt.sign(payload, privateKey, signOptions)
      console.log('userappmapp', userAppMapping)
      var d = new Date()
      // console.log(d);
      if (_.isEmpty(userData) && userAppMapping !== null) {
        const tokenUpdate1 = await loginCls.addSessionInDB(passedUserId, authToken, appid, authTokens1, 'Active', d, d, d, d)
        console.log('response', tokenUpdate1)
        res.status(200).send(apiResponse.successFormat(`success`, `login successful`, tokenUpdate1, []))
      } else if (!_.isEmpty(userData) && userAppMapping !== null && userData.status && userData.status === 'inactive') {
        // const tokenUpdate2 = await loginCls.addSessionInDB(passedUserId,authToken,appid,authTokens1,'Active',d,d,d,d)
        const tokenUpdate2 = await loginCls.UpdateSessionInDB(passedUserId, authTokens1, appid)
        res.status(200).send(apiResponse.successFormat(`success`, `login successful`, tokenUpdate2, []))
      } else if (!_.isEmpty(userData) && !_.isEmpty(userAppMapping) && userData.status && userData.status === 'active') {
        // const tokenUpdate2 = await loginCls.addSessionInDB(passedUserId,authToken,appid,authTokens1,'Active',d,d,d,d)
        const tokenUpdate2 = await loginCls.UpdateSessionInDB(passedUserId, authTokens1, appid)
        res.status(200).send(apiResponse.successFormat(`success`, `login successful`, tokenUpdate2, []))
      } else if (userAppMapping === null) {
        let errObj = {
          message: 'you dont have access to this application'
        }
        res.status(200).send(apiResponse.successFormat(`unsuccess`, `login unsuccessful`, '', []))
      }
    }
    else{
      let errObj = {
        message: 'Invalid Userid'
      }
      res.status(200).send(apiResponse.successFormat(`unsuccess`, `Invalid UserID`, errObj, []))
    }
  } catch (error) {
    console.log(`error ${error}`)
    let errorResponse = {}
    if (error.name === 'TokenExpiredError') {
      errorResponse = apiResponse.errorFormat(`fail`, `Token Expired`, {}, [], 401)
    } else if (error.name === 'JsonWebTokenError') {
      errorResponse = apiResponse.errorFormat(`fail`, `Invalid Token`, {}, [], 401)
    } else {
      errorResponse = apiResponse.errorFormat(`fail`, `Authentication Failed`, {}, [], 401)
    }
    errorResponse = _.omit(errorResponse, ['code'])
    res.status(401).send(errorResponse)
  }
}

module.exports = { logindata }
