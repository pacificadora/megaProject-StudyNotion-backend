const { instance } = require("../configs/razorpay");
const CourseModel = require("../models/CourseModel");
const UserModel = require("../models/UserModel");
const mailSender = require("../utils/mailSender");
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");
const mongoose = require("mongoose");

//capture the payment
exports.capturePayment = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;
    if (!userId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "please provide all info",
      });
    }
    const userDetails = await UserModel.findById({ _id: userId });
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "user does not exist",
      });
    }
    const courseDetails = await CourseModel.findById({ _id: courseId });
    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: "course does not exist",
      });
    }

    //check if user has already paid or not
    const uid = new mongoose.Types.ObjectId(userId);
    if (courseDetails.studentsEnrolled.includes(uid)) {
      return res.status(400).json({
        success: false,
        message: "student already enrolled",
      });
    }

    //order details
    const price = courseDetails.price;
    const currency = "INR";
    const options = {
      amount: price * 100,
      currency: currency,
      receipt: Math.random(Date.now().toString()),
      note: {
        courseId: courseId,
        userId,
      },
    };
    try {
      //initiate the payment
      const paymentResponse = await instance.orders.create(options);
      console.log(paymentResponse);
      return res.status(201).json({
        success: true,
        courseName: courseDetails.name,
        courseDescription: courseDetails.courseDescription,
        thumbnail: courseDetails.thumbnail,
        orderId: paymentResponse.id,
        currency: paymentResponse.currency,
        amount: paymentResponse.amount,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        success: false,
        message: "could not initiate",
        error: error.message,
      });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "error in capturing payment",
      error: error.message,
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const webhookSecret = "12345678"; //lets say for time being. server pe stored secret
    const signature = req.headers["x-razorpay-signature"]; //razorpay ka signature/secret

    //HW: to find what is checkSum
    const shaSum = crypto.createHmac("SHA256", webhookSecret);
    shaSum.update(JSON.stringify(req.body));
    const digest = shaSum.digest("hex");

    if (signature === digest) {
      console.log("payment is authorized");
      const { courseId, userId } = req.body.payload.payment.entity.notes;
      try {
        //enroll the student
        const enrollCourse = await CourseModel.findByIdAndUpdate(
          courseId,
          { $push: { studentsEnrolled: userId } },
          { new: true }
        );

        if (!enrollCourse) {
          return res.status(400).json({
            success: false,
            message: "course not found",
          });
        }
        console.log(enrollCourse);

        //find the student and add the course to their list of enrolled courses
        const studentEnrolledCourse = await UserModel.findByIdAndUpdate(
          userId,
          { $push: { courses: courseId } },
          { new: true }
        );
        if (!studentEnrolledCourse) {
          return res.status(400).json({
            success: false,
            message: "user was not found",
          });
        }
        console.log(studentEnrolledCourse);
        const emailResponse = await mailSender(
          studentEnrolledCourse.email,
          "Congratulations from StudyNotion",
          "Congratulation, you are onboard with us"
        );

        return res.status(201).json({
          success: true,
          message: "signature verified and course added",
        });
      } catch (error) {
        return res.status(502).json({
          success: false,
          error: error.message,
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "invalid req",
      });
    }
  } catch (error) {}
};
