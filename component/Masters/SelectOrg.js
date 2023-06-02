const bcrypt = require(`bcryptjs`)
const jwt = require(`jsonwebtoken`)
const fs = require(`fs`)
const _ = require(`lodash`)
// const path = require(`path`)

const db = require('../../config/db/dbConn')
const apiResponse = require(`../../helper/formatResponse`)
const errorCode = require(`../../config/errorCode/errorCode`)
const genericErrorRes = require(`../../utils/errorResponse`).errorResponse

class user {
  SelectOrgfromDB ( ) {
    return new Promise(async (resolve, reject) => {
      try {
        db.sequelize.query(`CALL Sp_SelectOrg()`,
        {
          replacements: {
            
          }
        })
        .then(response => {
          // console.log(`sp response ${JSON.stringify(response)}`)
            //const serviceId = _.map(response[2], value => value.serviceId)
            //baDetails['services'] = serviceId
            resolve(response)
          
        })
        .catch(() => {
          // console.log(`er ${error}`)
          // console.log(`sp error ${JSON.stringify(error)}`)
          const errorObj = {
            code: `err_001`,
            message: errorCode.err_001
          }
          reject(apiResponse.errorFormat(`fail`, `Something went wrong`, {}, [errorObj], 400))
        })
    

      } catch (error) {
        console.log('error', error)
        let Eresponse = genericErrorRes(error)
        reject(Eresponse)
      }
    })
  }

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

    const userData = (!_.isEmpty(userExist)) ? { userId: userExist.user_id, password: userExist.password, status: userExist.status, baId: userExist.ba_id } : {}
    return userData
  }
}

const orgdata = async (req, res) => {
  try {
    const authToken = req.headers.authtoken
    
    const verifyOptions = {
      expiresIn: '1h',
      algorithm: ['RS256']
    }

    const OrgCls = new user()

    // public key to generate jwt authToken
    const publicKey = fs.readFileSync(`${__basedir}/config/keys/public.key`, `utf8`)

    const legit = jwt.verify(authToken, publicKey, verifyOptions)

    // console.log(`legit ${JSON.stringify(legit)}`)

    const passedUserId = (req.body && req.body.userId) ? req.body.userId : (req.headers.userid) ? req.headers.userid : ''
    

    // const userDatavalue= await verifydata.getUserData(passedUserId)
    // const data= await  verifydata.isEmptyObject(userDatavalue)
    // console.log(`passedUserId ${passedUserId}`)
  //  console.log(passedUserId)
    console.log('userid',legit.userId)
    if (legit.userId == passedUserId) {
        
        const userUpdate = await OrgCls.SelectOrgfromDB()
       

    
        res.status(200).send(apiResponse.successFormat(`success`, `select successful`, userUpdate, []))
      
    } else {
        res.status(400).send(apiResponse.successFormat(`Invalid`, `InVaild AuthToken`, {}, []))
    }
  } catch (error) {
    console.log(`error ${JSON.stringify(error)}`)
    res.status(401).send(error)
  }
}
module.exports = { orgdata }
