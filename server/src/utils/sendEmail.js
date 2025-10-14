const nodemailer = require('nodemailer');
const crypto = require("crypto");

const sendEmail = async (email, subject, message) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // or any SMTP provider
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"AnokhiAda" <${process.env.MAIL_USER}>`,
    to: email,
    subject,
    html: message,
  });
};



function generateOTP(length = 6) {
  const digits = "0123456789";
  let otp = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, digits.length);
    otp += digits[randomIndex];
  }

  return otp;
}


module.exports = {sendEmail , generateOTP};