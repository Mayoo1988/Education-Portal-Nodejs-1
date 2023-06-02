module.exports = (sequelize, DataTypes) => {
  const masterUserModel = sequelize.define('CourseManager', {
    CourseId: {
      type: DataTypes.INTEGER,
      required: false,
      allowNull: true,
      primaryKey: true
    },
    CourseName: {
      type: DataTypes.STRING,
      required: true,
      allowNull: true
    },
    CourseCode: {
      type: DataTypes.STRING,
      required: true,
      allowNull: true
    },
    CoursePosterImage: {
      type: DataTypes.STRING,
      required: false,
      allowNull: true
    },
    CourseDescription: {
      type: DataTypes.STRING,
      required: true,
      allowNull: true
    },
    categoryId: {
      type: DataTypes.INTEGER,
      required: true,
      allowNull: false
    },
    CreatedBy: {
      type: DataTypes.STRING,
      required: true,
      allowNull: true
    },
    CreatedOn: {
      type: DataTypes.DATE,
      required: true,
      allowNull: true
    },
    UpdatedBy: {
      type: DataTypes.STRING,
      required: true,
      allowNull: true
    },
    UpdatedOn: {
      type: DataTypes.DATE,
      required: false,
      allowNull: true
    },
    userId:{
      type: DataTypes.INTEGER,
      required: true,
      allowNull: true
    },
    isActive:{
      type: DataTypes.INTEGER,
      required: true,
      allowNull: true
    },
  }, {
    tableName: 'tbl_course_master',
    timestamps: false,
    paranoid: true
  })
  return masterUserModel
}
