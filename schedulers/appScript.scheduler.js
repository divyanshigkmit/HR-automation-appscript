const https = require("https");
const emoji = require("node-emoji");
require("dotenv").config();
const cron = require("node-cron");
const ejs = require("ejs");
const path = require("path");
const { sequelize } = require("../models");

const models = require("../models");
const mailer = require("../mail");
const {
  generateBirthdayContent,
  generateWorkAnniversaryContent,
  generateMarriageAnniversaryContents,
} = require("../content");

/**
 * Handles the actual sending request.
 * We're turning the https.request into a promise here for convenience
 * @param webhookURL
 * @param messageBody
 * @return {Promise}
 */
https: function sendSlackMessage(webhookURL, messageBody) {
  // make sure the incoming message body can be parsed into valid JSON
  try {
    messageBody = JSON.stringify(messageBody);
  } catch (e) {
    throw new Error("Failed to stringify messageBody", e);
  }

  // Promisify the https.request
  return new Promise((resolve, reject) => {
    // general request options, we defined that it's a POST request and content is JSON
    const requestOptions = {
      method: "POST",
      header: {
        "Content-Type": "application/json",
      },
    };

    // actual request
    const req = https.request(webhookURL, requestOptions, (res) => {
      let response = "";

      res.on("data", (d) => {
        response += d;
      });

      // response finished, resolve the promise with data
      res.on("end", () => {
        resolve(response);
      });
    });

    // there was an error, reject the promise
    req.on("error", (e) => {
      reject(e);
    });

    // send our message body (was parsed to JSON beforehand)
    req.write(messageBody);
    req.end();
  });
}

function renderFileAsync(templatePath, data) {
  return new Promise((resolve) => {
    ejs.renderFile(templatePath, data, (err, templateData) => {
      resolve(templateData);
    });
  });
}

// return in string - people having any event
const pushInArrayAndReturnString = (employees, emails) => {
  let stringForSlack = ``;
  let stringForMail = ``;
  let imageUrlBase;
  for (const employee of employees) {
    emails.push(employee.email);
    stringForSlack += `<@${employee.member_id}>, `;
    stringForMail += `${employee.name.split(" ")[0]}, `;
  }
  stringForSlack = stringForSlack.slice(0, -2);
  stringForMail = stringForMail.slice(0, -2);

  imageUrlBase = stringForMail.split(", ");
  imageUrlBase = imageUrlBase.sort().join("_");
  imageUrlBase = imageUrlBase.toLowerCase();

  stringForSlack = stringForSlack.replace(/,(?=[^,]+$)/, " and");
  stringForMail = stringForMail.replace(/,(?=[^,]+$)/, " and");

  return {
    stringForSlack,
    stringForMail,
    imageUrlBase,
  };
};

const sendMail = async (employeeName, to, subject, tempateName, imageUrl) => {
  const templatePath = path.resolve(`./templates/${tempateName}.ejs`);
  const html = await renderFileAsync(templatePath, {
    employeeName,
    imageUrl,
  });
  const cc = "team@gkmit.co";
  await mailer.sendMail({
    to,
    subject,
    html,
    cc: cc,
  });
};

const birthdayJob = async () => {
  try {
    let birthdayEmails = [];

    // Check for birthday
    const havingBirthday = await sequelize.query(
      `
  SELECT member_id, email, name
  FROM employee
  WHERE DATE_PART('day', date_of_birth) = DATE_PART('day', CURRENT_DATE)
  AND DATE_PART('month', date_of_birth) = DATE_PART('month', CURRENT_DATE)
`,
      { type: sequelize.QueryTypes.SELECT }
    );

    if (!havingBirthday.length) throw new Error("No birthday today!"); //If not exist
    const havingBirthdayString = pushInArrayAndReturnString(
      havingBirthday,
      birthdayEmails
    );

    const birthdayContent = generateBirthdayContent(
      havingBirthdayString.stringForSlack
    );
    const imageUrl = `${process.env.S3_URL}${
      havingBirthdayString.imageUrlBase + "_birthday.png"
    }`;

    // Birthday message
    const birthdayNotification = {
      text: `<!channel> - ${birthdayContent} ${emoji.emojify(
        ":confetti_ball::tada::gift::birthday::clap:"
      )}`,
      attachments: [
        {
          image_url: imageUrl,
          text: `${havingBirthdayString.imageUrlBase}_birthday`,
          short: true,
        },
      ],
    };
    console.log(birthdayNotification);

    sendSlackMessage(process.env.WEBHOOK_URL, birthdayNotification);

    await sendMail(
      havingBirthdayString.stringForMail,
      birthdayEmails,
      "Happy Birthday",
      "employeeBirthday",
      imageUrl
    );
  } catch (error) {
    console.log("birthdayJob error: ", error);
  }
};

