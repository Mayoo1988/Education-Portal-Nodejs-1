const jwt = require(`jsonwebtoken`)
const fs = require(`fs`)
const _ = require(`lodash`)
const db = require('../../config/db/dbConn')
const verifyAuthToken = require(`../authenticate/verifyAuthToken`)
const apiResponse = require(`../../helper/formatResponse`)
const errorCode = require(`../../config/errorCode/errorCode`)
const genericErrorRes = require(`../../utils/errorResponse`).errorResponse
const Module = db.Module;

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

// Returns only active records
module.exports.GetCourseModules = async (req, res) => {
  try {

    let data = authenticateUser(req);
    console.log('CourseId',req.body.courseId)
    // db.sequelize.query(`CALL sp_get_course_by_id(:CourseId)`,
    //     {
    //       replacements: {
    //         CourseId:req.body.courseId
    //       }//,
    //       //type: db.Sequelize.QueryTypes.SELECT
    //     })
    //     .then(response => {
    //       res.send(apiResponse.successFormat(`success`, '', response));
    //     resolve(response)
    //     })
    return Module.findAll({where: { CourseId: req.body.courseId, isActive: 1}}).then(function(result){
      res.send(apiResponse.successFormat(`success`, '', result));
    }).catch(error => {
      res.status(400).send(apiResponse.successFormat(`error`, error, []))
    });

  } catch (e) {
    console.log('e', e)
    res.status(400).send(apiResponse.successFormat(`error`, e, []))
  }
}
