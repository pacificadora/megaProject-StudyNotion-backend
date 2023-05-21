const userModel = require("../models/UserModel");
const otpModel = require("../models/OtpModel");
const otpGenerator = require("otp-generator");
const profileModel = require("../models/ProfileModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSenderForVerification = require("../utils/mailSender");
require("dotenv").config();
//sendotp
exports.sendOtp = async () => {
  try {
    const { email } = req.body;
    const userPresent = await userModel.find({ email });
    if (userPresent) {
      return res.status(400).json({
        success: false,
        message: "user already registered",
      });
    }

    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("opt-generated", otp);

    let checkOtpUnique = await otpModel.findOne({ otp: otp });

    while (result) {
      let otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      checkOtpUnique = await otpModel.findOne({ otp: otp });
    }

    //create an entry in otp model
    const payload = { email, otp };
    const otpBody = await otpModel.create(payload);
    return res.status(200).json({
      success: true,
      message: "Otp sent Successfully",
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "something went wrong, otp cannot be send",
    });
  }
};

//signup
exports.signUp = async () => {
  try {
    //data fetch
    const {
      email,
      firstName,
      lastName,
      phoneNo,
      password,
      confirmPassword,
      otp,
      accountType,
    } = req.body;

    //validate data
    if (
      (!email || !firstName, !lastName || !password || !confirmPassword || !otp)
    ) {
      return res.status(400).json({
        success: false,
        message: "please fill all the details",
      });
    }
    //validate user
    const userDetails = await userModel.findOne({ email });
    if (userDetails) {
      return res.status(400).json({
        success: false,
        message: "user already registered",
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "password does not match",
      });
    }

    //find most recent otp of the user and validate
    const recentOtp = await otpModel
      .find({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    if (recentOtp.length === 0) {
      return res.status(400).json({
        success: false,
        message: "otp not found",
      });
    }
    if (recentOtp[0] !== otp) {
      return res.status(400).json({
        success: false,
        message: "otp does not match",
      });
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //create a profile
    const profileDetails = await profileModel.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    const user = await userModel.create({
      firstName,
      lastName,
      email,
      phoneNo,
      password: hashedPassword,
      accountType,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });
    return res.status(201).json({
      success: true,
      user,
      message: "user is registered successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "user cannot be registered, please try again",
    });
  }
};

//login
exports.login = async () => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "please enter all the details",
      });
    }

    //check user exists or not
    const userDetails = await userModel
      .findOne({ email })
      .populate("additionalDetails");

    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "user does not exist with the given email",
      });
    }

    //match password
    const matchPassword = await bcrypt.compare(password, userDetails.password);
    if (!matchPassword) {
      return res.status(400).json({
        success: false,
        message: "password does not match",
      });
    }
    //generate jwt
    const payload = {
      email: userDetails.email,
      id: userDetails._id,
      accountType: userDetails.accountType,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });
    userDetails.token = token;
    userDetails.password = undefined;

    res.cookie("token", token, options).status(200).json({
      success: true,
      token,
      userDetails,
      message: "logged in successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "something went wrong, login failure, please try again",
    });
  }
};

//change password
exports.changePassword = async (req, res) => {
  try {
    //get data from body
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    //validate all the passwords
    const email = req.user.email;
    const userDetails = await userModel.findOne({ email });
    if (!bcrypt.compare(oldPassword, userDetails.password)) {
      return res.status(400).json({
        success: false,
        message: "old password is incorrect",
      });
    }
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "password does not match",
      });
    }
    //update password in db
    const updatedUser = await userModel.findOneAndUpdate(
      { email },
      { password: newPassword },
      { new: true }
    );
    //send mail - password updated
    const sendMail = await mailSenderForVerification(
      email,
      "Password Update Confirmation",
      `Your password has been updated. ${newPassword} is your new password`
    );
    //return the res
    return res.status(201).json({
      success: true,
      message: "password updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "password can not be updated, something went wrong",
    });
  }
};
