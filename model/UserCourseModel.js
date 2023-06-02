module.exports = (sequelize, DataTypes) => {
    const masterUserModel = sequelize.define('UserCourseModel', {
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
      completedModules:{
        type: DataTypes.INTEGER
      },
      totalModules:{
        type: DataTypes.INTEGER
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
      assignedOn:{
        type: DataTypes.DATE,
      },
      completedOn:{
        type: DataTypes.DATE,
      },
      updatedBy: {
        type: DataTypes.STRING
      },
      updatedOn: {
        type: DataTypes.DATE,
        default: new Date()
      }
    }, {
      tableName: 'tbl_user_course_mapping',
      timestamps: false,
      paranoid: true
    })
    return masterUserModel
  }
