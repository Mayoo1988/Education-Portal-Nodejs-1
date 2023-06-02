const bcrypt = require(`bcryptjs`)
const jwt = require(`jsonwebtoken`)
const fs = require(`fs`)
const _ = require(`lodash`)
const path = require(`path`)
const mkdirp = require(`mkdirp`)

const db = require('../../config/db/dbConn')
const apiResponse = require(`../../helper/formatResponse`)
const errorCode = require(`../../config/errorCode/errorCode`)
const genericErrorRes = require(`../../utils/errorResponse`).errorResponse

class User {

  async storeInDB(filePath, type, moduleId, courseId, publicImageFilePath) {
    try {
      const updateQuery = (type === `course`) ? {
        video_link: filePath
      } : {
        videoFile: filePath,
        ImageFile: publicImageFilePath
      };

      const query = (type === `course`) ? {
        CourseId: +(courseId),
        isActive: 1
      } : {
        CourseId: +(courseId),
        ModuleId: +(moduleId),
        isActive: 1
      }

      if (type === `course`) {
        const update = await db.CourseManager.update(
          updateQuery, {
            where: query
          }
        )
      } else {
        await db.Module.update(
          updateQuery, {
            where: query
          }
        )
      }
      return true
    } catch (error) {
      return Promise.reject(error)
    }
  }

