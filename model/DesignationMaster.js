module.exports = (sequelize, DataTypes) => {
    const masterUserModel = sequelize.define('tbl_designation_master', {

        DesignationId: {
            type: DataTypes.INTEGER,
            required: true,
            allowNull: false,
            primaryKey: true
          },
          DesignationName: {
            type: DataTypes.STRING,
            required: true,
            allowNull: true
          },
          Createdby: {
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
      tableName: 'tbl_module_master',
      timestamps: false,
      paranoid: true
    })
    return masterUserModel
  }