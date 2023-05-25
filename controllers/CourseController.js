const CourseModel = require("../models/CourseModel");
const CategoryModel = require("../models/CategoryModel");
const UserModel = require("../models/UserModel");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

exports.createCourse = async (req, res) => {
  try {
    //data, validation, instructor validation, Category validation, image stored on cloudinary, entry in db, add course enter in user schema, add course entry in categories
    const { courseName, courseDescription, whatYouWillLearn, price, category } =
      req.body;
    //file
    const thumbnail = req.files.thumbnailImage;
    //validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !category
    ) {
      return res.status(400).json({
        success: false,
        message: "please enter all the details",
      });
    }
    //check for instructor
    const instructorId = req.user.id;
    const instructorDetails = await UserModel.findOne({ instructorId });
    if (!instructorDetails) {
      return res.status(400).json({
        success: false,
        message: "instructor data not found",
      });
    }
    //category validation
    const categoryDetails = await CategoryModel.findById(category);
    if (!categoryDetails) {
      return res.status(400).json({
        success: false,
        message: "category details not found",
      });
    }
    //upload image to cloudinary
    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    //entry create for new course
    const newCourse = await CourseModel.create({
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      category: categoryDetails._id,
      instructor: instructorDetails._id,
      thumbnail: thumbnailImage.secure_url,
    });

    //add new course to the user schema of instructor
    await UserModel.findByIdAndUpdate(
      { _id: instructorDetails._id },
      { $push: { courses: newCourse._id } }
    );

    //update the category schema
    await CategoryModel.findByIdAndUpdate(
      { _id: category },
      { $push: { courses: newCourse._id } }
    );
    return res.status(200).json({
      success: false,
      message: "course created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "something went wrong, course can not be created",
    });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const allCourses = await CourseModel.find(
      {},
      {
        courseName: true,
        price: true,
        category: true,
        thumbnail: true,
        instructor: true,
        ratingsAndReviews: true,
        studentsEnrolled: true,
        courseDescription: true,
        courseContent: true,
      }
    )
      .populate("instructor")
      .exec();

    if (!allCourses) {
      return res.status(400).json({
        success: false,
        message: "courses are not available",
      });
    }
    return res.status(200).json({
      success: true,
      data: allCourses,
      message: "successfully returned all the courses",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "something went wrong",
    });
  }
};

exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "please provide a couese id",
      });
    }
    const courseDetails = await CourseModel.findById({
      _id: courseId,
    })
      .populate({ path: "instructor", populate: { path: "additionalDetails" } })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({ path: "courseContent", populate: { path: "subSection" } })
      .exec();

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: "could not find the course",
      });
    }

    return res.status(201).json({
      success: true,
      message: "courses details fetched successfully",
      data: courseDetails,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "something went wrong",
    });
  }
};
