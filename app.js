const { ApolloServer, gql } = require('apollo-server-express');
const fs = require(`fs`)
const express = require('express')
const bodyParser = require('body-parser')
// const routes = require('./routes/routes');
const cors = require(`cors`)
require('dotenv').config()
const multer = require(`multer`)
const uploadFile = multer()
const {resolvers}= require('./resolvers');

const app = express()

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false, limit: '40mb' }))
app.use(bodyParser.json({ limit: '40mb' }))

// express static for serving file
app.use(express.static('public/uploads/'))

// var options = {
//   inflate: true,
//   limit: '1000kb',
//   type: 'application/octet-stream'
// }

// app.use(bodyParser.raw(options))

//cors
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept,Authorization, authtoken, userid')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, UPDATE, DELETE, OPTIONS')
  res.header('Content-Type', 'application/json')
  res.header('Content-Type', 'multipart/form-data; charset=utf-8')
  next()
})
app.use(cors())
app.options('*', cors())

// global variable
global.__basedir = __dirname

// ping api to check application status
app.get('/ping', (req, res) => res.send('Hello World'))

app.post('/login', require('./component/authenticate/login').login)
app.post('/token', require('./component/authenticate/verifyAuthToken').VerifyAppFn)
app.post('/logout', require('./component/authenticate/logout').logout)

app.post('/Userinsert', require('./component/UserManagement/UserInsert').user)
app.post('/UpdateUser', require('./component/UserManagement/UpdateUser').userupdate)
app.post('/UserDelete', require('./component/UserManagement/DeleteUser').userdelete)
app.get('/Selectuser', require('./component/Masters/SelectUser').userdata)
app.get('/Selectuserbyorg', require('./component/Masters/SelectUserbyOrg').SelectUserByOrg)
app.post('/Selectuserbyid', require('./component/Masters/SelectUserById').userdata)
app.post('/getUserById', require('./component/Masters/User').GetUserById)

app.post('/Roleinsert', require('./component/Masters/RoleMaster').Roledata)
app.post('/Roleupdate', require('./component/Masters/UpdateRoleMaster').roleupdate)
app.get('/Selectrole', require('./component/Masters/SelectRole').roledata)
app.post('/Selectrolebyid', require('./component/Masters/SelectRolebyId').Roledata)
app.post('/Deleterolebyid', require('./component/Masters/DeleteRole').roledelete)

app.post('/Courseinsert', uploadFile.single(`file`), require('./component/Masters/CourseMaster').Coursedata)
app.get('/selectCourse', require('./component/Masters/SelectCourse').Coursedata)
app.post('/selectCoursebyId', require('./component/Masters/SelectCoursebyId').coursedata)
app.post('/selectCoursebyUserid', require('./component/Masters/SelectCoursebyUserId').coursedata)
app.post('/UpdateCourse', uploadFile.single(`file`), require('./component/Masters/UpdateCourse').courseupdate)
app.post('/Deletecoursebyid', require('./component/Masters/DeleteCourse').coursedelete)

app.post('/Orginsert', require('./component/Masters/OrgMaster').Org)
app.get('/Selectorg', require('./component/Masters/SelectOrg').orgdata)
app.post('/UpdateOrg', require('./component/Masters/UpdateOrg').orgupdate)
app.post('/DeleteOrgbyid', require('./component/Masters/DeleteOrg').orgdelete)
app.get('/selectOrgbyid', require('./component/Masters/SelectOrgbyId').orgdata)

app.post('/Moduleinsert', require('./component/Masters/ModuleMaster').Moduledata)
app.post('/GetCourseModules', require('./component/Masters/Module').GetCourseModules)
app.post('/GetCourseModulesForUser', require('./component/Masters/SelectCourseModuleByUserId').courseDataByUser)
app.post('/UpdateModule', uploadFile.fields([{ name: 'imageFile', maxCount: 1 }, { name: 'file', maxCount: 1 }]),
  require('./component/Masters/UpdateModule').moduleupdate)
