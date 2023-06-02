const db = require('../../config/db/dbConn')
const apiResponse = require(`../../helper/formatResponse`)
const errorCode = require(`../../config/errorCode/errorCode`)
const genericErrorRes = require(`../../utils/errorResponse`).errorResponse

class Logout {

    async UpdateStatusInDBSession (userid, appid) {
        // console.log(userid)
        const statusvalue='inactive'
        const Logout='Succesfully logged out'
        // register user
        let user = await db.userSession.update(
          { status: statusvalue  },
          { where: {
            user_id: userid,
            app_id:appid
          } }
        )
        let dataObj = {
          userId: userid,
          logout:Logout
        }
        return (dataObj)
      }
    

      async UpdateStatusInDBusers (userid, token) {
        // register user
        const statusvalue=0
        let user = await db.users.update(
          { status: statusvalue },
          { where: {
            user_id: userid
          } }
        )
        let dataObj = {
          authToken: token,
          userId: userid
        }
        return (dataObj)
      }

}

const logout = async (req, res) => {
    try {

        const userid = req.headers.userid
        const appid=  req.headers.appid

        const Log = new Logout()

        const StatususerData = await Log.UpdateStatusInDBSession(userid,appid)
        const StatussessionData = await Log.UpdateStatusInDBSession(userid,appid)
        
        let resObj = {
            usersessiondata:StatussessionData,
            userdata:StatususerData
          }


        res.status(200).send(apiResponse.successFormat(`success`, `logged out successfully`, resObj, []))
    }

    catch (error) {
        console.log(`error ${error}`)
       let errorResponse = {}
       errorResponse = _.omit(errorResponse, ['code'])
       res.status(401).send(errorResponse)
     }

    

}

module.exports.logout = logout
