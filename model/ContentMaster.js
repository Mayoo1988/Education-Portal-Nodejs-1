module.exports = (sequelize, DataTypes) => {
    const masterUserModel = sequelize.define('ContentManager', {
        Contentid: {
            type: DataTypes.INTEGER,
            required: false,
            allowNull: true,
            primaryKey: true
          },
          Moduleid: {
            type: DataTypes.INTEGER,
            required: true,
            allowNull: false
          },
          CourseId: {
            type: DataTypes.INTEGER,
            required: true,
            allowNull: false
          },
          ContentTypeId: {
            type: DataTypes.INTEGER,
            required: true,
            allowNull: false
          },
          ContentPath: {
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
          }
    }, {
      tableName: 'tbl_content_master',
      timestamps: false,
      paranoid: true
    })
    return masterUserModel
  }