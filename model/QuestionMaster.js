module.exports = (sequelize, DataTypes) => {
    const masterUserModel = sequelize.define('QuestionManager', {
        QuestionId: {
            type: DataTypes.INTEGER,
            required: false,
            allowNull: true,
            primaryKey: true
          },
          QuestionDescription: {
            type: DataTypes.STRING,
            required: true,
            allowNull: true
          },
          QuestionType: {
            type: DataTypes.STRING,
            required: true,
            allowNull: true
          },
          MappingId: {
            type: DataTypes.INTEGER,
            required: true,
            allowNull: true
          },
          MappingType: {
            type: DataTypes.STRING,
            required: true,
            allowNull: true
          },
          Marks: {
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
      tableName: 'tbl_question_master',
      timestamps: false,
      paranoid: true
    })
    return masterUserModel
  }