const jwt = require("jsonwebtoken");
require("dotenv").config();
//auth
exports.auth = async (req, res, next) => {
  try {
    const token =
      req.cookies.token ||
      req.body.token ||
      req.headers("authorization").replace("Bearer ", "");

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "token is empty",
      });
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = payload;
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "token is invalid",
      });
    }
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
      message: "something went wrong, while validating the token",
    });
  }
};

//isStudent
exports.isStudent = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Student") {
      return res.status(400).json({
        success: false,
        message: "this is a protected route for students",
      });
    }
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "something went wrong, user role cannot be verified",
    });
  }
};

//isInstructor
exports.isInstructor = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Instructor") {
      return res.status(400).json({
        success: false,
        message: "this is a protected route for Instructor",
      });
    }
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "something went wrong, user role cannot be verified",
    });
  }
};

//isAdmin
exports.admin = async (req, res, next) => {
  try {
    if (req.user.accountType !== "admin") {
      return res.status(400).json({
        success: false,
        message: "this is a protected route for admin",
      });
    }
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "something went wrong, user role cannot be verified",
    });
  }
};
