const { google } = require("googleapis");
const fs = require("fs");
const cron = require("node-cron");

const models = require("../models");

let SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

const insertEmployeeData = async (employeeDetails) => {
  const filterEmployeeDetails = [];
  for (const employeeDetail of employeeDetails) {
    const employeeDetailObject = {
      name: employeeDetail[0],
      email: employeeDetail[1],
      dateOfBirth: employeeDetail[2],
      dateOfJoining: employeeDetail[3],
      marriageAnniversary: employeeDetail[4] || null,
      memberId: employeeDetail[5],
    };
    filterEmployeeDetails.push(employeeDetailObject);
  }
  await models.Employee.destroy({
    where: {},
  });

  await models.Employee.bulkCreate(filterEmployeeDetails);

  return;
};

const insertEmployeeFamilyData = async (employeeFamilyDetails) => {
  const filterEmployeeFamilyDetails = [];
  for (const employeeFamilyDetail of employeeFamilyDetails) {
    const employeeId = await models.Employee.findOne({
      where: {
        name: employeeFamilyDetail[0],
      },
      attributes: ["id"],
    });

    const employeeFamilyDetailObject = {
      employeeId: employeeId.dataValues.id,
      name: employeeFamilyDetail[1],
      dateOfBirth: employeeFamilyDetail[2],
    };
    filterEmployeeFamilyDetails.push(employeeFamilyDetailObject);
  }

  await models.EmployeeFamily.bulkCreate(filterEmployeeFamilyDetails);
  return;
};

const employeeDatabaseUpdate = async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: SCOPES,
  });
  const authClientObject = await auth.getClient();
  const googleSheetsInstance = google.sheets({
    version: "v4",
    auth: authClientObject,
  });
  const spreadsheetId = process.env.SPREAD_SHEET_ID;
  const employeeDetails = await googleSheetsInstance.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "employee!A2:f", //range of cells to read from.
  });
  const employeeFamilyDetails =
    await googleSheetsInstance.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: "employee_family!A2:c", //range of cells to read from.
    });
  await insertEmployeeData(employeeDetails.data.values);
  await insertEmployeeFamilyData(employeeFamilyDetails.data.values);
};

const employeeDatabaseUpdateScheduler = function () {
  cron.schedule(
    process.env.EMPLOYEE_DATABASE_UPDATE_SCHEDULER_TIME,
    async () => {
      try {
        console.log("file upload started");
        await employeeDatabaseUpdate();
        console.log("file upload finished");
      } catch (error) {
        console.log("employeeDatabaseUpdateScheduler", error);
      }
    },
    {
      timezone: "Asia/Kolkata",
    }
  );
};

module.exports = { employeeDatabaseUpdateScheduler };
