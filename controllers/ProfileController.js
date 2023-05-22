const ProfileModel = require("../models/ProfileModel");
const UserModel = require("../models/UserModel");
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

exports.deleteProfile = async () => {
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

exports.getAll;
