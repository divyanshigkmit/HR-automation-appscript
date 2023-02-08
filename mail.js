const nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendMail(recipient, subject, body) {
  const mailOptions = {
    from: "divyanshi@gkmit.co",
    to: recipient,
    subject: subject,
    html: body,
  };

  transporter.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.log(error);
    } else {
      console.log(response.envelope);
    }
  });
}

module.exports = {
  sendMail,
};
