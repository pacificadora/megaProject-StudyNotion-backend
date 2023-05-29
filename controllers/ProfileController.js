const CourseModel = require("../models/CourseModel");
const ProfileModel = require("../models/ProfileModel");
const UserModel = require("../models/UserModel");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
require("dotenv").config();
//updateProfile

exports.updateProfile = async (req, res) => {
  try {
    //get data
    const { gender, contactNumber, about = "", dateOfBirth = "" } = req.body;
    //get userId
    const userId = req.user.id;
    //validation
    if (!contactNumber || !gender) {
      return res.status(400).json({
        success: false,
        message: "please provide all info",
      });
    }
    //find profile
    const userDetails = await UserModel.findById(userId);
    const profileId = userDetails.additionalDetails;
    const profileDetails = await ProfileModel.findById(profileId);

    //update profile
    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.gender = gender;
    profileDetails.about = about;
    profileDetails.contactNumber = contactNumber;
    await profileDetails.save();
    //since we already have profile object, thats why we used save instead of create.
    return res.status(201).json({
      success: true,
      message: "profile details are saved successfully",
      data: profileDetails,
    });
    //return response
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "profile details cannot be saved, please try again",
      error: error.message,
    });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    //get id
    const id = req.user.id;
    //get user
    const userDetails = await UserModel.findById(id);
    //validate profile
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "user details are not found with the given id",
      });
    }
    //delete profile
    await ProfileModel.findByIdAndDelete({
      _id: userDetails.additionalDetails,
    });
    //HW: un-enroll user from all enrolled courses
    //delete user
    await UserModel.findByIdAndDelete({ _id: id });
    //return res
    return res.status(201).json({
      success: true,
      message: "userprofile and user is deleted successfully",
    });
  } catch (error) {
    return res.status(502).json({
      success: false,
      message: "error in deleting the user",
      error: error.message,
    });
  }
};

exports.getAllUserDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const userDetails = await UserModel.findById({ _id: userId })
      .populate("additionalDetails")
      .exec();
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "User details cannot be found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User details found",
      data: userDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong",
    });
  }
};

exports.updateDisplayPicture = async (req, res) => {
  try {
    //get the userId
    const userId = req.user.id;
    //get the image
    const pic = req.files.picture;
    //get the user
    const userDetails = await UserModel.findById({ _id: userId });
    //validate the user
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "user not found with the given id",
      });
    }
    //upload on cloudinary
    const image = await uploadImageToCloudinary(
      pic,
      process.env.FOLDER_NAME,
      1000,
      1000
    );
    //update the user display picture
    const updatedProfile = await UserModel.findByIdAndUpdate(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    );
    //return res;
    return res.status(200).json({
      success: true,
      message: "dp updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      success: false,
      message: "dp not updated, something went wrong",
    });
  }
};

exports.getEnrolledCourses = async (req, res) => {
  try {
    //get userId
    const userId = req.user.id;
    //get userDetails
    const userDetails = await UserModel.findById({ _id: userId })
      .populate("courses")
      .exec();
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userDetails}`,
      });
    }
    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
