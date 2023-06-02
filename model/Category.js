'use strict';

module.exports = (sequelize, DataTypes) => {
  var Category = sequelize.define('Category', {
    Category_Id: {
      type: DataTypes.INTEGER,
      required: false,
      primaryKey: true,
      autoIncrement: true
    },
    CategoryName: {
      type: DataTypes.STRING,
      required: true,
      allowNull: false
    },
    CreatedBy: {
      type: DataTypes.INTEGER,
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
    IsActive: {
      type: DataTypes.INTEGER
    }
  }, {
    tableName: 'tbl_category_master',
    timestamps: false,
    paranoid: true
  })
  return Category
}
