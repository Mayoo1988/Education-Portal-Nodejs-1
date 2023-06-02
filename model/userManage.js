module.exports = (sequelize, DataTypes) => {
    const masterUserModel = sequelize.define('userManage', {
      user_id: {
        type: DataTypes.STRING,
        required: true,
        allowNull: false,
        primaryKey: true
      },
      email_id: {
        type: DataTypes.STRING,
        required: true,
        allowNull: false
      },
      password: {
        type: DataTypes.STRING,
        required: true,
        allowNull: true
      },
      first_name: {
        type: DataTypes.STRING,
        required: true,
        allowNull: false
      },
      last_name: {
        type: DataTypes.STRING,
        required: true,
        allowNull: true
      },
      vertical_id: {
        type: DataTypes.INTEGER,
        required: true,
        allowNull: false
      },
      dept_id: {
        type: DataTypes.INTEGER,
        required: true,
        allowNull: false
      },
      token_id: {
        type: DataTypes.INTEGER,
        required: true,
        allowNull: true
      },
      is_mll: {
        type: DataTypes.TINYINT,
        required: true,
        allowNull: true
      },
      mobile_no: {
        type: DataTypes.INTEGER,
        required: true,
        allowNull: true
      },
      auth_token: {
        type: DataTypes.STRING,
        required: true,
        allowNull: true
      },
      status: {
        type: DataTypes.STRING,
        required: true,
        allowNull: true
      },
      created_by: {
        type: DataTypes.INTEGER
      },
      created_on: {
        type: DataTypes.DATE,
        required: true,
        allowNull: true
      },
      updated_by: {
        type: DataTypes.INTEGER
      },
      updated_on: {
        type: DataTypes.DATE
      }
    }, {
      tableName: 'users',
      timestamps: false,
      paranoid: true
    })
    return masterUserModel
  }