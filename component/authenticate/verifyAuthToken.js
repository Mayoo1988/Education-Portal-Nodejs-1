const jwt = require(`jsonwebtoken`)
const fs = require(`fs`)
const _ = require(`lodash`)
const db = require('../../config/db/dbConn')

const apiResponse = require(`../../helper/formatResponse`)

function authenticateUser(res) {
  const authToken = req.headers.authtoken
  const verifyOptions = {
    expiresIn: '1h',
    algorithm: ['RS256']
  }

  const publicKey = fs.readFileSync(`${__basedir}/config/keys/public.key`, `utf8`)
  const legit = jwt.verify(authToken, publicKey, verifyOptions)
  return legit;
}

class Verify {
  async getUserData (userid) {
    const statusvalue = 1
    const userExist = await db.users
      .findOne({
        where: {
          userid: userid,
          status: statusvalue
        },
        attributes: { exclude: ['email_id', 'mobile_no', 'created_by', 'created_on', 'updated_by', 'ba_details_verification', 'action_by', 'action_on', 'updated_on'] }
      })
    console.log('details', userExist)

    const userData = (!_.isEmpty(userExist)) ? { userId: userExist.user_id, password: userExist.password, status: userExist.status, baId: userExist.ba_id } : {}
    return userData
  }

  async isEmptyObject (obj) {
    return !Object.keys(obj).length
  }
}

const VerifyAppFn = async (req, res, next) => {
  try {

    console.log(`headers`,req.headers)

    const authToken = req.headers.authtoken

    console.log(`headers`,authToken)

    const verifyOptions = {
      expiresIn: '1h',
      algorithm: ['RS256']
    }

    const verifydata = new Verify()

    console.log('hi')
    // public key to generate jwt authToken
    const publicKey = fs.readFileSync(`${__basedir}/config/keys/public.key`, `utf8`)

    const legit = jwt.verify(authToken, publicKey, verifyOptions)

    console.log('log',legit)
    // console.log(`legit ${JSON.stringify(legit)}`)

    const passedUserId = (req.body && req.body.userId) ? req.body.userId : (req.headers.userid) ? req.headers.userid : ''

    console.log('userid',passedUserId)

    // const userDatavalue= await verifydata.getUserData(passedUserId)
    // const data= await  verifydata.isEmptyObject(userDatavalue)
    // console.log(`passedUserId ${passedUserId}`)
  //  console.log(passedUserId)
    console.log('userid',legit.userId)
    if (legit.userId == passedUserId) {
      console.log('inside')
      res.status(200).send(apiResponse.successFormat(`success`, `Vaild AuthToken`, {}, []))
    } else {
      throw new Error()
    }
  } catch (error) {
    // console.log(`error ${error}`)
    let errorResponse = {}
    if (error.name === 'TokenExpiredError') {
      errorResponse = apiResponse.errorFormat(`fail`, `Token Expired`, {}, [], 401)
    } else if (error.name === 'JsonWebTokenError') {
      errorResponse = apiResponse.errorFormat(`fail`, `Invalid Token`, error, [], 401)
    } else {
      errorResponse = apiResponse.errorFormat(`fail`, `Authentication Failed`, {}, [], 401)
    }

    errorResponse = _.omit(errorResponse, ['code'])
    res.status(401).send(errorResponse)
  }
}

module.exports = { VerifyAppFn }
