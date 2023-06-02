module.exports = (sequelize, DataTypes) => {
    const masterUserModel = sequelize.define('UserOrgMapping', {
      UserId: {
        type: DataTypes.INTEGER,
        required: true,
        allowNull: false,
        primaryKey: true
      },
      OrgId: {
        type: DataTypes.INTEGER,
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
        required: true,
        allowNull: true
      }
    }, {
      tableName: 'tbl_user_org_mapping',
      timestamps: false,
      paranoid: true
    })
    return masterUserModel
  }