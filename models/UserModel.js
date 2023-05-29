const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
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
    active: {
      type: Boolean,
      default: true,
    },
    approved: {
      type: Boolean,
      default: true,
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserModel", userSchema);
