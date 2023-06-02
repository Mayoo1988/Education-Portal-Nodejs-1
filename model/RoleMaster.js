module.exports = (sequelize, DataTypes) => {
    const masterUserModel = sequelize.define('RoleManager', {

        roleid: {
            type: DataTypes.INTEGER,
            required: false,
            allowNull: true,
            primaryKey: true
          },
          roleName: {
            type: DataTypes.STRING,
            required: true,
            allowNull: true
          },
          roleDescription: {
            type: DataTypes.STRING,
            required: true,
            allowNull: true
          },
          createdBy: {
            type: DataTypes.INTEGER
          },
          createdOn: {
            type: DataTypes.DATE,
            required: true,
            allowNull: true
          },
          updatedBy: {
            type: DataTypes.INTEGER
          },
          updatedOn: {
            type: DataTypes.DATE,
            required: true,
            allowNull: true
          },
          isActive:{
            type: DataTypes.INTEGER,
            required: true,
            allowNull: false
          }
     }, {
      tableName: 'tbl_role_master',
      timestamps: false,
      paranoid: true
    })
    return masterUserModel
    }