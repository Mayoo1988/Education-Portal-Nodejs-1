module.exports = (sequelize, DataTypes) => {
    const masterUserModel = sequelize.define('UserCourseModuleQuestionsModel', {
      userId: {
        type: DataTypes.INTEGER,
        required: true,
        allowNull: false,
        primaryKey: true
      },
      courseId: {
        type: DataTypes.INTEGER,
        required: true,
        allowNull: false
      },
      moduleID:{
        type: DataTypes.INTEGER,
        required: true,
        allowNull: false
      },
      moduleMappingId:{
        type: DataTypes.INTEGER,
        required: true,
        allowNull: false
      },
      questionId:{
        type: DataTypes.INTEGER,
        required: true,
        allowNull: false
      },
      selectedAnsId:{
        type: DataTypes.INTEGER,
        
      },
      isQuestionAttempted:{
        type: DataTypes.INTEGER,
      },
      validAnsId:{
        type: DataTypes.INTEGER,
      },
      marks:{
        type: DataTypes.INTEGER,
        required: true,
        allowNull: false
      },
      CreatedBy: {
        type: DataTypes.STRING,
        required: true,
        allowNull: false
      },
      CreatedOn: {
        type: DataTypes.DATE,
        required: true,
        allowNull: true
      },
      UpdatedBy: {
        type: DataTypes.STRING,
        required: true,
        allowNull: false
      },
      UpdatedOn: {
        type: DataTypes.DATE,
        required: true,
        allowNull: false
      }
    }, {
      tableName: 'tbl_user_module_question_mapping',
      timestamps: false,
      paranoid: true
    })
    return masterUserModel
  }