app.post('/UpdateModuleCompleted', require('./component/Masters/UpdateCompletedModule').CompletedModuledata)
app.get('/Selectmodule', require('./component/Masters/SelectModule').moduledata)
app.post('/SelectModulebyOrg', require('./component/Masters/SelectModulebyOrg').moduleorgdata)
app.post('/Deletemodulebyid', require('./component/Masters/DeletemodulebyId').moduledelete)
app.post('/Selectmodulebyid', require('./component/Masters/SelectModuleById').moduledata)

app.post('/Userorgmapping', require('./component/MasterMapping/UserOrgMapping').UserOrgMappingdata)
app.post('/Userrolemapping', require('./component/MasterMapping/UserRoleMapping').UserRoleMappingdata)
app.post('/Usercoursemapping', require('./component/MasterMapping/UserCourseMapping').UserCourseMappingdata)
app.get ('/getUsersCourseMapping', require('./component/MasterMapping/getUsersCourseMapping').getUsersCourseMapping)
app.post('/selectUserCourseMapping', require('./component/MasterMapping/UserCourseMapping').selectUserCourseMapping)

app.post('/QuestionInsert', require('./component/Masters/QuestionMaster').Questiondata)
app.get('/QuestionAnsSelect', require('./component/Masters/SelectQuestion').questiondata)
app.get('/QuestionSelect', require('./component/Masters/SelectQuest').question)
app.post('/QuestionSelectById', require('./component/Masters/SelectQuestionById').Questiondata)

app.post('/AnswerInsert', require('./component/Masters/AnswerMaster').Answerdata)
app.get('/AnswerSelect', require('./component/Masters/SelectAnswer').Answerdata)
app.post('/AnswerSelectById', require('./component/Masters/SelectAnswerById').Answerdata)

app.get('/GetCategories', require('./component/Masters/Category').GetCategories)
app.post('/GetCategoryById', require('./component/Masters/Category').GetCategoryById)
app.post('/AddCategory', require('./component/Masters/Category').AddCategory)
app.put('/UpdateCategory', require('./component/Masters/Category').UpdateCategory)
app.put('/DeleteCategory', require('./component/Masters/Category').DeleteCategory)
app.get('/GetCategoryDetails', require('./component/Masters/GetCategoryDetails').categorydata)

app.get(`/course-material`, require(`./component/course/material/getCourseMaterial`).apiFn)
app.post(`/course-material-video-data`, require(`./component/course/material/getCourseMaterialVideo`).apiFn)
app.post(`/course-material`, uploadFile.single(`file`), require(`./component/course/material/courseMaterial`).apiFn)
app.post(`/course-material-video`, uploadFile.single(`f`), require(`./component/course/material/courseMaterialVideo`).apiFn)
app.get(`/question-answer`, require(`./component/course/module/getQuesAndAns`).apiFn)
app.post('/submit-question', require(`./component/course/module/submitQuestion`).submitModuleQuestion)
app.post('/submit-module-test', require(`./component/course/module/submitQuestionTest`).submitModuleTest)

app.get(`/getCourseModuleQuestions`, require(`./component/course/module/getQuesAndAns`).getCourseModuleQuestions)
app.get(`/getCurrentQuestionStatus`, require(`./component/course/module/getQuesAndAns`).getCurrentQuestionStatus)
app.get(`/getUserModuleScore`, require(`./component/course/module/getQuesAndAns`).getUserModuleScore)

app.post(`/getCourseCompletionReport`, require(`./component/Reports/Reports`).GetCourseCompletionReport)
app.post(`/getUserPerformanceReport`, require(`./component/Reports/Reports`).GetUserPerformanceReport)


//const apolloServer = new ApolloServer({ typeDefs, resolvers });
//await apolloServer.start();
//apolloServer.applyMiddleware({ app, path: '/graphql' });
const typeDefs =  fs.readFileSync('./schema.graphql', 'utf-8');
const server = new ApolloServer({
  typeDefs,
  resolvers
});
async function startApolloServer() {
  
 

  await server.start(); // Make sure to await server.start() before applying middleware


  server.applyMiddleware({ app, path: '/graphql'  });

  const port = process.env.PORT || 3001

app.listen(port, () => console.log(`app listening on ${port} port!!`))

}

startApolloServer();



