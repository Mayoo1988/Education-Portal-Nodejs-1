const bcrypt = require(`bcryptjs`)
const jwt = require(`jsonwebtoken`)
const fs = require(`fs`)
const _ = require(`lodash`)
// const path = require(`path`)

const db = require('../../config/db/dbConn')
const apiResponse = require(`../../helper/formatResponse`)
const errorCode = require(`../../config/errorCode/errorCode`)
const genericErrorRes = require(`../../utils/errorResponse`).errorResponse

class VerifyAppToken {
  async getUserData (userid, appid) {
    return new Promise(async (resolve, reject) => {
      try {
        const userExist = await db.userApps
          .findOne({
            where: {
              user_id: userid,
              status: 1,
              app_id: appid
            },
            attributes: { exclude: ['email_id', 'mobile_no', 'created_by', 'created_on', 'updated_by', 'ba_details_verification', 'action_by', 'action_on', 'updated_on'] }
          })
        if (!userExist) {
          resolve(userExist)
        } else {
          resolve(userExist)
        }
        console.log('details', userExist)
      } catch (error) {
        console.log(`errorrrrrr ${error}`)
        // console.log(`error ${JSON.stringify(error)}`)
        let Eresponse = genericErrorRes(error)
        reject(Eresponse)
      }

    // const userData = (!_.isEmpty(userExist)) ? { userId: userExist.user_id, password: userExist.password, status: userExist.status, baId: userExist.ba_id } : {}
    // return userData
    })
  }
}

const appToken = async (req, res) => {
  try {
    console.log(`headers`, req.headers.userid)
    const authToken = req.headers.authtoken
    const appid = req.headers.appid
    const apptoken = req.headers.apptoken
    const verifyOptions = {
      expiresIn: '1h',
      algorithm: ['RS256']
    }
    console.log('apptoken', apptoken)
    const VerifyAppTokendata =new VerifyAppToken()
    // public key to generate jwt authToken
    const publicKey = fs.readFileSync(`${__basedir}/config/keys/public.key`, `utf8`)

    const legit = jwt.verify(authToken, publicKey, verifyOptions)
    console.log('legit', legit)

    const applicationtoken = new VerifyAppToken()

    const publicKeyApp = fs.readFileSync(`${__basedir}/config/keys/public.key`, `utf8`)

    const legitApp = jwt.verify(apptoken, publicKeyApp, verifyOptions)

    console.log('Verify Token', legitApp)

    const passedUserId = req.headers.userid
    
    const appData = await VerifyAppTokendata.getUserData(legit.userId, appid)

    console.log('appdata',appData)

    console.log('useridpassed',passedUserId)

    console.log('Legit use',legit.userId)

    console.log('Legit useapp',legitApp.passedUserId)
    
    if (legit.userId === passedUserId && legitApp.passedUserId === passedUserId && appData !== null) {
      console.log('hi')
      const payload = { passedUserId }
      res.status(200).send(apiResponse.successFormat(`success`, `login successful`, '', []))
    }
    else{
      res.status(200).send(apiResponse.successFormat(`unsuccess`, `login unsuccessful`, '', []))
    }

  } catch (error) {
    console.log('erroer', error)
  }

  // const userData = await applicationtoken.getUserData(legit.userId, appid)
}

module.exports = { appToken }
