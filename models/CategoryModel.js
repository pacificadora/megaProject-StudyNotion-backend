const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseModel",
    },
  ],
});

module.exports = mongoose.model("CategoryModel", categorySchema);
