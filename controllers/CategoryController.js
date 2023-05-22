const CategoryModel = require("../models/CategoryModel");

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

exports.getAllCategories = async (req, res) => {
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
