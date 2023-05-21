const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  accountType: {
    type: String,
    required: true,
    enum: ["Admin", "Student", "Instructor"],
  },
  additionalDetails: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "ProfileModel",
  },
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseModel",
    },
  ],
  image: {
    type: String,
  },

  token: {
    type: String,
  },

  resetPasswordExpires: {
    type: Date,
  },
  courseProgress: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseProgressModel",
    },
  ],
});

module.exports = mongoose.model("UserModel", userSchema);
