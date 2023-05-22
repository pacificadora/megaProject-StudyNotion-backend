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
      timeDuration: timeDuration,
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

//HW: update subsection
exports.updateSubSection = async (req, res) => {
  try {
    const { description, timeDuration, title, subSectionId } = req.body;
  } catch (error) {}
};
//HW: delete subsection
