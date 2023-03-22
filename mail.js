const nodemailer = require("nodemailer");

require("dotenv").config();

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendMail(data) {
  const { to, cc, subject, html } = data;
  const mailOptions = {
    from: {
      name: "HR GKMIT",
      address: process.env.MAIL_USER,
    },
    to,
    subject,
    html,
    cc: cc || null,
  };
  const response = await transporter.sendMail(mailOptions);
  console.log(response.envelope);
  return;
}

module.exports = {
  sendMail,
};
