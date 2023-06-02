module.exports = (sequelize, DataTypes) => {
    const masterUserModel = sequelize.define('UserRoleMapping', {
      UserID: {
        type: DataTypes.INTEGER,
        required: true,
        allowNull: false
      },
      RoleId: {
        type: DataTypes.INTEGER,
        required: true,
        allowNull: false
      },
      IsActive: {
        type: DataTypes.INTEGER,
        required: true,
        allowNull: false
      },
      CreatedBy: {
        type: DataTypes.INTEGER,
        required: true,
        allowNull: false
      },
      CreatedOn: {
        type: DataTypes.DATE,
        required: true,
        allowNull: true
      },
      UpdatedBy: {
        type: DataTypes.INTEGER,
        required: true,
        allowNull: false
      },
      UpdatedOn: {
        type: DataTypes.DATE,
        required: true,
        allowNull: false
      }
    }, {
      tableName: 'tbl_user_role_mapping',
      timestamps: false,
      paranoid: true
    })
    return masterUserModel
  }