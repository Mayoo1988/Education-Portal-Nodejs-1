'use strict';

module.exports = (sequelize, DataTypes) => {
  const masterUserModel = sequelize.define('ModuleManager', {
    ModuleId: {
      type: DataTypes.INTEGER,
      required: false,
      allowNull: true,
      primaryKey: true
    },
    CourseId: {
      type: DataTypes.INTEGER,
      required: true,
      allowNull: true
    },
    ModuleName: {
      type: DataTypes.STRING,
      required: true,
      allowNull: true
    },
    ModuleCaption:{
      type: DataTypes.STRING,
      required: true,
      allowNull: true
    },
    ModuleCode: {
      type: DataTypes.STRING,
      required: true,
      allowNull: true
    },
    ModuleDescription: {
      type: DataTypes.STRING,
      required: true,
      allowNull: true
    },
    ImageFile:{
      type: DataTypes.STRING,
      required: false,
      allowNull: true
    },
    videoFile:{
      type: DataTypes.STRING,
      required: false,
      allowNull: true
    },
    questionsId:{
      type: DataTypes.STRING,
      required: true,
      allowNull: true
    },
    CreatedBy: {
      type: DataTypes.STRING,
      required: true,
      allowNull: true
    },
    CreatedOn: {
      type: DataTypes.DATE,
      required: false,
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
    isActive: {
      type: DataTypes.INTEGER,
      required: true,
      allowNull: true
    },
    orgId: {
      type: DataTypes.INTEGER,
      required: false,
      allowNull: true
    }
  }, {
    tableName: 'tbl_module_master',
    timestamps: false,
    paranoid: true
  })

  return masterUserModel
}
