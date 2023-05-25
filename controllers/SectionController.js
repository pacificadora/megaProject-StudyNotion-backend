const SectionModel = require("../models/SectionModel");
const CourseModel = require("../models/CourseModel");
exports.createSection = async (req, res) => {
  try {
    const { sectionName, courseId } = req.body;
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "please provide all info",
      });
    }

    const newSection = await SectionModel.create({ sectionName: sectionName });
    const updateCourseDetails = await CourseModel.findByIdAndUpdate(
      courseId,
      { $push: { courseContent: newSection._id } },
      { new: true }
    ).populate({ path: "courseContent", populate: { path: "subSection" } });

    //HW: how to use populate to replace section/subsection both in the updatedCourseDetails
    return res.status(400).json({
      success: true,
      message: "section created successfully",
      data: updateCourseDetails,
    });
  } catch (error) {
    return res.status(502).json({
      success: false,
      message: "unable to create section, try again",
    });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const { sectionName, sectionId } = req.body;
    if (!sectionName || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "please provide all info",
      });
    }

    const sectionDetails = await SectionModel.findByIdAndUpdate(
      sectionId,
      { sectionName: sectionName },
      { new: true }
    );

    return res.status(201).json({
      success: true,
      message: "section updated successfully",
      sectionDetails,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "something went wrong",
    });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    //get id from params
    const { sectionId } = req.params;
    if (!sectionId) {
      return res.status(400).json({
        success: false,
        message: "please provide all info",
      });
    }

    await SectionModel.findByIdAndDelete(sectionId);
    //TODO[Testing]: do we need to delete the entry from course schema
    return res.status(201).json({
      success: true,
      message: "section deleted successfully",
    });
  } catch (error) {
    return res.status(502).json({
      success: false,
      message: "section cant be deleted, something went wrong",
    });
  }
};
