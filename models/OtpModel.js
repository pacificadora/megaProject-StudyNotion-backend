const mongoose = require("mongoose");
const mailSenderForVerification = require("../utils/mailSender");

const otpSchema = mongoose.model({
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
async function sendVerificationMail(email, otp) {
  try {
    const mailResp = await mailSenderForVerification(
      email,
      "Verification Mail from Study Notion",
      otp
    );
    console.log("email sent successfully", mailResp);
  } catch (error) {}
}

otpSchema.pre("save", async function (next) {
  await sendVerificationMail(this.email, this.otp);
  next();
});

module.exports = mongoose.model("OtpModel", otpSchema);
