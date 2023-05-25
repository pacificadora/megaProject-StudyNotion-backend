const CategoryModel = require("../models/CategoryModel");
const CourseModel = require("../models/CourseModel");

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "all fields are required",
      });
    }

    const categoryDetails = await CategoryModel.create({
      name: name,
      description: description,
    });
    return res.status(200).json({
      success: true,
      message: "category created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "category cannot be created, something went wrong",
    });
  }
};

exports.showAllCategories = async (req, res) => {
  try {
    const allCategories = await CategoryModel.find(
      {},
      { name: true, description: true }
    );
    if (!allCategories) {
      return res.status(400).json({
        success: false,
        message: "no category is found",
      });
    }
    return res.status(200).json({
      success: false,
      message: "all categories are returned successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "cannot get categories, something went wrong",
    });
  }
};

exports.categoryPageDetails = async (req, res) => {
  try {
    //get category id
    const { categoryId } = req.body;
    //get courses for specified category
    const selectedCategory = await CategoryModel.findById({ _id: categoryId })
      .populate("courses")
      .exec();
    //validation
    if (!selectedCategory) {
      return res.status(400).json({
        success: false,
        message: "no course with given category",
      });
    }
    //get courses for different categories
    const differentCategory = await CategoryModel.find({
      _id: { $ne: categoryId },
    })
      .populate("course")
      .exec();
    //HW: get top 10 selling course
    //return response
    return res.status(200).json({
      success: true,
      message: "data found",
      data: {
        selectedCategory,
        differentCategory,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong",
      error: error.message,
    });
  }
};
