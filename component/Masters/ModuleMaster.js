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

class Module {

  async storeInDB (filePath, type, moduleId, courseId, imageFilePath) {
    try {
      const updateQuery = (type === `course`) ? { ImageFile: imageFilePath } : { ImageFile: imageFilePath, videoFile: filePath }
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
          updateQuery,
          { where: query }
        )
      } else {
        await db.Module.update(
          updateQuery,
          { where: query }
        )
      }
      return true
    } catch (error) {
      return Promise.reject(error)
    }
  }

  storeFile (filePath, bufferFile) {
    return new Promise((resolve, reject) => {
      try {
        fs.writeFile(`${filePath}`, bufferFile, { encoding: 'base64' }, (err) => {
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

  createDirectory (folderPath) {
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

  addQuestionsInDB(questionsArray,CreatedBy){
    return new Promise(async (resolve, reject) => {
      let d = new Date();
      let newIds = '';
      let index = 0;
      let index1= 0;
      _.forEach(questionsArray, async (element) => {
        db.QuestionManager.create({
          QuestionDescription: element.questionDescription,
          QuestionType: element.questionType,
          MappingId:element.mappingId,
          MappingType:element.mappingType,
          Marks:element.marks,
          CreatedBy:CreatedBy,
          CreatedOn:d,
          UpdatedBy:CreatedBy,
          UpdatedOn:d
        }).then(createdQuestion => {
          index++;
        // first create Options
        if(newIds !== '') newIds += ",";

        newIds +=  createdQuestion.null;

        _.forEach(element.answerDescription, async (option) => {

          db.AnswerManager.create({
            AnsDescription: option.ansDescription,
            QuestionId: createdQuestion.null,
            IsValid:option.isValid,
            CreatedBy:CreatedBy,
            CreatedOn:d,
            UpdatedBy:CreatedBy,
            UpdatedOn:d
        }).then(createdAnswer => {
          index1 ++;

          if(index == questionsArray.length && index1 == element.answerDescription.length){
            resolve(newIds);
          }


        });

        });

      });

      });
    })
  }
  addModuleQuestInDB ( module_id, question_id,status,created_by,created_on,updated_by,updated_on) {
    return new Promise(async (resolve, reject) => {
      try {
        await db.moduleQuesMapping.create({
          module_id:module_id,
          question_id:question_id,
          status:status,
          created_by:created_by,
          created_on:created_on,
          updated_by:updated_by,
          updated_on:updated_on
        })
        resolve()
      } catch (error) {
        let Eresponse = genericErrorRes(error)
        reject(Eresponse)
      }
    })
  }

  addModuleInDB (CourseId, ModuleName,ModuleCode,ModuleDescription,Createdby,Createdon,UpdatedBy,UpdatedOn,questions,orgId,IsCompleted) {
    return new Promise(async (resolve, reject) => {
      try {
        db.sequelize.query(`CALL sp_insert_module(:CourseId, :ModuleName,  :ModuleCode, :ModuleDescription, :CreatedBy, :CreatedOn, :UpdatedBy, :UpdatedOn,:questions,:orgId,:IsCompleted)`,
        {
          replacements: {
            CourseId:CourseId,
            ModuleName: ModuleName,
            ModuleCode:ModuleCode,
            ModuleDescription:ModuleDescription,
            CreatedBy:Createdby,
            CreatedOn:Createdon,
            UpdatedBy:UpdatedBy,
            UpdatedOn:UpdatedOn,
            questions:questions,
            orgId:orgId,
            IsCompleted:IsCompleted
          }//,
          //type: db.Sequelize.QueryTypes.SELECT
        })
        .then(response => {
        resolve(response)
        })
      } catch (error) {
        console.log('error', error)
        let Eresponse = genericErrorRes(error)
        reject(Eresponse)
      }
    })
  }

  async isEmptyObject(obj) {
    return !Object.keys(obj).length;
  }

  async getModuleData (ModuleName) {
    const statusvalue = 1
    const userExist = await db.ModuleManager
      .findOne({
        where: {
            ModuleName: ModuleName
        },
        attributes: { exclude: ['CourseId', 'ModuleName', 'ModuleCaption','ModuleCode','ModuleDescription','CreatedBy','CreatedOn','UpdatedBy','UpdatedOn'] }
      })
    const ModuleData = (!_.isEmpty(userExist)) ? { ModuleName: userExist.ModuleName} : {}
    return ModuleData;
  }

  async getUserData (userid) {
    const statusvalue = 1
    const userExist = await db.users
      .findOne({
        where: {
          userid: userid
        },
        attributes: { exclude: ['email_id', 'mobile_no', 'created_by', 'created_on', 'updated_by', 'ba_details_verification', 'action_by', 'action_on', 'updated_on'] }
      })

    const userData = (!_.isEmpty(userExist)) ? { userId: userExist.user_id, password: userExist.password, status: userExist.status, baId: userExist.ba_id } : {}
    return userData
  }

}

const Moduledata = async (req, res) => {
  try {

    const authToken = req.headers.authtoken
    console.log('authtoken',authToken)
    const verifyOptions = {
      expiresIn: '1h',
      algorithm: ['RS256']
    }
    //const imageFile = req.body.imageFile
    


    //const file = req.videoFile
    
   // console.log('video',file)
   // console.log('video',req.body)
    const ModuleCls = new Module()
    // const ext = path.extname(file).toLowerCase()
    // const imageExt = path.extname(imageFile).toLowerCase()

    //calculate the size of file
    // const fileSizeInBytes = file.size
    // const fileSizeInKB = Number(fileSizeInBytes / 1000).toFixed(2)
    // const fileSizeInMB = Number(fileSizeInKB / 1000).toFixed(2)
    // // throw error if file size is greater than 15MB
    // if (fileSizeInMB > 20) {
    //   throw (apiResponse.errorFormat(`fail`, errorCodeJson.err_020, {}, [{
    //     code: `err_020`,
    //     message: errorCodeJson.err_020
    //   }], 400))
    // }

   // const bufferFile = file.buffer



    // public key to generate jwt authToken
    const publicKey = fs.readFileSync(`${__basedir}/config/keys/public.key`, `utf8`)

    const legit = await jwt.verify(authToken, publicKey, verifyOptions)

    const passedUserId = (req.body && req.body.userId) ? req.body.userId : (req.headers.userid) ? req.headers.userid : ''


    if (legit.userId == passedUserId) {

    const CourseId= req.body.courseId
    const orgId=req.body.orgId
   // console.log('orgId',req.body[0])
    const ModuleName = req.body.moduleName
    const ModuleCaption = req.body.moduleCaption;
    const ModuleCode = req.body.moduleCode
    const ModuleDescription = req.body.moduleDescription
    let questionsId = []
    questionsId= req.body.questions
   
    console.log('questions',questionsId)
    //console.log('questions',questionsId.count)
   // console.log('questions',questionsId.length)
    let newQuestions = []
    if(req.body.newQuestions) {newQuestions = JSON.parse(req.body.newQuestions);}
   // const currentdate = new Date(jdate)
    var d = new Date()
    const createdby = req.body.createdBy
    const createdon = d
    const updatedby = passedUserId
    const updatedon = d
    const isActive='1'
    let allQuestionIds = '';
    
    console.log('questions',questionsId)
    if(questionsId){
      allQuestionIds +=  questionsId;
    }
    // if(newQuestions && newQuestions.length > 0){
    //   // First add new questions and then create module.

    //   const createQuestions = await ModuleCls.addQuestionsInDB(newQuestions, createdby);

    //   if(allQuestionIds !== '') allQuestionIds += ',';
    //   allQuestionIds +=  createQuestions;

    // }

    const userUpdate = await ModuleCls.addModuleInDB(CourseId, ModuleName,ModuleCode,ModuleDescription,createdby,createdon,updatedby,updatedon,allQuestionIds,orgId,0)
    let courseId = userUpdate[0].CourseId;
    let moduleId = userUpdate[0].ModuleId;
    _.forEach(questionsId, async (element) => {
      if(element!=','){
        console.log('element',element)
        await ModuleCls.addModuleQuestInDB(moduleId,element,1,createdby,createdon,updatedby,updatedon)
      }
    });
  //   console.log('ext',ext);
  //   const fileName = `module_video${ext}`
  //   const folderPath =  `${__basedir}/public/uploads/courseMaterial/video/${courseId}/${moduleId}`
  //   const filePath = `${folderPath}/${fileName}`
  //  // console.log('filepath1',filePath)
   // create Directory if not exist for RFP
  //   await ModuleCls.createDirectory(folderPath)

  // //  store file on server
  //   await ModuleCls.storeFile(filePath, bufferFile)

  //   const resFilePath =  `courseMaterial/video/${courseId}/${moduleId}`
  //   const publicFilePath = `${process.env.URL_METHOD}://${process.env.URL}/${resFilePath}/${fileName}`

  //   // Module image file save
  //   const imageFolderPath = `${__basedir}/public/uploads/courseMaterial/image/${courseId}/${moduleId}`
  //   const imageFileName = `module_poster${imageExt}`
  //   const imageFilePath = `${imageFolderPath}/${imageFileName}`
    
  //   console.log('imagefilepath',imageFilePath)
  //   // // Create Directory if not exist
  //    await ModuleCls.createDirectory(imageFolderPath)

    // // Store file on server
    // // const imageFile = req.imagefile;
    // const imageBufferFile = imageFile.buffer
     //console.log('imagefilebuffer',imageBufferFile)
     //await ModuleCls.storeFile(imageFilePath, imageBufferFile)

    //  const resImageFilePath = `courseMaterial/image/${courseId}/${moduleId}`
    //  const publicImageFilePath = `${process.env.URL_METHOD}://${process.env.URL}/${resImageFilePath}/${imageFileName}`
     
    //  console.log('videofilepath',publicImageFilePath)
    // // console.log('Here we print path', publicFilePath, publicImageFilePath);

    // // // add in db
    //  await ModuleCls.storeInDB(publicFilePath, 'module', moduleId, courseId, publicImageFilePath)

    res.status(200).send(apiResponse.successFormat(`success`, `insert successful`, userUpdate, []))
    } else {
      res.status(400).send(apiResponse.successFormat(`failure`, `InVaild AuthToken`, {}, []))
    }
  } catch (error) {
    console.log(`error `,error)
    // res.status(401).send(error)
  }
}

module.exports = { Moduledata }
