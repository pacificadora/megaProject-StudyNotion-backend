const { uploadImageToCloudinary } = require("../utils/imageUploader");
const { SubSectionModel } = require("../models/SubSectionModel");
const SectionModel = require("../models/SectionModel");
exports.createSubSection = async () => {
  try {
    const { description, timeDuration, title, sectionId } = req.body;
    const video = req.files.videoFile;
    if (!description || !timeDuration || !title || !sectionId || !videoFile) {
      return res.status(400).json({
        success: false,
        message: "please provide all info",
      });
    }

    const uploadDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    );

    const subSectionDetails = await SubSectionModel.create({
      title: title,
      timeDuration: `${uploadDetails.duration}`,
      description: description,
      videoUrl: uploadDetails.secure_url,
    });

    const updateSectionDetails = await SectionModel.findByIdAndUpdate(
      { _id: sectionId },
      { $push: { subSection: subSectionDetails._id } },
      { new: true }
    ).populate("subSection");

    //HW: log updated section here, after adding populate query
    return res.status(201).json({
      success: true,
      message: "subsection created successfully",
      data: updateSectionDetails,
    });
  } catch (error) {
    return res.status(502).json({
      success: false,
      message: "something went wrong, cant create the sub section",
    });
  }
};

exports.updateSubSection = async (req, res) => {
  try {
    const { description, title, subSectionId } = req.body;
    const subSection = await SubSection.findById(sectionId);

    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }
    if (title !== undefined) {
      subSection.title = title;
    }

    if (description !== undefined) {
      subSection.description = description;
    }

    if (req.files && req.files.video !== undefined) {
      const video = req.files.video;
      const uploadDetails = await uploadImageToCloudinary(
        video,
        process.env.FOLDER_NAME
      );
      subSection.videoUrl = uploadDetails.secure_url;
      subSection.timeDuration = `${uploadDetails.duration}`;
    }

    await subSection.save();

    return res.json({
      success: true,
      message: "Section updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the section",
    });
  }
};

exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.body;
    await SectionModel.findByIdAndUpdate(sectionId, {
      $pull: { subSection: subSectionId },
    });

    const subSection = await SubSectionModel.findByIdAndDelete({
      _id: subSectionId,
    });
    if (!subSection) {
      return res
        .status(404)
        .json({ success: false, message: "SubSection not found" });
    }
    return res.json({
      success: true,
      message: "SubSection deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the SubSection",
    });
  }
};
