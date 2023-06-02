module.exports = (sequelize, DataTypes) => {
  const moduleQuesMapping = sequelize.define('moduleQuesMapping', {
    id: {
      type: DataTypes.INTEGER,
      required: false,
      primaryKey: true,
      autoIncrement: true
    },
    module_id: {
      type: DataTypes.INTEGER,
      required: true,
      allowNull: false
    },
    question_id: {
      type: DataTypes.INTEGER,
      required: true,
      allowNull: true
    },
    status: {
      type: DataTypes.TINYINT,
      required: true,
      allowNull: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      required: true,
      allowNull: true
    },
    created_on: {
      type: DataTypes.DATE,
      required: false,
      allowNull: true
    },
    updated_by: {
      type: DataTypes.INTEGER
    },
    updated_on: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'tbl_module_question_mapping',
    timestamps: false,
    paranoid: true
  })
  return moduleQuesMapping
}
