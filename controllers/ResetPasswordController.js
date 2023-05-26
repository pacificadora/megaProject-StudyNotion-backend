const UserModel = require("../models/UserModel");
const mailSender = require("../utils/mailSender");
//resetPasswordToken - this will send the email
exports.resetPasswordToken = async (req, res) => {
  try {
    //get email
    const { email } = req.body;
    //check user present or not
    const userDetails = await UserModel.findOne({ email });
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "no user present with given email",
      });
    }
    //token generation
    const token = crypto.randomBytes(20).toString("hex");
    //link creation
    const url = `http://localhost:3000/update-password/${token}`;
    //update user by adding token and expiry time
    const updateUserDetails = await UserModel.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      { new: true }
    );
    //send mail
    await mailSender(
      email,
      "Password Reset Link",
      `Password Reset Link : ${url}`
    );
    //return res
    return res.status(201).json({
      success: true,
      message: "link to the registered email has been sent",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "link cannot be sent, something went wrong",
    });
  }
};

//resetPassword
exports.resetPassword = async () => {
  try {
    const { token, password, confirmPassword } = req.body;
    //token body me kaise aaya, humne to url me send kiya tha??
    //frontend walo ne dala h isse body me.
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "password does not match",
      });
    }
    const userDetails = await UserModel.findOne({ token: token });
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "token is invalid",
      });
    }
    const expiryTime = userDetails.resetPasswordExpires;
    if (expiryTime < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "link has expired",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await UserModel.findOneAndUpdate(
      { token: token },
      { password: hashedPassword },
      { new: true }
    );

    return res.status(201).json({
      success: true,
      message: "password reset successful",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "something went wrong, password cannot be set",
    });
  }
};
