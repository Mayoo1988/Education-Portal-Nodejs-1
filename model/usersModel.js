
module.exports = (sequelize, DataTypes) => {
  const LoginModel = sequelize.define('usersModel', {
    userId: {
      type: DataTypes.BIGINT,
     // required: true,
     // allowNull: true,
      primaryKey: true,
      autoIncrement: true
    },
    userCode: {
      type: DataTypes.STRING,
      required: true,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING,
      required: true,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      required: true,
      allowNull: false
    },
    email_Id: {
      type: DataTypes.STRING,
      required: true,
      allowNull: false
    },
    mobileNo: {
      type: DataTypes.STRING,
      required: true,
      allowNull: false
    },
    photoPath: {
      type: DataTypes.STRING,
      required: false,
      allowNull: true
    },
    roleId: {
      type: DataTypes.TINYINT,
      required: true,
      allowNull: false
    },
    isActive: {
      type: DataTypes.TINYINT,
      required: true,
      allowNull: false
    },
    joiningDate: {
      type: DataTypes.STRING,
      required: true,
      allowNull: false
    },
    createdBy: {
      type: DataTypes.STRING
    },
    createdOn: {
      type: DataTypes.DATE,
      required: true,
      allowNull: false
    },
    updatedBy: {
      type: DataTypes.STRING,
      required: false,
      allowNull: true
    },
    updatedOn: {
      type: DataTypes.DATE
    },
    password: {
      type: DataTypes.STRING,
      required: true,
      allowNull: false
    },
    orgId: {
      type: DataTypes.BIGINT,
      required: false,
      allowNull: true
    }
  }, {
    tableName: 'tbl_login',
    timestamps: false,
    paranoid: true
  })
  return LoginModel
}
