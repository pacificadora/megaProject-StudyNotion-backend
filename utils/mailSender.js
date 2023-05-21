const nodeMailer = require("nodemailer");
require("dotenv").config();

const mailSenderForVerification = async (email, title, body) => {
  try {
    const transporter = nodeMailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: "Study Notion",
      to: email,
      subject: title,
      html: body,
    });
    console.log(info);
    return info;
  } catch (error) {
    console.log("error in mailSender", error);
  }
};

module.exports = mailSenderForVerification;
