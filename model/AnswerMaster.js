module.exports = (sequelize, DataTypes) => {
    const masterUserModel = sequelize.define('AnswerManager', {
        AnsId: {
            type: DataTypes.INTEGER,
            required: false,
            allowNull: true,
            primaryKey: true
          },
          AnsDescription: {
            type: DataTypes.STRING,
            required: true,
            allowNull: true
          },
          QuestionId: {
            type: DataTypes.STRING,
            required: true,
            allowNull: true
          },
          IsValid: {
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
      tableName: 'tbl_answer_master',
      timestamps: false,
      paranoid: true
    })
    return masterUserModel
  }