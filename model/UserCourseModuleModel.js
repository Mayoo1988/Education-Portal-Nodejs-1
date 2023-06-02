module.exports = (sequelize, DataTypes) => {
    const masterUserModel = sequelize.define('UserCourseModuleModel', {
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
      status:{
        type: DataTypes.STRING,
        required: true,
        allowNull: false
      },
      moduleID:{
        type: DataTypes.INTEGER,
        required: true,
        allowNull: false
      },
      totalQuestions:{
        type: DataTypes.INTEGER,
        required: true,
        allowNull: false
      },
      completedQuestions:{
        type: DataTypes.INTEGER,
        required: true,
        allowNull: false
      },
      score:{
        type: DataTypes.INTEGER,
      },
      createdBy: {
        type: DataTypes.STRING,
        required: true,
        allowNull: false
      },
      createdOn: {
        type: DataTypes.DATE,
        required: true,
        allowNull: true
      },
      updatedBy: {
        type: DataTypes.STRING,
        required: true,
        allowNull: false
      },
      updatedOn: {
        type: DataTypes.DATE,
        required: true,
        allowNull: false
      }
    }, {
      tableName: 'tbl_user_module_mapping',
      timestamps: false,
      paranoid: true
    })
    return masterUserModel
  }
