const jwt = require(`jsonwebtoken`)
const fs = require(`fs`)
const _ = require(`lodash`)
const db = require('../../config/db/dbConn')
const verifyAuthToken = require(`../authenticate/verifyAuthToken`)
const apiResponse = require(`../../helper/formatResponse`)
const formatResponse = require(`../../helper/formatResponse`)
const errorCode = require(`../../config/errorCode/errorCode`)
const genericErrorRes = require(`../../utils/errorResponse`).errorResponse

// Declare this function globally
function authenticateUser(req) {
  const authToken = req.headers.authtoken
  const verifyOptions = {
    expiresIn: '1h',
    algorithm: ['RS256']
  }

  const publicKey = fs.readFileSync(`${__basedir}/config/keys/public.key`, `utf8`)
  const legit = jwt.verify(authToken, publicKey, verifyOptions)
  return legit;
}

// Get user by id
module.exports.GetUserById = async (req, res) => {
  try {

    let data = authenticateUser(req);

    db.sequelize.query(`CALL sp_get_user_by_id(:_userId)`, {
      replacements: {
        _userId: req.body.userId
      }
    }).then(response => {
      res.status(200).send(formatResponse.successFormat(`success`, `report fetched`, response[0], []));
    }).catch(e => {
      const code = (Object.prototype.hasOwnProperty.call(e, 'status')) ? e.code : 500
      res.status(code).send(formatResponse.successFormat(`fail`, e.message, {}, []))
    })
  } catch (e) {
    res.status(400).send(apiResponse.successFormat(`error`, e, []))
  }
}

// Get user by id
module.exports.UpdateUserById = async (req, res) => {
  try {

    let data = authenticateUser(req);

    db.sequelize.query(`CALL sp_update_user_by_id(:_userId, :_userCode, :_roleId, :_firstName,
      :_lastName, :_email_Id, :_mobileNo, :_joiningDate, :_orgId, :_password)`, {
      replacements: {
        _userId: req.body.userId
      }
    }).then(response => {
      res.status(200).send(formatResponse.successFormat(`success`, `report fetched`, response[0], []));
    }).catch(e => {
      const code = (Object.prototype.hasOwnProperty.call(e, 'status')) ? e.code : 500
      res.status(code).send(formatResponse.successFormat(`fail`, e.message, {}, []))
    })
  } catch (e) {
    res.status(400).send(apiResponse.successFormat(`error`, e, []))
  }
}
