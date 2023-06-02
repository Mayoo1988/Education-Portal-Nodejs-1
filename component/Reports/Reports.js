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

// Get course completion report
module.exports.GetCourseCompletionReport = async (req, res) => {
  try {

    let data = authenticateUser(req);

    db.sequelize.query(`CALL sp_get_course_completion_report(:_orgId, :_courseId, :_userId)`, {
      replacements: {
        _orgId: req.body.orgId,
        _courseId: req.body.courseId,
        _userId: req.body.userId
      }
    }).then(response => {
      res.status(200).send(formatResponse.successFormat(`success`, `report fetched`, response, []));
    }).catch(e => {
      const code = (Object.prototype.hasOwnProperty.call(e, 'status')) ? e.code : 500
      res.status(code).send(formatResponse.successFormat(`fail`, e.message, {}, []))
    });

  } catch (e) {
    res.status(400).send(apiResponse.successFormat(`error`, e, []))
  }
}

// Get user performance report
module.exports.GetUserPerformanceReport = async (req, res) => {
  try {

    let data = authenticateUser(req);

    db.sequelize.query(`CALL sp_get_user_performance_report(:_orgId, :_courseId, :_userId)`, {
      replacements: {
        _orgId: req.body.orgId,
        _courseId: req.body.courseId,
        _userId: req.body.userId
      }
    }).then(response => {
      res.status(200).send(formatResponse.successFormat(`success`, `report fetched`, response, []));
    }).catch(e => {
      const code = (Object.prototype.hasOwnProperty.call(e, 'status')) ? e.code : 500
      res.status(code).send(formatResponse.successFormat(`fail`, e.message, {}, []))
    });

  } catch (e) {
    res.status(400).send(apiResponse.successFormat(`error`, e, []))
  }
}
