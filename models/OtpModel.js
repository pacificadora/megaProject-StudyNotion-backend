const mongoose = require("mongoose");
const mailSenderForVerification = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    require: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 5 * 60,
  },
});

//adding the pre-hook of sending the mail for otp verification
async function sendVerificationEMail(email, otp) {
  // Create a transporter to send emails

  // Define the email options

  // Send the email
  try {
    const mailResp = await mailSenderForVerification(
      email,
      "Verification Mail from Study Notion",
      emailTemplate(otp)
    );
    console.log("email sent successfully", mailResp);
  } catch (error) {}
}

otpSchema.pre("save", async function (next) {
  console.log("New document saved to database");
  if (this.isNew) {
    await sendVerificationEMail(this.email, this.otp);
  }
  next();
});

module.exports = mongoose.model("OtpModel", otpSchema);