const workAnniverasryJob = async () => {
  try {
    let workAnniversaryEmails = [];

    // Check for birthday
    const havingWorkAnniversary = await sequelize.query(
      `
  SELECT member_id, email, name
  FROM employee
  WHERE DATE_PART('day', date_of_joining) = DATE_PART('day', CURRENT_DATE)
  AND DATE_PART('month', date_of_joining) = DATE_PART('month', CURRENT_DATE)
`,
      { type: sequelize.QueryTypes.SELECT }
    );

    if (!havingWorkAnniversary.length)
      throw new Error("No work anniversary today!"); //If not exist

    const havingWorkAnniversaryString = pushInArrayAndReturnString(
      havingWorkAnniversary,
      workAnniversaryEmails
    );

    const workAnniverasryContent = generateWorkAnniversaryContent(
      havingWorkAnniversaryString.stringForSlack
    );
    const imageUrl = `${process.env.S3_URL}${
      havingWorkAnniversaryString.imageUrlBase + "_work.png"
    }`;

    // Marriage anniversary message
    const marriageAnniversaryNotification = {
      text: `<!channel> - ${workAnniverasryContent} ${emoji.emojify(
        ":confetti_ball::tada::gift::dancer::gift_heart:"
      )}`,
      attachments: [
        {
          image_url: imageUrl,
          text: `${havingWorkAnniversaryString.imageUrlBase}_work_anniversary`,
        },
      ],
    };
    console.log(marriageAnniversaryNotification);
    sendSlackMessage(process.env.WEBHOOK_URL, marriageAnniversaryNotification);

    await sendMail(
      havingWorkAnniversaryString.stringForMail,
      workAnniversaryEmails,
      "Happy Work Anniversary",
      "workAnniversary",
      imageUrl
    );
  } catch (error) {
    console.log("workAnniverasryJob error: ", error);
  }
};

const marriageAnniverasryJob = async () => {
  try {
    let marriageAnniversaryEmails = [];

    // Check for birthday
    const havingMarriageAnniversary = await sequelize.query(
      `
  SELECT member_id, email, name
  FROM employee
  WHERE DATE_PART('day', marriage_anniversary) = DATE_PART('day', CURRENT_DATE)
  AND DATE_PART('month', marriage_anniversary) = DATE_PART('month', CURRENT_DATE)
`,
      { type: sequelize.QueryTypes.SELECT }
    );
    if (!havingMarriageAnniversary.length)
      throw new Error("No marriage anniversary today!"); //If not exist

    const havingMarriageAnniversaryString = pushInArrayAndReturnString(
      havingMarriageAnniversary,
      marriageAnniversaryEmails
    );

    const marriageAnniversaryContent = generateMarriageAnniversaryContents(
      havingMarriageAnniversaryString.stringForSlack
    );
    const imageUrl = `${process.env.S3_URL}${
      havingMarriageAnniversaryString.imageUrlBase + "_marriage.png"
    }`;

    // Marriage anniversary message
    const marriageAnniversaryNotification = {
      text: `<!channel> - ${marriageAnniversaryContent} ${emoji.emojify(
        ":confetti_ball::tada::gift::dancer::gift_heart:"
      )}`,
      attachments: [
        {
          image_url: imageUrl,
          text: `${havingMarriageAnniversaryString.imageUrlBase}_marriage_anniversary`,
        },
      ],
    };
    console.log(marriageAnniversaryNotification);
    sendSlackMessage(process.env.WEBHOOK_URL, marriageAnniversaryNotification);

    await sendMail(
      havingMarriageAnniversaryString.stringForMail,
      marriageAnniversaryEmails,
      "Happy Marriage Anniversary",
      "marriageAnniversary",
      imageUrl
    );
  } catch (error) {
    console.log("marriageAnniverasryJob error: ", error);
  }
};

const employeeFamilyBirthdayJob = async () => {
  try {
    // Check for birthday
    const havingBirthday = await sequelize.query(
      `
  SELECT employee_family.name as name, employee.name as employee_name, employee.email as email
  FROM employee_family
  INNER JOIN employee ON employee.id = employee_family.employee_id
  WHERE DATE_PART('day', employee_family.date_of_birth) = DATE_PART('day', CURRENT_DATE)
  AND DATE_PART('month', employee_family.date_of_birth) = DATE_PART('month', CURRENT_DATE)
`,
      { type: sequelize.QueryTypes.SELECT }
    );

    if (!havingBirthday.length)
      throw new Error("No employees' family birthday today!"); //If not exist

    for (const employeeFamily of havingBirthday) {
      const imageUrl = `${process.env.S3_URL}${
        employeeFamily.name.split(" ")[0].toLowerCase() + "_birthday.png"
      }`;
      const templatePath = path.resolve(
        "./templates/employeeFamilyBirthday.ejs"
      );
      const html = await renderFileAsync(templatePath, {
        employeeName: employeeFamily.employee_name.split(" ")[0],
        employeeFamilyName: employeeFamily.name.split(" ")[0],
        imageUrl,
      });
      let subject = `${employeeFamily.name.split(" ")[0]}, Happy Birthday`;
      await mailer.sendMail({
        to: employeeFamily.email,
        subject,
        html,
      });
    }
  } catch (error) {
    console.log("employeeFamilyBirthdayJob error: ", error);
  }
};

// main
const appScript = function () {
  cron.schedule(
    process.env.SCRIPT_SCHEDULER_TIME,
    async () => {
      if (!process.env.WEBHOOK_URL) {
        console.error("Please fill in your Webhook URL");
      }

      console.log("Sending slack message");
      try {
        await employeeFamilyBirthdayJob();
        await birthdayJob();
        await workAnniverasryJob();
        await marriageAnniverasryJob();
      } catch (error) {
        console.error("There was a error with the request", error);
      }
    },
    {
      timezone: "Asia/Kolkata",
    }
  );
};

module.exports = { appScript };
