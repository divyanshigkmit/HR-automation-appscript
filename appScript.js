const https = require("https");
var emoji = require("node-emoji");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

const client = require("./config/db");
const mailer = require("./mail");

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

// return in string - people having any event
const pushInArrayAndReturnString = (rows, names, emails) => {
  if (rows.length == 1) {
    names.push(rows[0].name);
    emails.push(rows[0].email);
    return rows[0].name.split(" ")[0];
  }
  let havingEventString = "";
  for (let i = 0; i < rows.length; i++) {
    names.push(rows[i].name);
    emails.push(rows[i].email);
    havingEventString += rows[i].name.split(" ")[0];
    if (!(i >= rows.length - 2)) havingEventString += ", ";
    else if (i == rows.length - 2) havingEventString += " and ";
  }
  return havingEventString;
};

const sendMail = async (names, emails, mailSubject, htmlFile) => {
  for (let i = 0; i < names.length; i++) {
    let subject = `${names[i].split(" ")[0]}, ${mailSubject}`;
    let email = emails[i];
    let template = fs.readFileSync(
      path.resolve(`./templates/${htmlFile}`),
      "utf8"
    );
    template = template.replace("{{userName}}", names[i].split(" ")[0]);

    await mailer.sendMail(email, subject, template);
  }
};

const birthdayJob = async () => {
  try {
    let birthdayNames = [],
      birthdayEmails = [];

    // Check for birthday
    const havingBirthday =
      await client.query(`select * from anniversaries_and_birthdays 
  WHERE DATE_PART('day', date_of_birth) = date_part('day', CURRENT_DATE)
  AND
  DATE_PART('month', date_of_birth) = date_part('month', CURRENT_DATE);`);

    if (!havingBirthday.rowCount) throw new Error("No birthday today!"); //If not exist

    const imageUrl =
      await client.query(`select birthday_url from day_image_mapping 
  WHERE day = date_part('day', CURRENT_DATE)
  AND
  month = date_part('month', CURRENT_DATE) LIMIT 1;`);

    const havingBirthdayString = pushInArrayAndReturnString(
      havingBirthday.rows,
      birthdayNames,
      birthdayEmails
    );

    // Birthday message
    const birthdayNotification = {
      text: `<!channel> - Wishing you a beautiful day with good health and happiness forever.\nHappy birthday, ${havingBirthdayString}! ${emoji.emojify(
        ":confetti_ball::tada::gift::birthday::clap:"
      )}`,
      attachments: [
        {
          image_url: imageUrl.rows[0].birthday_url,
          text: `${havingBirthdayString}'s Birthday`,
        },
      ],
    };
    sendSlackMessage(process.env.WEBHOOK_URL, birthdayNotification);
    //   Send mail
    await sendMail(
      birthdayNames,
      birthdayEmails,
      "Wish you a very Happy Birthday!",
      "birthday.html"
    );
  } catch (error) {
    console.log("Message: ", error.message);
  }
};

const workAnniverasryJob = async () => {
  try {
    let workAnniversaryNames = [],
      workAnniversaryEmails = [];

    // Check for birthday
    const havingWorkAnniversary =
      await client.query(`select * from anniversaries_and_birthdays 
  WHERE DATE_PART('day', date_of_joining) = date_part('day', CURRENT_DATE)
  AND
  DATE_PART('month', date_of_joining) = date_part('month', CURRENT_DATE);`);

    if (!havingWorkAnniversary.rowCount)
      throw new Error("No work anniversary today!"); //If not exist

    const imageUrl =
      await client.query(`select work_anniversary_url from day_image_mapping 
  WHERE day = date_part('day', CURRENT_DATE)
  AND
  month = date_part('month', CURRENT_DATE) LIMIT 1;`);

    const havingWorkAnniversaryString = pushInArrayAndReturnString(
      havingWorkAnniversary.rows,
      workAnniversaryNames,
      workAnniversaryEmails
    );

    // Marriage anniversary message
    const marriageAnniversaryNotification = {
      text: `<!channel> - Wishing you all the love and happiness on your anniversary. Enjoy looking back on all of your special memories together.\nHappy Wedding Anniversary, ${havingWorkAnniversaryString}! ${emoji.emojify(
        ":confetti_ball::tada::gift::dancer::gift_heart:"
      )}`,
      attachments: [
        {
          image_url: imageUrl.rows[0].work_anniversary_url,
          text: `${havingWorkAnniversaryString}'s Work Anniversary`,
        },
      ],
    };
    sendSlackMessage(process.env.WEBHOOK_URL, marriageAnniversaryNotification);
    // Send mail
    await sendMail(
      workAnniversaryNames,
      workAnniversaryEmails,
      "Wish you a very Happy Work Anniversary!",
      "birthday.html"
    );
  } catch (error) {
    console.log("Message: ", error.message);
  }
};

const marriageAnniverasryJob = async () => {
  try {
    let marriageAnniversaryNames = [],
      marriageAnniversaryEmails = [];

    // Check for birthday
    const havingMarriageAnniversary =
      await client.query(`select * from anniversaries_and_birthdays 
  WHERE DATE_PART('day', wedding_anniversary) = date_part('day', CURRENT_DATE)
  AND
  DATE_PART('month', wedding_anniversary) = date_part('month', CURRENT_DATE);`);
    if (!havingMarriageAnniversary.rowCount)
      throw new Error("No marriage anniversary today!"); //If not exist

    const imageUrl =
      await client.query(`select marriage_anniversary_url from day_image_mapping 
  WHERE day = date_part('day', CURRENT_DATE)
  AND
  month = date_part('month', CURRENT_DATE) LIMIT 1;`);

    const havingMarriageAnniversaryString = pushInArrayAndReturnString(
      havingMarriageAnniversary.rows,
      marriageAnniversaryNames,
      marriageAnniversaryEmails
    );

    // Marriage anniversary message
    const marriageAnniversaryNotification = {
      text: `<!channel> - Wishing you all the love and happiness on your anniversary. Enjoy looking back on all of your special memories together.\nHappy Wedding Anniversary, ${havingMarriageAnniversaryString}! ${emoji.emojify(
        ":confetti_ball::tada::gift::dancer::gift_heart:"
      )}`,
      attachments: [
        {
          image_url: imageUrl.rows[0].marriage_anniversary_url,
          text: `${havingMarriageAnniversaryString}'s Marriage Anniversary`,
        },
      ],
    };
    sendSlackMessage(process.env.WEBHOOK_URL, marriageAnniversaryNotification);
    // Send mail
    await sendMail(
      marriageAnniversaryNames,
      marriageAnniversaryEmails,
      "Wish you a very Happy Marriage Anniversary!",
      "birthday.html"
    );
  } catch (error) {
    console.log("Message: ", error.message);
  }
};

// main
(async function () {
  if (!process.env.WEBHOOK_URL) {
    console.error("Please fill in your Webhook URL");
  }

  console.log("Sending slack message");
  await birthdayJob();
  await workAnniverasryJob();
  await marriageAnniverasryJob();
})();
