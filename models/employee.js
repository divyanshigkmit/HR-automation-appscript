"use strict";
const { Model, Sequelize } = require("sequelize");
module.exports = (sequelize) => {
  class Employee extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.EmployeeFamily, {
        foreignKey: "employeeId",
        as: "employee",
      });
    }
  }
  Employee.init(
    {
      name: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
      },
      memberId: {
        type: Sequelize.STRING,
      },
      dateOfBirth: {
        type: Sequelize.DATEONLY,
      },
      dateOfJoining: {
        type: Sequelize.DATEONLY,
      },
      marriageAnniversary: {
        type: Sequelize.DATEONLY,
      },
    },
    {
      sequelize,
      modelName: "Employee",
      tableName: "employee",
    }
  );
  return Employee;
};
