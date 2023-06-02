module.exports = (sequelize, DataTypes) => {
    const masterUserModel = sequelize.define('OrgManager', {
        OrgId: {
            type: DataTypes.INTEGER,
            required: false,
            allowNull: true,
            primaryKey: true
          },
          OrgName: {
            type: DataTypes.STRING,
            required: true,
            allowNull: true
          },
          OrgDescription: {
            type: DataTypes.STRING,
            required: true,
            allowNull: true
          },
          OrgLogo: {
            type: DataTypes.STRING,
            required: false,
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
          },
          isActive: {
            type: DataTypes.INTEGER,
            required: true,
            allowNull: true
          }
    }, {
      tableName: 'tbl_org_master',
      timestamps: false,
      paranoid: true
    })
    return masterUserModel
  }