  storeFile(filePath, bufferFile) {
    return new Promise((resolve, reject) => {
      try {
        fs.writeFile(`${filePath}`, bufferFile, {
          encoding: 'base64'
        }, (err) => {
          if (err) {
            return reject(err)
          }

          resolve()
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  createDirectory(folderPath) {
    return new Promise((resolve, reject) => {
      try {
        mkdirp(folderPath, (err) => {
          if (err) {
            return reject(err)
          }

          resolve()
        })
      } catch (error) {
        console.log(`create directory error ${error}`)
        reject(error)
      }
    })
  }

  UpdateModuleInDB(ModuleId, CourseId, ModuleName,  ModuleCode, ModuleDescription, Createdby, Createdon, UpdatedBy, UpdatedOn) {
    return new Promise((resolve, reject) => {
      db.sequelize.query(`CALL Sp_update_Module(:ModuleId, :CourseId, :ModuleName,  :ModuleCode,
          :ModuleDescription,:CreatedBy, :CreatedOn, :UpdatedBy, :UpdatedOn)`, {
          replacements: {
            ModuleId: ModuleId,
            CourseId: CourseId,
            ModuleName: ModuleName,
          //  ModuleCaption: ModuleCaption,
            ModuleCode: ModuleCode,
            ModuleDescription: ModuleDescription,
            // ModuleRefFile:ModuleRefFile,
            CreatedBy: Createdby,
            CreatedOn: Createdon,
            UpdatedBy: UpdatedBy,
            UpdatedOn: UpdatedOn
            
          } //,
          //type: db.Sequelize.QueryTypes.SELECT
        })
        .then(response => {
          console.log('response', response)
          // console.log(`sp response ${JSON.stringify(response)}`)
          // if (response[0]['0'].message === `success`) {
          //   const baDetails = response[1]['0']
          //   const serviceId = _.map(response[2], value => value.serviceId)
          //   baDetails['services'] = serviceId
          resolve(response)
          // }
          //else {
          //const errorObj = {
          //code: `err_001`,
          //message: errorCode.err_001
          //}
          //reject(apiResponse.errorFormat(`fail`, `Something went wrong`, {}, [errorObj], 400))
          //}
        })
        .catch((error) => {
          console.log('error', error)
          // console.log(`sp error ${JSON.stringify(error)}`)
          const errorObj = {
            code: `err_001`,
            message: errorCode.err_001
          }
          reject(apiResponse.errorFormat(`fail`, `Something went wrong`, {}, [errorObj], 400))
        })
    })

  }



  async isEmptyObject(obj) {
    return !Object.keys(obj).length;
  }

  async encryptPassword(password) {

    const saltRounds = 15

    return bcrypt.hash(password,
      saltRounds)
  }

  // db.QuestionManager.update({
  //   QuestionDescription: element.questionDescription,
  //   QuestionType: element.questionType,
  //   MappingId: element.mappingId,
  //   MappingType: element.mappingType,
  //   Marks: element.marks,
  //   CreatedBy: CreatedBy,
  //   CreatedOn: d,
  //   UpdatedBy: CreatedBy,
  //   UpdatedOn: d
  // })

  updateQuestionAndAnswers(questionsArray, usuerId, moduleId) {
    return new Promise(async (resolve, reject) => {
      let d = new Date();
      let newIds = '';
      let questionIds = [];

      _.forEach(questionsArray, async (element, questionIndex) => {
        console.log('element', element, usuerId)

        element.updatedBy = usuerId;
        element.updatedOn = d;

        db.sequelize.query(`CALL sp_update_module_question(:_questionId, :_questionDescription, :_questionType, :_mappingId, :_mappingType,
        :_marks, :_isActive, :_userId)`, {
          replacements: {
            _questionId: element.questionId,
            _questionDescription: element.questionDescription,
            _questionType: element.questionType,
            _mappingId: element.mappingId,
            _mappingType: element.mappingType,
            _marks: element.marks,
            _isActive: element.hasOwnProperty('isActive') ? element.isActive : 1,
            _userId: usuerId
          }
        }).then((questionRes) => {
          // resolve(response);

          console.log('questionRes', questionRes, questionRes[0], questionRes[0].TextRow, questionRes._questionId);
          questionIds.push(questionRes[0]._questionId);
          _.forEach(element.answerDescription, async (option, answerIndex) => {
            console.log('option', option, questionRes, questionRes._questionId);
            db.sequelize.query(`CALL sp_update_module_question_answer(:_questionId, :_ansId, :_ansDescription, :_isValid, :_createdBy, :_isActive)`, {
              replacements: {
                _questionId: questionRes[0]._questionId ? questionRes[0]._questionId : element.questionId,
                _ansId: option.ansId ? option.ansId : 0,
                _ansDescription: option.ansDescription,
                _isValid: option.isValid,
                _createdBy: usuerId,
                _isActive: option.hasOwnProperty('isActive') ? option.isActive : 1
              }
            }).then((answerRes) => {
              // console.log('answerRes', answerRes);
              if (questionIndex == questionsArray.length - 1 && answerIndex == element.answerDescription.length - 1) {
                console.log('questionIds', questionIds);

                db.sequelize.query(`CALL sp_update_module_questionids(:_moduleId, :_questionIds)`, {
                  replacements: {
                    _moduleId: moduleId,
                    _questionIds: questionIds.join(',')
                  }
                }).then((moduleUpdateRes) => {
                  resolve(moduleUpdateRes);
                }).catch(err => {
                  reject(err);
                });
              }
            }).catch(err => {
              reject(err);
            });

          });

        }).catch(questionErr => {
          reject(questionErr);
        });

        // db.QuestionManager.update(element, {
        //   where: { QuestionId: element.questionId }, returning: true
        // }).then((questionRes) => {
        //   console.log('questionRes', questionRes);
        //   _.forEach(element.answerDescription, async (option, answerIndex) => {
        //     console.log('option', option, );
        //     db.AnswerManager.update(option, {where: { AnsId: option.ansId }}).then(answerRes => {
        //       console.log('answerRes', answerRes);
        //       if (questionIndex == questionsArray.length - 1 && answerIndex == element.answerDescription.length - 1) {
        //         console.log('In resolve');
        //         resolve(newIds);
        //       }
        //     });
        //
        //   });
        //
        // });

      });
    })
  }
}

const moduleupdate = async (req, res) => {
  try {
    console.log('In module update');
    // console.log(`headers`, req)
    const authToken = req.headers.authtoken
    // console.log('token',authToken)

    const verifyOptions = {
      expiresIn: '1h',
      algorithm: ['RS256']
    }
    // const file = req.files['file'][0]
    // let imageFile = req.files['imageFile'][0]
    // console.log('imageFile', imageFile);
    // const imageExt = path.extname(imageFile.originalname).toLowerCase();
    // console.log('imageExt', imageExt);

    const UserCls = new User()

    // public key to generate jwt authToken
    const publicKey = fs.readFileSync(`${__basedir}/config/keys/public.key`, `utf8`)
    const legit = jwt.verify(authToken, publicKey, verifyOptions)

    // console.log('log',legit)
    // console.log(`legit ${JSON.stringify(legit)}`)

    const passedUserId = (req.body && req.body.userId) ? req.body.userId : (req.headers.userid) ? req.headers.userid : ''

    // const userDatavalue= await verifydata.getUserData(passedUserId)
    // const data= await  verifydata.isEmptyObject(userDatavalue)
    // console.log(`passedUserId ${passedUserId}`)
    // console.log(passedUserId)
    // console.log('userid',legit.userId);

    // console.log('req.body.moduleId', req.body)
    if (legit.userId == passedUserId) {
      const ModuleId = req.body.moduleId
      const CourseId = req.body.courseId
      const ModuleName = req.body.moduleName
     // const ModuleCaption = req.body.moduleCaption
      const ModuleCode = req.body.moduleCode
      const ModuleDescription = req.body.moduleDescription
      // const ModuleRefFile = req.body.moduleRefFile
     // console.log('file', file)
      // if (file) {
      //   const ext = path.extname(file.originalname).toLowerCase();
      //   // const imageExt = path.extname(imageFile.originalname).toLowerCase();
      //   // calculate the size of file
      //   const fileSizeInBytes = file.size
      //   const fileSizeInKB = Number(fileSizeInBytes / 1000).toFixed(2)
      //   const fileSizeInMB = Number(fileSizeInKB / 1000).toFixed(2)
      //   // throw error if file size is greater than 15MB
      //   if (fileSizeInMB > 20) {
      //     throw (apiResponse.errorFormat(`fail`, errorCodeJson.err_020, {}, [{
      //       code: `err_020`,
      //       message: errorCodeJson.err_020
      //     }], 400))
      //   }

      // //  const bufferFile = file.buffer

      //   // public key to generate jwt authToken
      //   const publicKey = fs.readFileSync(`${__basedir}/config/keys/public.key`, `utf8`)
      //   const fileName = `module_video${ext}`
      //   const folderPath = `${__basedir}/public/uploads/courseMaterial/video/${CourseId}/${ModuleId}`
      //   const filePath = `${folderPath}/${fileName}`
      //   // create Directory if not exist for RFP
      //   await UserCls.createDirectory(folderPath)

      //   // store file on server
      //   await UserCls.storeFile(filePath, bufferFile)

      //   const resFilePath = `courseMaterial/video/${CourseId}/${ModuleId}`
      //   const publicFilePath = `${process.env.URL_METHOD}://${process.env.URL}/${resFilePath}/${fileName}`

      //   // Module image file save
      //   const imageFolderPath = `${__basedir}/public/uploads/courseMaterial/image/${CourseId}/${ModuleId}`
      //   const imageFileName = `module_poster${imageExt}`
      //   const imageFilePath = `${imageFolderPath}/${imageFileName}`

      //   // Create Directory if not exist
      //   await UserCls.createDirectory(imageFolderPath)

      //   // Store file on server
      //   // const imageFile = req.imagefile;
      //   const imageBufferFile = imageFile.buffer
      //   await UserCls.storeFile(imageFilePath, imageBufferFile)

      //   const resImageFilePath = `courseMaterial/image/${CourseId}/${ModuleId}`
      //   const publicImageFilePath = `${process.env.URL_METHOD}://${process.env.URL}/${resImageFilePath}/${imageFileName}`

      //   console.log('Print path', publicFilePath, publicImageFilePath);

      //   // add in db
      //   await UserCls.storeInDB(publicFilePath, 'module', ModuleId, CourseId, publicImageFilePath)
      // }
      const Createdby = passedUserId;
      var d = new Date();
      const CreatedOn = d;
      console.log('CreatedOn',d);
      const UpdatedBy = passedUserId;
      const UpdatedOn = new Date;
      let userId = passedUserId;
      const isActive = '1';
      console.log('UpdatedOn',d);
      const userUpdate = await UserCls.UpdateModuleInDB(ModuleId, CourseId, ModuleName,  ModuleCode, ModuleDescription, Createdby, CreatedOn, UpdatedBy, UpdatedOn)

      let newQuestions = []
      if (req.body.newQuestions) {
        newQuestions = JSON.parse(req.body.newQuestions);
      }
      // Update questions as well
      if (newQuestions && newQuestions.length > 0) {
        let updateQuestions = await UserCls.updateQuestionAndAnswers(newQuestions, userId, ModuleId);
        // console.log('updateQuestions', updateQuestions);
      }

      res.status(200).send(apiResponse.successFormat(`success`, `Module updated successfully`, userUpdate, []))

    } else {
      res.status(401).send(apiResponse.successFormat(`failure`, `InVaild AuthToken`, {}, []))
    }

  } catch (error) {
    console.log(`error`, error)
    if(error.message == 'jwt expired'){
      res.status(401).send(error)
    }else{
      res.status(400).send(error)
    }

  }
}
module.exports = {
  moduleupdate
}
