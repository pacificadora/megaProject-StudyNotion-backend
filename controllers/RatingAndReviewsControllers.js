const RatingAndReviewsModel = require("../models/RatingAndReviewModel");
const CourseModel = require("../models/CourseModel");
const { default: mongoose } = require("mongoose");

//create rating
exports.createRatings = async (req, res) => {
  try {
    //get user id
    const userId = req.user.id;
    //get data from userId
    const { review, rating, courseId } = req.body;
    //check if user is enrolled or not
    const courseDetails = await CourseModel.findOne({
      _id: courseId,
      studentsEnrolled: { $elemMatch: { $eq: userId } },
    });

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: "student is not enrolled in the course",
      });
    }
    //check if user has already reviewed the course
    const alreadyRatingAndReviews = await RatingAndReviewsModel.findOne(
      { user: userId },
      { course: courseId }
    );
    if (alreadyRatingAndReviews) {
      return res.status(400).json({
        success: false,
        message: "course is already reviewed by the user",
      });
    }
    //create review
    const ratingAndReviews = await RatingAndReviewsModel.create({
      rating,
      review,
      course: courseId,
      user: userId,
    });
    //attach with the course
    await CourseModel.findByIdAndUpdate(
      { _id: courseId },
      { $push: { ratingsAndReviews: ratingAndReviews._id } },
      { new: true }
    );
    //return res
    return res.status(201).json({
      success: false,
      message: "rating and reviews created successfully",
      data: ratingAndReviews,
    });
  } catch (error) {
    return res.status(502).json({
      success: false,
      message: "could not create rating and review",
      error: error.message,
    });
  }
};

exports.getAverageRating = async (req, res) => {
  try {
    //get course id
    const courseId = req.body.courseId;
    //calculate avg rating
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "provide a valid course if",
      });
    }
    const result = await CourseModel.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId),
        },
      },
      {
        $group: {
          _id: null, //this is the criteria on which the group must be formed. Null represent no specific criteria hence each and every rating will be considered
          averageRating: { $avg: "$rating" },
        },
      },
    ]);
    if (result.length > 0) {
      return res.status(201).json({
        success: false,
        message: "result found",
        data: result[0].averageRating,
      });
    }
    return res.status(200).json({
      success: true,
      message: "average rating 0. no rating given till now",
    });
    //return response
  } catch (error) {}
};

//this function will give all the rating and reviews irrespective of any criteria
exports.getAllRatingAndReviews = async (req, res) => {
  try {
    const allReviews = await RatingAndReviewsModel.find({})
      .sort({
        rating: "Desc",
      })
      .populate({ path: "user", select: "firstName lastName email image" })
      .populate({ path: "course", select: "courseName" })
      .exec();

    return res.status(201).json({
      success: false,
      message: "all reviews fetched successfully",
      data: allReviews,
    });
  } catch (error) {
    return res.status(502).json({
      success: false,
      message: "ratings cant be found",
    });
  }
};

//HW: course specific rating and review
