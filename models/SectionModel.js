const { default: mongoose } = require("mongoose");

const sectionSchema = new mongoose.Schema({
  sectionName: {
    type: String,
  },
  subSection: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "SubSectionModel",
    },
  ],
});

module.exports = mongoose.model("SectionSchemaModel", sectionSchema);
