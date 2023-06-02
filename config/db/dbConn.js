const Sequelize = require('sequelize')

const sequelize = new Sequelize(`mysql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.USER_DB_NAME}`)

sequelize
  .authenticate()
  .then(() => {
    console.log('user management database has been established successfully.')
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err)
  })

const db = {}

// const connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: 'Password@1234567',
//   database: 'elearning',
// });

db.sequelize = sequelize
db.Sequelize = Sequelize
// db.sequelize.sync({ force: false })
//   .then(() => {
//   console.log(`Database & tables created!`)
// })

// Models/tables
db.users = require('../../model/usersModel')(sequelize, Sequelize)
db.userApps = require('../../model/userApplicationMappingModel')(sequelize, Sequelize)
db.userSession = require('../../model/userSession')(sequelize, Sequelize)
db.userManage = require('../../model/usersModel')(sequelize, Sequelize)
db.RoleManager = require('../../model/RoleMaster')(sequelize, Sequelize)
db.OrgManager = require('../../model/OrgMaster')(sequelize, Sequelize)
db.CourseManager = require('../../model/CourseMaster')(sequelize, Sequelize)
db.ModuleManager = require('../../model/ModuleMaster')(sequelize, Sequelize)
db.UserOrgMapping = require('../../model/UserOrgMapping')(sequelize, Sequelize)
db.UserRoleMapping = require('../../model/UserRoleMapping')(sequelize, Sequelize)
db.QuestionManager = require('../../model/QuestionMaster')(sequelize, Sequelize)
db.AnswerManager = require('../../model/AnswerMaster')(sequelize, Sequelize)
db.UserCourseModel = require('../../model/UserCourseModel')(sequelize, Sequelize)

// db.UserCourseModel.sequelize.sync({ force: false })
//   .then(() => {
//   console.log(`Database & tables created!`)
// })

db.UserCourseModuleModel = require('../../model/UserCourseModuleModel')(sequelize, Sequelize)
db.UserCourseModuleQuestionsModel = require('../../model/UserCourseModuleQuestionsModel')(sequelize, Sequelize)

db.Category = require('../../model/Category')(sequelize, Sequelize)
db.Module = require('../../model/ModuleMaster')(sequelize, Sequelize)
db.moduleQuesMapping = require(`../../model/moduleQuesMapping`)(sequelize, Sequelize)

// Relations
db.Module.belongsTo(db.CourseManager, {
  foreignKey: 'CourseId',
  targetKey: 'CourseId'
})

module.exports = db
